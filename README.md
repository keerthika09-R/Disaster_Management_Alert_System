# Disaster Management Alert System - Milestone 1

## Overview
Milestone 1 implements the foundation of the Disaster Management Alert System with JWT-based authentication, role-based access control, and profile management with location data.

## Features Implemented

### 1. JWT-Based Authentication
- **User Registration**: Users can register with email, password, and role (ADMIN, RESPONDER, CITIZEN)
- **User Login**: Secure authentication with JWT token generation
- **Password Security**: Passwords are hashed using BCrypt before storing
- **Token Validation**: JWT tokens contain user ID, role, and expiry time

### 2. Role-Based Access Control (RBAC)
Three user roles with specific permissions:

#### **Admin**
- Controls system configuration
- Assigns rescue tasks to responders
- Manages responders and alerts
- Full access to all user profiles and system data

#### **Responder**
- Views assigned rescue operations
- Updates rescue status
- Communicates with admin
- Limited access to relevant operations

#### **Citizen**
- Views disaster alerts
- Requests emergency help
- Shares location information
- Manages own profile

### 3. Profile Management with Location Data
- **Profile Creation**: Users can create profiles with full name, phone number, and region
- **Location-Based Filtering**: System can filter users by region for targeted alerts
- **Profile Updates**: Users can update their profile information
- **Admin Access**: Admins can view profiles by region and user ID

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Profile Management
- `POST /api/profile/create` - Create user profile
- `GET /api/profile/my` - Get current user's profile
- `PUT /api/profile/update` - Update user profile
- `DELETE /api/profile/delete` - Delete user profile
- `GET /api/profile/user/{userId}` - Get profile by user ID (Admin only)
- `GET /api/profile/region/{region}` - Get profiles by region (Admin only)

### Role-Specific Endpoints

#### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - View all users
- `POST /api/admin/assign-task` - Assign rescue tasks

#### Responder Endpoints
- `GET /api/responder/dashboard` - Responder dashboard
- `PUT /api/responder/update-status` - Update rescue operation status

#### Citizen Endpoints
- `GET /api/citizen/dashboard` - Citizen dashboard
- `POST /api/citizen/request-help` - Request emergency help
- `GET /api/citizen/alerts` - Get disaster alerts

## Security Features

### JWT Implementation
- Secure token generation with HMAC-SHA256
- Configurable token expiration (default 1 hour)
- Role information embedded in tokens
- Proper token validation and error handling

### Access Control
- Method-level security with @PreAuthorize annotations
- Custom access denied handler
- Role-based endpoint protection
- Authentication required for all protected endpoints

### Password Security
- BCrypt password hashing
- Never store plain text passwords
- Secure password validation during login

## Database Configuration

### MySQL Settings
- **Host**: localhost
- **Port**: 3310
- **Database**: disaster_management
- **Username**: root
- **Password**: root

### Entity Relationships
- **User**: Basic user information with role
- **UserProfile**: Extended profile with location data
- One-to-one relationship between User and UserProfile

## Getting Started

### Prerequisites
- Java 21
- MySQL Server running on port 3310
- Maven

### Database Setup
1. Create MySQL database: `disaster_management`
2. Ensure MySQL is running on port 3310 with root/root credentials

### Running the Application
1. Clone the repository
2. Navigate to the project directory
3. Run: `mvn spring-boot:run`

### Testing the System

#### 1. Register Users
```bash
# Register Admin
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@disaster.com","password":"admin123","role":"ADMIN"}'

# Register Responder
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"responder@disaster.com","password":"resp123","role":"RESPONDER"}'

# Register Citizen
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@disaster.com","password":"cit123","role":"CITIZEN"}'
```

#### 2. Login and Get JWT Token
```bash
# Login as Admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@disaster.com","password":"admin123"}'
```

#### 3. Access Protected Endpoints
```bash
# Access Admin Dashboard (replace TOKEN with actual JWT)
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer TOKEN"
```

## Security Best Practices Implemented

1. **HTTPS Ready**: Configuration supports HTTPS deployment
2. **Secure JWT Secret**: Configurable JWT secret key
3. **Input Validation**: All inputs are validated
4. **Token Expiry**: JWT tokens have configurable expiration
5. **Role Authorization**: Strict role-based access control
6. **Error Handling**: Proper error responses without information leakage

## Next Steps

This foundation provides:
- Secure user authentication
- Role-based permissions
- Location-based user management
- Ready for disaster alert features
- Extensible architecture for additional features

The system is now ready for Milestone 2 implementation, which will include disaster alert management, notification systems, and emergency response coordination.
