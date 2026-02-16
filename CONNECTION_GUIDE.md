# Backend-Frontend Connection Configuration

## 🔗 API Connection Details

### **Backend Server**
- **URL**: https://localhost:8443
- **Protocol**: HTTPS (self-signed certificate)
- **Port**: 8443
- **Base API Path**: /api

### **Authentication**
- **Type**: JWT Bearer Token
- **Header**: Authorization: Bearer {token}
- **Expiry**: 1 hour
- **Storage**: localStorage/sessionStorage

## 📋 Available Endpoints

### **Authentication Endpoints**
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "role": "ADMIN|RESPONDER|CITIZEN"
}

POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ADMIN"
}
```

### **Dashboard Endpoints**
```
GET /api/admin/dashboard
Headers: Authorization: Bearer {token}
Response: Admin dashboard with task statistics

GET /api/responder/dashboard
Headers: Authorization: Bearer {token}
Response: Responder dashboard with assigned tasks

GET /api/citizen/dashboard
Headers: Authorization: Bearer {token}
Response: Citizen dashboard with alerts
```

### **Task Management Endpoints**
```
GET /api/tasks/all (Admin only)
Headers: Authorization: Bearer {token}
Response: All tasks in system

GET /api/tasks/my-tasks (Responder only)
Headers: Authorization: Bearer {token}
Response: Tasks assigned to current responder

POST /api/admin/assign-task (Admin only)
Headers: Authorization: Bearer {token}
{
  "taskDescription": "Emergency flood rescue",
  "responderId": "responder@example.com"
}

PUT /api/responder/update-status (Responder only)
Headers: Authorization: Bearer {token}
{
  "taskId": "1",
  "status": "IN_PROGRESS"
}
```

### **Profile Management Endpoints**
```
GET /api/profile/my
Headers: Authorization: Bearer {token}
Response: Current user's profile

POST /api/profile/create
Headers: Authorization: Bearer {token}
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "region": "New York"
}

PUT /api/profile/update
Headers: Authorization: Bearer {token}
{
  "fullName": "John Smith",
  "phoneNumber": "+0987654321",
  "region": "California"
}
```

## 🔐 Security Implementation

### **HTTPS Certificate Handling**
```javascript
// Angular HTTP Client Configuration
import { HttpClientModule } from '@angular/common/http';

export class HttpService {
  constructor(private http: HttpClient) {
    // Configure to accept self-signed certificates
  }
  
  // Make requests with SSL verification disabled for development
  makeRequest(url: string) {
    return this.http.get(url, {
      // SSL configuration for self-signed certificates
    });
  }
}
```

### **JWT Interceptor**
```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token)
      });
    }
    
    return next.handle(req);
  }
}
```

## 🎯 Frontend Development Guidelines

### **1. Environment Configuration**
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:8443/api',
  sslWarning: true // For self-signed certificate
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com/api',
  sslWarning: false
};
```

### **2. Error Handling**
```typescript
// error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Redirect to login
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Show access denied message
          this.showError('Access denied');
        }
        return throwError(error);
      })
    );
  }
}
```

### **3. Real-time Updates**
```typescript
// task.service.ts
@Injectable()
export class TaskService {
  private taskUpdates = new Subject<Task[]>();
  
  // Poll for updates every 30 seconds
  startRealTimeUpdates() {
    setInterval(() => {
      this.getMyTasks().subscribe(tasks => {
        this.taskUpdates.next(tasks);
      });
    }, 30000);
  }
  
  // Or use WebSocket for real-time
  connectWebSocket() {
    const ws = new WebSocket('wss://localhost:8443/ws');
    ws.onmessage = (event) => {
      const taskUpdate = JSON.parse(event.data);
      this.updateTaskInUI(taskUpdate);
    };
  }
}
```

## 🚨 CORS Configuration

### **Backend Already Configured**
The Spring Boot backend is configured to accept requests from your frontend.

### **Frontend Proxy Configuration**
```json
// proxy.conf.json
{
  "/api": {
    "target": "https://localhost:8443",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 🎯 Development Workflow

### **1. Start Backend**
```bash
cd backend
./mvnw spring-boot:run
# Backend runs on https://localhost:8443
```

### **2. Start Frontend**
```bash
cd frontend
npm install
ng serve --ssl --proxy-config proxy.conf.json
# Frontend runs on http://localhost:4200
```

### **3. Development URL**
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:4200/api (proxied to https://localhost:8443/api)

## 📱 Mobile App Integration

### **API Compatibility**
The same REST APIs work for:
- **React Native**: Mobile apps
- **Flutter**: Cross-platform mobile
- **Ionic**: Hybrid mobile apps
- **Progressive Web Apps**: PWA implementation

### **Authentication Flow**
1. Mobile app sends login request
2. Backend validates and returns JWT
3. Mobile app stores JWT securely
4. All subsequent requests include JWT
5. Token expiry triggers re-authentication

## 🔧 Troubleshooting

### **Common Issues**
1. **SSL Certificate Error**: Accept self-signed certificate in browser
2. **CORS Issues**: Ensure backend allows frontend origin
3. **JWT Expiry**: Implement automatic token refresh
4. **Network Errors**: Show user-friendly error messages

### **Debug Tools**
- Browser DevTools: Network tab for API calls
- Angular CLI: `ng serve --verbose` for detailed logs
- Spring Boot: Check backend logs for errors
