# Disaster Management Alert System - Milestone 1 Documentation

## 🎯 Project Overview

Complete disaster management system foundation with JWT-based authentication, role-based access control, and profile management with location data.

---

## 🏗️ System Architecture

### **Backend Stack**
- **Java 21** - Programming language
- **Spring Boot 3.2.2** - Application framework
- **Spring Security 6** - Authentication & authorization
- **JPA + Hibernate** - Database persistence
- **MySQL 8** - Database server
- **JWT (JSON Web Tokens)** - Stateless authentication
- **BCrypt** - Password hashing
- **Maven** - Build & dependency management

### **Database Design**
```
users table:
- id (PK, auto-increment)
- email (unique, not null)
- password (hashed, not null)
- role (ADMIN/RESPONDER/CITIZEN, not null)

user_profiles table:
- id (PK, auto-increment)
- full_name (not null)
- phone_number
- region (not null)
- user_id (FK to users.id, not null)
```

---

## 🔐 Authentication System

### **User Registration**
- **Endpoint**: `POST /api/auth/register`
- **Input**: Email, password, role (ADMIN/RESPONDER/CITIZEN)
- **Validation**: Email format, password strength, role validation
- **Security**: Password hashed with BCrypt before storage
- **Response**: Created user object with ID

### **User Login**
- **Endpoint**: `POST /api/auth/login`
- **Process**: Email/password verification
- **Token Generation**: JWT with user ID, role, 1-hour expiry
- **Response**: JWT token + user role

### **JWT Token Structure**
```json
{
  "sub": "user@example.com",
  "role": "ADMIN",
  "iat": 1734882105,
  "exp": 1734885705
}
```

---

## 🛡️ Role-Based Access Control (RBAC)

### **User Roles & Permissions**

#### **ADMIN Role**
- **Dashboard Access**: Full system overview
- **User Management**: View/manage all users
- **Task Assignment**: Assign rescue operations to responders
- **System Configuration**: Manage alerts, settings
- **Profile Access**: View any user's profile by region

#### **RESPONDER Role**
- **Dashboard Access**: Assigned operations view
- **Status Updates**: Update rescue operation status
- **Communication**: Coordinate with admin
- **Profile Access**: Manage own profile only

#### **CITIZEN Role**
- **Dashboard Access**: Personal alerts & status
- **Emergency Requests**: Request immediate assistance
- **Location Sharing**: Update region information
- **Profile Access**: Manage own profile only

### **Security Implementation**
- **Method-Level Security**: `@PreAuthorize` annotations
- **Route Guards**: Role-based endpoint protection
- **Custom Access Denied**: Proper 403 error responses
- **JWT Validation**: Token expiration & integrity checks

---

## 📍 Profile Management System

### **Profile Data Model**
```
UserProfile Entity:
- id: Long (Primary Key)
- fullName: String (User's full name)
- phoneNumber: String (Contact number)
- region: String (Geographic location)
- user: User (One-to-one relationship)
```

### **Profile Operations**
- **Create Profile**: `POST /api/profile/create`
- **View Own Profile**: `GET /api/profile/my`
- **Update Profile**: `PUT /api/profile/update`
- **Delete Profile**: `DELETE /api/profile/delete`
- **Admin Functions**: View profiles by user ID or region

### **Location-Based Features**
- **Region Filtering**: Find users in specific disaster areas
- **Targeted Alerts**: Send notifications to affected regions
- **Emergency Response**: Quick identification of impacted citizens

---

## 🔌 API Endpoints Summary

### **Authentication Endpoints**
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |

### **Profile Management Endpoints**
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| POST | `/api/profile/create` | Create user profile | Authenticated |
| GET | `/api/profile/my` | Get own profile | Authenticated |
| PUT | `/api/profile/update` | Update profile | Authenticated |
| DELETE | `/api/profile/delete` | Delete profile | Authenticated |
| GET | `/api/profile/user/{id}` | Get profile by user ID | Admin |
| GET | `/api/profile/region/{region}` | Get profiles by region | Admin |

### **Admin-Only Endpoints**
| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard |
| GET | `/api/admin/users` | View all users |
| POST | `/api/admin/assign-task` | Assign rescue task |

### **Responder-Only Endpoints**
| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/responder/dashboard` | Responder dashboard |
| PUT | `/api/responder/update-status` | Update rescue status |

### **Citizen-Only Endpoints**
| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/citizen/dashboard` | Citizen dashboard |
| POST | `/api/citizen/request-help` | Request emergency help |
| GET | `/api/citizen/alerts` | Get disaster alerts |

---

## 🛠️ Security Implementation Details

