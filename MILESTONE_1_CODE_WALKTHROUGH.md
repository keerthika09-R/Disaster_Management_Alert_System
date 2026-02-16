# Milestone 1 Code Walkthrough (Simple + Clear)

This document explains **Milestone 1** implementation in a simple way, with **real code snippets** from this project.

Milestone 1 contains:
- **JWT-based Authentication** (Register + Login)
- **Role-Based Access Control (RBAC)** (ADMIN / RESPONDER / CITIZEN)
- **Profile setup with Location (region)**
- **Location-based Alerts** (alerts filtered by region)

---

## 1) Big picture flow (End-to-End)

### A) Registration (frontend → backend)
1. User fills:
   - `fullName`, `email`, `password`, `phoneNumber`, `region`, `role`
   - `secretKey` only if role is **ADMIN** or **RESPONDER**
2. Frontend calls:
   - `POST /api/auth/register`
3. Backend:
   - hashes password
   - saves `User`
   - creates `UserProfile` linked to the user

### B) Login (frontend → backend)
1. User enters `email + password`
2. Frontend calls:
   - `POST /api/auth/login`
3. Backend:
   - verifies credentials
   - generates JWT token with:
     - subject = user email
     - claim `role`
     - expiry time
4. Frontend stores:
   - `jwt_token`, `user_role`, `user_email` in `localStorage`

### C) Every protected request
1. Frontend automatically attaches:
   - `Authorization: Bearer <jwt_token>`
2. Backend filter validates token and sets authenticated user in Spring Security context.

### D) Dashboard based on role
- ADMIN: manage tasks/users/alerts
- RESPONDER: my tasks + alerts in their region
- CITIZEN: alerts in their region

---

## 2) Backend: Authentication APIs

### 2.1 AuthController (endpoints)
**File:** `backend/src/main/java/com/example/demo/controller/AuthController.java`

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

- **Register** returns the created `User`
- **Login** returns `JwtResponse` containing the token and role

---

### 2.2 AuthService.register() (hash password + save profile)
**File:** `backend/src/main/java/com/example/demo/service/AuthService.java`

Important parts:
- Validates role
- Validates secret key for ADMIN/RESPONDER
- Uses `BCrypt` encoder
- Creates user profile with region

```java
user.setPassword(passwordEncoder.encode(request.getPassword()));
user.setRole(normalizedRole);
User savedUser = userService.saveUser(user);

UserProfile profile = new UserProfile();
profile.setUser(savedUser);
profile.setFullName(request.getFullName() != null ? request.getFullName() : "");
profile.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "");
profile.setRegion(request.getRegion() != null ? request.getRegion() : "");

userProfileRepository.save(profile);
```

**Teaching point:** password is never stored as plain text.

---

### 2.3 AuthService.login() (JWT generation)
**File:** `backend/src/main/java/com/example/demo/service/AuthService.java`

```java
Authentication authentication = authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(
        request.getEmail().trim(),
        request.getPassword()
    )
);

User user = userService.findByEmail(request.getEmail().trim())
    .orElseThrow(() -> new RuntimeException("User not found"));

String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
return new JwtResponse(token, user.getRole());
```

---

## 3) Backend: JWT Creation + Validation

### 3.1 JwtUtil (generate token + claims)
**File:** `backend/src/main/java/com/example/demo/security/JwtUtil.java`

```java
public String generateToken(String email, String role) {
    Date expiryDate = new Date(System.currentTimeMillis() + jwtExpiration);

    return Jwts.builder()
            .setSubject(email)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
}
```

- `sub` (subject) = email
- `role` is stored as a custom claim
- expiry = `jwt.expiration` (default 1 hour)

---

### 3.2 JwtFilter (protect requests)
**File:** `backend/src/main/java/com/example/demo/security/JwtFilter.java`

```java
String header = request.getHeader("Authorization");

if (header != null && header.startsWith("Bearer ")) {
    String token = header.substring(7);

    if (jwtUtil.validateToken(token)) {
        String email = jwtUtil.extractEmail(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }
}

filterChain.doFilter(request, response);
```

**Simple meaning:**
- If request has token → validate → set authenticated user.
- Without token → request is treated as unauthenticated.

---

## 4) Backend: SecurityConfig (RBAC)

**File:** `backend/src/main/java/com/example/demo/security/SecurityConfig.java`

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .requestMatchers("/api/responder/**").hasRole("RESPONDER")
    .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
    .requestMatchers("/api/profile/**").authenticated()
    .anyRequest().permitAll())
