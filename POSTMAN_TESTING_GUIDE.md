# Postman Testing Guide - Disaster Management System Milestone 1

## 📋 Setup Instructions

### 1. Environment Variables
Create an environment in Postman with the following variables:

```
baseUrl = http://localhost:8082
adminToken = [leave empty initially]
responderToken = [leave empty initially]
citizenToken = [leave empty initially]
adminId = [leave empty initially]
responderId = [leave empty initially]
citizenId = [leave empty initially]
```

### 2. Headers Setup
For each request, set:
- `Content-Type`: `application/json`
- `Authorization`: `Bearer {{token}}` (for protected endpoints)

---

## 🧪 Step-by-Step Testing

### **PHASE 1: USER REGISTRATION**

#### Test 1.1: Register Admin User
```
Method: POST
URL: {{baseUrl}}/api/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@disaster.com",
  "password": "admin123",
  "role": "ADMIN"
}
Expected Response:
Status: 200 OK
Body: User object with ID, email, and role
```

#### Test 1.2: Register Responder User
```
Method: POST
URL: {{baseUrl}}/api/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "responder@disaster.com",
  "password": "resp123",
  "role": "RESPONDER"
}
Expected Response:
Status: 200 OK
Body: User object with ID, email, and role
```

#### Test 1.3: Register Citizen User
```
Method: POST
URL: {{baseUrl}}/api/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "citizen@disaster.com",
  "password": "cit123",
  "role": "CITIZEN"
}
Expected Response:
Status: 200 OK
Body: User object with ID, email, and role
```

#### Test 1.4: Test Duplicate Registration (Should Fail)
```
Method: POST
URL: {{baseUrl}}/api/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@disaster.com",
  "password": "admin123",
  "role": "ADMIN"
}
Expected Response:
Status: 500 Internal Server Error
Body: "Email already exists"
```

#### Test 1.5: Test Invalid Role (Should Fail)
```
Method: POST
URL: {{baseUrl}}/api/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "invalid@disaster.com",
  "password": "test123",
  "role": "INVALID_ROLE"
}
Expected Response:
Status: 500 Internal Server Error
Body: "Invalid role. Must be ADMIN, RESPONDER, or CITIZEN"
```

---

### **PHASE 2: USER LOGIN**

#### Test 2.1: Admin Login
```
Method: POST
URL: {{baseUrl}}/api/auth/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@disaster.com",
  "password": "admin123"
}
Expected Response:
Status: 200 OK
Body: 
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ADMIN"
}
Action: Copy the token value and save it as adminToken environment variable
```

#### Test 2.2: Responder Login
```
Method: POST
URL: {{baseUrl}}/api/auth/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "responder@disaster.com",
  "password": "resp123"
}
Expected Response:
Status: 200 OK
Body: 
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "RESPONDER"
}
Action: Copy the token value and save it as responderToken environment variable
```

#### Test 2.3: Citizen Login
```
Method: POST
URL: {{baseUrl}}/api/auth/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "citizen@disaster.com",
  "password": "cit123"
}
Expected Response:
Status: 200 OK
Body: 
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "CITIZEN"
}
Action: Copy the token value and save it as citizenToken environment variable
```

#### Test 2.4: Test Invalid Login (Should Fail)
```
Method: POST
URL: {{baseUrl}}/api/auth/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@disaster.com",
  "password": "wrongpassword"
}
Expected Response:
Status: 401 Unauthorized
```

---

### **PHASE 3: PROFILE MANAGEMENT**

#### Test 3.1: Create Admin Profile
```
Method: POST
URL: {{baseUrl}}/api/profile/create
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{adminToken}}
Body (raw JSON):
{
  "fullName": "John Admin",
  "phoneNumber": "+1234567890",
  "region": "New York"
}
Expected Response:
Status: 200 OK
Body: UserProfile object with full details
```

#### Test 3.2: Create Responder Profile
```
Method: POST
URL: {{baseUrl}}/api/profile/create
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{responderToken}}
Body (raw JSON):
{
  "fullName": "Jane Responder",
  "phoneNumber": "+1234567891",
  "region": "California"
}
Expected Response:
Status: 200 OK
Body: UserProfile object with full details
```

