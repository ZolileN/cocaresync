# CoCareSync Platform

## Overview

CoCareSync is a comprehensive TB/HIV co-infection management platform designed for South Africa's healthcare system. The platform integrates multiple healthcare data sources including TIER.Net, EDRWeb, NHLS, and private laboratory systems to provide unified patient data management and real-time analytics. Built with a focus on addressing South Africa's 61% TB/HIV co-infection rate, the system provides offline functionality for low-connectivity rural areas and comprehensive reporting capabilities for healthcare decision-making.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Main web application built with React and TypeScript for centralized patient data access and real-time analytics
- **Shadcn/UI Components**: Comprehensive UI component library with Radix UI primitives for consistent, accessible interface design
- **Tailwind CSS**: Utility-first CSS framework for responsive design with custom CSS variables for theming
- **Client-side Routing**: Wouter for lightweight routing between dashboard, patient management, analytics, and reporting modules
- **State Management**: TanStack React Query for server state management with optimistic updates and caching

### Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support for handling healthcare data operations
- **Node.js Runtime**: Scalable server-side runtime with ES modules for modern JavaScript features
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication and session management
- **Session Storage**: PostgreSQL-backed session store with connect-pg-simple for persistent user sessions

### Database Layer
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL for structured healthcare data storage
- **Drizzle ORM**: Type-safe database operations with schema migrations and automatic type generation
- **Schema Design**: Comprehensive healthcare data models including patients, treatments, lab results, system integrations, and audit trails

### API Design
- **RESTful Endpoints**: Standard HTTP methods for CRUD operations on healthcare entities
- **Data Import/Export**: File upload capabilities for CSV/Excel data import from external systems
- **Integration APIs**: Endpoints for synchronizing with TIER.Net, EDRWeb, NHLS, and private lab systems
- **Analytics APIs**: Specialized endpoints for dashboard metrics, trends analysis, and reporting

### Authentication & Security
- **Replit Auth**: OIDC-based authentication with role-based access control (clinician/admin roles)
- **Session Management**: Secure cookie-based sessions with CSRF protection
- **Database Security**: Connection pooling with encrypted connections to Neon PostgreSQL
- **HIPAA Compliance**: Designed for healthcare data privacy requirements with audit logging

### Development Tooling
- **TypeScript**: Full-stack type safety with shared schemas between client and server
- **Vite**: Fast development server with HMR for efficient frontend development
- **ESBuild**: Production bundling for optimized server deployment
- **Path Aliases**: Organized import structure with @/ for client code and @shared for common types

### Deployment Architecture
- **Monorepo Structure**: Single repository containing both client and server code with shared schemas
- **Static Asset Serving**: Vite-built frontend served from Express server in production
- **Environment Configuration**: Environment-based configuration for development and production deployments

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling and automatic scaling
- **@neondatabase/serverless**: WebSocket-based database client for serverless environments

### Authentication
- **Replit Auth**: OIDC authentication provider with session management
- **OpenID Client**: OAuth/OIDC client library for authentication flows
- **Passport.js**: Authentication middleware for Express

### UI Framework
- **React**: Frontend framework with hooks and concurrent features
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with design system integration
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **Drizzle ORM**: Type-safe database operations with migration support
- **Zod**: Runtime type validation for form inputs and API data

### File Processing
- **Multer**: File upload middleware for handling CSV/Excel imports
- **CSV Parser**: Stream-based CSV processing for large dataset imports
- **XLSX**: Excel file processing for healthcare data imports

### Development Tools
- **Vite**: Build tool with fast HMR and optimized production builds
- **TypeScript**: Static type checking across the full stack
- **ESLint/Prettier**: Code quality and formatting tools