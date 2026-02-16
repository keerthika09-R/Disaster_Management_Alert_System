# Disaster Management Frontend

## 🎯 Project Overview
Frontend application for Disaster Management Alert System

## 🛠️ Technology Stack
- **Framework**: Angular (recommended)
- **Language**: TypeScript/JavaScript
- **Styling**: Angular Material/Tailwind CSS
- **Build Tool**: Angular CLI
- **Package Manager**: npm/yarn

## 📁 Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── models/             # Data models
│   │   ├── guards/             # Route guards
│   │   └── interceptors/       # HTTP interceptors
│   ├── assets/                 # Static assets
│   ├── environments/           # Environment configs
│   └── styles/                # Global styles
├── angular.json               # Angular configuration
├── package.json              # Dependencies
└── tsconfig.json            # TypeScript config
```

## 🔌 API Integration

### **Backend Connection**
- **Base URL**: https://localhost:8443/api
- **Authentication**: JWT Bearer tokens
- **HTTPS**: Accept self-signed certificates

### **Key Services**
- **AuthService**: Login, register, token management
- **TaskService**: Task CRUD operations
- **ProfileService**: User profile management
- **DashboardService**: Dashboard data

## 🎯 Features to Implement

### **1. Authentication Module**
- Login page
- Registration page  
- Token storage
- Auto-logout on token expiry

### **2. Dashboard Module**
- Admin dashboard with task management
- Responder dashboard with assigned tasks
- Citizen dashboard with alerts

### **3. Task Management Module**
- Task list view
- Task status updates
- Real-time updates

### **4. Profile Management Module**
- Profile creation/edit
- Location management
- Contact information

## 🔐 Security Implementation

### **JWT Token Management**
- Token storage in localStorage/sessionStorage
- Automatic token refresh
- Request interceptors for auth headers

### **Route Guards**
- Admin-only routes protection
- Responder-only routes protection
- Citizen-only routes protection

## 🎨 UI/UX Guidelines

### **Design Principles**
- Mobile-responsive design
- Accessibility compliance
- Disaster emergency color schemes
- Clear information hierarchy

### **Components Needed**
- Alert cards
- Task status badges
- Location maps integration
- Emergency contact forms

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+
- Angular CLI 15+
- npm or yarn

### **Setup Commands**
```bash
cd frontend
npm install
ng serve --ssl
```

## 📱 Responsive Design

### **Breakpoints**
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

### **Priority Features**
- Emergency alerts (always visible)
- Quick task status updates
- One-click emergency requests

## 🔗 Backend Integration Notes

### **CORS Configuration**
- Backend configured for frontend origin
- HTTPS certificate handling
- Error handling for network issues

### **Real-time Features**
- WebSocket connections for live updates
- Push notifications for task changes
- Status synchronization across devices