#### Test 3.3: Create Citizen Profile
```
Method: POST
URL: {{baseUrl}}/api/profile/create
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{citizenToken}}
Body (raw JSON):
{
  "fullName": "Bob Citizen",
  "phoneNumber": "+1234567892",
  "region": "Texas"
}
Expected Response:
Status: 200 OK
Body: UserProfile object with full details
```

#### Test 3.4: Get Own Profile (Admin)
```
Method: GET
URL: {{baseUrl}}/api/profile/my
Headers: 
  Authorization: Bearer {{adminToken}}
Expected Response:
Status: 200 OK
Body: Admin's profile details
```

#### Test 3.5: Get Own Profile (Citizen)
```
Method: GET
URL: {{baseUrl}}/api/profile/my
Headers: 
  Authorization: Bearer {{citizenToken}}
Expected Response:
Status: 200 OK
Body: Citizen's profile details
```

#### Test 3.6: Update Profile (Citizen)
```
Method: PUT
URL: {{baseUrl}}/api/profile/update
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{citizenToken}}
Body (raw JSON):
{
  "fullName": "Bob Citizen Updated",
  "phoneNumber": "+1234567892",
  "region": "Texas"
}
Expected Response:
Status: 200 OK
Body: Updated profile details
```

---

### **PHASE 4: ROLE-BASED ACCESS CONTROL**

#### Test 4.1: Admin Dashboard Access (Success)
```
Method: GET
URL: {{baseUrl}}/api/admin/dashboard
Headers: 
  Authorization: Bearer {{adminToken}}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Admin Dashboard",
  "user": "admin@disaster.com",
  "role": "ADMIN",
  "access": "Full system control - manage users, assign tasks, configure alerts"
}
```

#### Test 4.2: Admin Dashboard Access (Responder - Should Fail)
```
Method: GET
URL: {{baseUrl}}/api/admin/dashboard
Headers: 
  Authorization: Bearer {{responderToken}}
Expected Response:
Status: 403 Forbidden
Body: "Access Denied"
```

#### Test 4.3: Admin Dashboard Access (Citizen - Should Fail)
```
Method: GET
URL: {{baseUrl}}/api/admin/dashboard
Headers: 
  Authorization: Bearer {{citizenToken}}
Expected Response:
Status: 403 Forbidden
Body: "Access Denied"
```

#### Test 4.4: Responder Dashboard Access (Success)
```
Method: GET
URL: {{baseUrl}}/api/responder/dashboard
Headers: 
  Authorization: Bearer {{responderToken}}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Responder Dashboard",
  "user": "responder@disaster.com",
  "role": "RESPONDER",
  "access": "View assigned rescue operations, update status, communicate with admin"
}
```

#### Test 4.5: Responder Dashboard Access (Admin - Should Fail)
```
Method: GET
URL: {{baseUrl}}/api/responder/dashboard
Headers: 
  Authorization: Bearer {{adminToken}}
Expected Response:
Status: 403 Forbidden
Body: "Access Denied"
```

#### Test 4.6: Citizen Dashboard Access (Success)
```
Method: GET
URL: {{baseUrl}}/api/citizen/dashboard
Headers: 
  Authorization: Bearer {{citizenToken}}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Citizen Dashboard",
  "user": "citizen@disaster.com",
  "role": "CITIZEN",
  "access": "View disaster alerts, request emergency help, share location"
}
```

---

### **PHASE 5: ADMIN-SPECIFIC FUNCTIONALITIES**

#### Test 5.1: View All Users (Admin Only)
```
Method: GET
URL: {{baseUrl}}/api/admin/users
Headers: 
  Authorization: Bearer {{adminToken}}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "All users list - Admin only access",
  "action": "View and manage all system users"
}
```

#### Test 5.2: Assign Rescue Task (Admin Only)
```
Method: POST
URL: {{baseUrl}}/api/admin/assign-task
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{adminToken}}
Body (raw JSON):
{
  "responderId": "responder@disaster.com",
  "taskDescription": "Emergency evacuation at downtown area"
}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Rescue task assigned successfully",
  "assignedTo": "responder@disaster.com",
  "task": "Emergency evacuation at downtown area",
  "assignedBy": "Admin"
}
```

#### Test 5.3: Get Profile by Region (Admin Only)
```
Method: GET
URL: {{baseUrl}}/api/profile/region/Texas
Headers: 
  Authorization: Bearer {{adminToken}}
Expected Response:
Status: 200 OK
Body: Array of profiles from Texas region
```

---