.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
```

Additionally, controllers use `@PreAuthorize` for fine control.

---

## 5) Backend: Profile (Location data)

### 5.1 Get my profile (region)
**File:** `backend/src/main/java/com/example/demo/controller/ProfileController.java`

```java
@GetMapping("/my")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UserProfile> getMyProfile(Authentication authentication) {
    String userEmail = authentication.getName();
    User user = userService.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return ResponseEntity.ok(profileService.getProfileByUser(user)
            .orElseThrow(() -> new RuntimeException("Profile not found")));
}
```

**Why this matters:** This is how we know the user’s `region` for location-based alerts.

---

## 6) Backend: Alerts (Location-based)

**File:** `backend/src/main/java/com/example/demo/controller/AlertController.java`

### 6.1 Admin creates alerts
```java
@PostMapping("/create")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Alert> createAlert(@RequestBody Map<String, String> request, Authentication authentication) {
    String region = request.get("region");
    String message = request.get("message");
    String severity = request.get("severity");
    String createdBy = authentication.getName();

    return ResponseEntity.ok(alertService.createAlert(region, message, severity, createdBy));
}
```

### 6.2 Fetch alerts by region
```java
@GetMapping("/region/{region}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<List<Alert>> getAlertsByRegion(@PathVariable String region) {
    return ResponseEntity.ok(alertService.getAlertsByRegion(region));
}
```

**Simple meaning:** only users from that region should see those alerts.

---

## 7) Backend: Tasks (RBAC example)

**File:** `backend/src/main/java/com/example/demo/controller/TaskController.java`

### 7.1 ADMIN gets all tasks
```java
@GetMapping("/all")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<Task>> getAllTasks() {
    return ResponseEntity.ok(taskService.getAllTasks());
}
```

### 7.2 RESPONDER gets only their tasks
```java
@GetMapping("/my-tasks")
@PreAuthorize("hasRole('RESPONDER')")
public ResponseEntity<List<Task>> getMyTasks(Authentication authentication) {
    String responderEmail = authentication.getName();
    return ResponseEntity.ok(taskService.getTasksForResponder(responderEmail));
}
```

---

## 8) Frontend: JWT attach to every request

### 8.1 Angular AuthInterceptor
**File:** `frontend/src/app/interceptors/auth.interceptor.ts`

```ts
const token = localStorage.getItem('jwt_token');

if (token) {
  req = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + token)
  });
}
```

**Simple meaning:** After login, every API call automatically contains the JWT.

---

## 9) Frontend: Register + Login

### 9.1 Register sends profile + role + secretKey
**File:** `frontend/src/app/components/register.component.ts`

```ts
const registerData = {
  fullName: this.fullName,
  email: this.email,
  password: this.password,
  role: this.role,
  phoneNumber: this.phoneNumber,
  region: this.region,
  secretKey: (this.role === 'ADMIN' || this.role === 'RESPONDER') ? this.secretKey : null
};

this.http.post('http://localhost:8443/api/auth/register', registerData, {
  headers: { 'Content-Type': 'application/json' }
}).subscribe(...);
```

### 9.2 Login stores token + role
**File:** `frontend/src/app/components/login.component.ts`

```ts
this.http.post('http://localhost:8443/api/auth/login', loginData, {
  headers: { 'Content-Type': 'application/json' }
}).subscribe({
  next: (response: any) => {
    if (response.token) {
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('user_role', response.role);
      localStorage.setItem('user_email', this.email);
    }

    this.router.navigate(['/dashboard']);
  }
});
```

---

## 10) Frontend: Dashboard (RBAC + Location-based alerts)

**File:** `frontend/src/app/components/dashboard.component.ts`

### 10.1 Role-based UI (tabs)
```html
<button *ngIf="userRole === 'ADMIN'">Overview</button>
<button *ngIf="userRole === 'RESPONDER'">My Tasks</button>
<button *ngIf="userRole !== 'ADMIN'">My Alerts</button>
```

### 10.2 Load alerts based on user region
```ts
this.http.get('http://localhost:8443/api/profile/my').subscribe({
  next: (profile: any) => {
    this.userRegion = profile?.region || '';
    this.http.get(`http://localhost:8443/api/alerts/region/${encodeURIComponent(this.userRegion)}`)
      .subscribe(...);
  }
});
```

---

## 11) What to demonstrate in class (simple script)

- **Register** as CITIZEN with region = `North`
- **Login** → token stored
- **Admin** creates alert for region `North`
- **Citizen** dashboard loads profile → loads alerts by region → sees the alert

---

## 12) Security Best Practices (quick notes)

- Do not store plain passwords → `BCryptPasswordEncoder`
- JWT secret should be strong and private → `jwt.secret` in config
- Token should expire → `jwt.expiration`
- Restrict API access by roles → `@PreAuthorize` + security config

---

If you want, I can also add a **sequence diagram** (Register/Login/Alerts) in this same document.