### **Password Security**
- **Hashing Algorithm**: BCrypt (industry standard)
- **Salt**: Automatic salt generation
- **Strength**: Configurable rounds (default 10)
- **Storage**: Never plain text passwords

### **JWT Security**
- **Algorithm**: HMAC-SHA256
- **Secret Key**: Configurable in application.properties
- **Expiration**: 1 hour (3600000 ms, configurable)
- **Claims**: User email, role, issue/expiry times

### **Input Validation**
- **Email Validation**: Format and existence checks
- **Password Validation**: Minimum length and complexity
- **Role Validation**: Enum check (ADMIN/RESPONDER/CITIZEN)
- **Sanitization**: Prevent injection attacks

### **Error Handling**
- **401 Unauthorized**: Invalid/missing credentials
- **403 Forbidden**: Insufficient role permissions
- **500 Internal Server**: Validation errors, database issues
- **Custom Responses**: JSON format with clear messages

---

## 🗄️ Database Configuration

### **MySQL Connection**
```properties
spring.datasource.url=jdbc:mysql://localhost:3310/disaster_management
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### **Entity Relationships**
```
User (1) ←→ (1) UserProfile
- One user has one profile
- Profile contains location data for targeted alerts
- Cascade operations maintain data integrity
```

---

## 🧪 Testing Framework

### **Postman Test Suite**
- **25+ Test Cases**: Complete coverage of all functionality
- **Environment Variables**: Easy token management
- **Test Phases**: Registration → Login → Profile → Role Access → Security
- **Expected Responses**: Clear success/error criteria for each test

### **Test Categories**
1. **Authentication Tests**: Registration, login, validation
2. **Profile Management**: CRUD operations with location data
3. **Role-Based Access**: Verify 403 errors for unauthorized access
4. **Security Tests**: Invalid tokens, missing headers, malformed requests

---

## 📊 Performance & Scalability

### **Current Optimizations**
- **Connection Pooling**: HikariCP for database connections
- **Query Optimization**: JPA-generated efficient SQL
- **JWT Stateless**: No server-side session storage
- **Caching Ready**: Spring Cache abstraction available

### **Scalability Considerations**
- **Horizontal Scaling**: Multiple application instances supported
- **Database Scaling**: Read replicas for disaster scenarios
- **CDN Ready**: Static assets can be distributed
- **Load Balancer**: Stateless JWT authentication compatible

---

## 🚀 Deployment Configuration

### **Production Setup**
- **Server**: Embedded Tomcat (configurable port)
- **Database**: MySQL with connection pooling
- **Security**: HTTPS-ready configuration
- **Monitoring**: Spring Boot Actuator endpoints available

### **Environment Variables**
```properties
# JWT Configuration
jwt.secret=mySecretKeyForDisasterManagementSystem123456789
jwt.expiration=3600000

# Server Configuration
server.port=8082
```

---

## 📚 Development Guidelines

### **Code Standards**
- **Java 21**: Modern language features
- **Spring Boot 3**: Latest framework best practices
- **JPA Annotations**: Standard persistence layer
- **Security First**: Authentication in all endpoints
- **Error Handling**: Consistent JSON responses

### **Git Workflow**
- **Feature Branches**: Separate branches for new features
- **Pull Requests**: Code review before merge
- **Semantic Commits**: Clear commit messages
- **Documentation**: Updated with API changes

---

## 🎯 Milestone 1 Success Criteria

### ✅ **All Requirements Met**
1. **JWT-Based Authentication**: Complete with secure token generation
2. **Role-Based Access Control**: Three roles with proper permissions
3. **Profile Setup with Location**: User profiles with region data
4. **Security Best Practices**: Password hashing, input validation, HTTPS ready
5. **Comprehensive Testing**: Full test suite with documented results
6. **Production Ready**: Scalable architecture with proper error handling

### 🚀 **Ready for Milestone 2**
Foundation complete for implementing:
- Real-time disaster alerts
- Emergency response coordination
- Multi-channel notifications
- Advanced location-based services
- Disaster severity classification

---

## 📞 Support & Maintenance

### **Troubleshooting Guide**
- **Database Issues**: Connection troubleshooting, schema validation
- **Authentication Problems**: Token management, role validation
- **Performance Issues**: Query optimization, connection tuning
- **Security Issues**: CORS configuration, header validation

### **Future Enhancements**
- **Token Refresh**: Automatic token renewal
- **Multi-Factor Auth**: Enhanced security
- **Audit Logging**: Complete activity tracking
- **API Versioning**: Backward compatibility maintenance

---

**Milestone 1 Complete - Production-Ready Disaster Management Foundation** 🎉

*Next: Implement real-time alert system and emergency response coordination features*