### **PHASE 6: RESPONDER-SPECIFIC FUNCTIONALITIES**

#### Test 6.1: Update Rescue Status (Responder Only)
```
Method: PUT
URL: {{baseUrl}}/api/responder/update-status
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{responderToken}}
Body (raw JSON):
{
  "taskId": "TASK-001",
  "status": "COMPLETED"
}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Rescue status updated successfully",
  "taskId": "TASK-001",
  "status": "COMPLETED",
  "updatedBy": "Responder"
}
```

---

### **PHASE 7: CITIZEN-SPECIFIC FUNCTIONALITIES**

#### Test 7.1: Request Emergency Help (Citizen Only)
```
Method: POST
URL: {{baseUrl}}/api/citizen/request-help
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{citizenToken}}
Body (raw JSON):
{
  "location": "123 Main Street, Texas",
  "emergencyType": "FLOOD"
}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Emergency help request received",
  "location": "123 Main Street, Texas",
  "emergencyType": "FLOOD",
  "status": "Request forwarded to responders"
}
```

#### Test 7.2: Get Disaster Alerts (Citizen Only)
```
Method: GET
URL: {{baseUrl}}/api/citizen/alerts
Headers: 
  Authorization: Bearer {{citizenToken}}
Expected Response:
Status: 200 OK
Body: 
{
  "message": "Disaster alerts for your region",
  "alerts": "Flood warning: High water levels in your area",
  "action": "Move to higher ground immediately"
}
```

---

### **PHASE 8: SECURITY TESTS**

#### Test 8.1: Access Without Token (Should Fail)
```
Method: GET
URL: {{baseUrl}}/api/admin/dashboard
Headers: (no Authorization header)
Expected Response:
Status: 401 Unauthorized
```

#### Test 8.2: Access With Invalid Token (Should Fail)
```
Method: GET
URL: {{baseUrl}}/api/admin/dashboard
Headers: 
  Authorization: Bearer invalid_token_here
Expected Response:
Status: 401 Unauthorized
```

#### Test 8.3: Access Protected Endpoint Without Profile (Should Fail)
```
Method: GET
URL: {{baseUrl}}/api/profile/my
Headers: 
  Authorization: Bearer {{adminToken}}
(Note: This should work since we created profiles in Phase 3)
Expected Response:
Status: 200 OK (if profile exists) or 500 (if no profile)
```

---

## 📊 Test Results Checklist

### Authentication Tests
- [ ] Admin registration successful
- [ ] Responder registration successful
- [ ] Citizen registration successful
- [ ] Duplicate registration fails
- [ ] Invalid role fails
- [ ] Admin login successful
- [ ] Responder login successful
- [ ] Citizen login successful
- [ ] Invalid login fails

### Profile Management Tests
- [ ] Admin profile creation successful
- [ ] Responder profile creation successful
- [ ] Citizen profile creation successful
- [ ] Profile retrieval successful
- [ ] Profile update successful

### Role-Based Access Tests
- [ ] Admin can access admin endpoints
- [ ] Admin cannot access responder/citizen endpoints
- [ ] Responder can access responder endpoints
- [ ] Responder cannot access admin/citizen endpoints
- [ ] Citizen can access citizen endpoints
- [ ] Citizen cannot access admin/responder endpoints

### Security Tests
- [ ] Access without token fails
- [ ] Access with invalid token fails
- [ ] Cross-role access fails

---

## 🔧 Troubleshooting Tips

### Common Issues:
1. **401 Unauthorized**: Check if token is valid and properly formatted
2. **403 Forbidden**: Check if user has correct role for the endpoint
3. **500 Internal Server Error**: Check request body format and required fields
4. **Connection Refused**: Ensure Spring Boot application is running on port 8082

### Token Management:
- Tokens expire after 1 hour (configurable)
- Copy tokens immediately after login
- Refresh tokens by logging in again if expired

### Database Issues:
- Ensure MySQL is running on port 3310
- Check database connection settings in application.properties
- Verify database schema is created automatically

---

## 🎯 Success Criteria

Milestone 1 is successfully implemented when:
1. ✅ All three user roles can register and login
2. ✅ JWT tokens are generated and validated properly
3. ✅ Role-based access control prevents unauthorized access
4. ✅ Profile management works with location data
5. ✅ All security measures are functioning
6. ✅ Error handling works as expected

You're now ready to test the complete Milestone 1 implementation!
