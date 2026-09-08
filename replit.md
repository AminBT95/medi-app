# MediRappel - Medication Reminder Application

## Overview

MediRappel is a comprehensive medication reminder application designed for elderly patients with multiple user interfaces tailored to different stakeholders. The application features a patient-facing mobile interface for medication tracking, a pharmacy management system, and a medical professional interface for prescription management.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL storage

### Multi-Interface Design
The application supports multiple user interfaces:
1. **Patient Interface** (`/`) - Mobile-first design for elderly users
2. **Pharmacy ERP** (`/pharmacy`) - Comprehensive pharmacy management
3. **Doctor Interface** (`/doctor`) - Quick prescription management
4. **Demo Interface** (`/demo`) - Centralized system demonstration

## Key Components

### Database Schema
- **Patient Management**: medications, medicationHistory, doctors, symptoms tables
- **Pharmacy Management**: pharmacies, pharmacyUsers, products, inventory, sales, prescriptions
- **Authentication**: JWT-based authentication with role-based access control
- **Audit**: Complete audit logging for compliance

### Authentication System
- JWT token-based authentication
- Role-based access control (pharmacist, assistant, patient)
- Password hashing with bcrypt
- Session management for persistent login

### Frontend Features
- **Multi-language Support**: French and English with i18n system
- **Responsive Design**: Mobile-first approach optimized for elderly users
- **Accessibility**: Large fonts, high contrast, simplified navigation
- **Offline Capability**: Service worker for PWA functionality
- **Push Notifications**: Browser notifications for medication reminders

### Backend API Structure
- RESTful API endpoints for all entities
- Separate route handlers for different user types
- Comprehensive error handling and validation
- Database connection pooling and transaction management

## Data Flow

### Patient Flow
1. Patients view daily medication reminders on the home screen
2. They can mark medications as taken or missed
3. Historical data is tracked for adherence monitoring
4. Symptoms can be logged for medical reference

### Pharmacy Flow
1. Pharmacists manage inventory and product catalog
2. Customer prescriptions are processed and tracked
3. Sales analytics and reporting are generated
4. Integration with suppliers for stock management

### Medical Professional Flow
1. Doctors can quickly prescribe medications
2. Patient medication history is accessible
3. Symptoms and adherence data inform treatment decisions

## External Dependencies

### Database
- **PostgreSQL**: Primary database with connection pooling
- **Drizzle ORM**: Type-safe database queries and migrations
- **@neondatabase/serverless**: Serverless PostgreSQL driver

### Authentication & Security
- **jsonwebtoken**: JWT token generation and validation
- **bcryptjs**: Password hashing and verification
- **express-session**: Session management

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form validation and management
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Icon library for consistent UI

### UI Components
- **@radix-ui**: Accessible UI component primitives
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class merging utility

## Deployment Strategy

### Development
- **Development Server**: Vite dev server with HMR
- **API Server**: Express with tsx for TypeScript execution
- **Database**: PostgreSQL with Drizzle migrations

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: ESBuild compilation to ESM modules
- **Database**: Automated migrations with Drizzle Kit

### Environment Configuration
- Database URL configuration via environment variables
- JWT secret configuration for security
- Multi-environment support (development/production)

### Progressive Web App
- Service worker for offline functionality
- Web app manifest for mobile installation
- Push notification support for medication reminders

### Monitoring and Analytics
- Built-in analytics tracking for medication adherence
- Audit logging for compliance and security
- Error tracking and performance monitoring

The application is designed to be highly scalable, accessible, and compliant with medical data handling requirements while providing an intuitive experience for elderly users and healthcare professionals.