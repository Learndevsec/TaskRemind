# Task Manager Application

## Overview

This is a full-stack task management application built with React, Express, and PostgreSQL. The application allows users to create, manage, and track tasks with scheduling capabilities, priority levels, and notification features. It features a modern UI built with shadcn/ui components and Tailwind CSS, along with real-time task scheduling and browser notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API endpoints for task management operations
- **Middleware**: Custom logging middleware for request/response tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development**: Hot reload support with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Connection**: Neon Database serverless connection for PostgreSQL hosting
- **Schema**: Type-safe schema definitions with Drizzle Zod integration
- **Fallback**: In-memory storage implementation for development/testing scenarios

### Task Management Features
- **CRUD Operations**: Full create, read, update, delete functionality for tasks
- **Scheduling**: Date and time-based task scheduling with priority levels
- **Status Tracking**: Task completion status and follow-up mechanisms
- **Validation**: Comprehensive input validation using Zod schemas
- **Notifications**: Browser notification integration for task reminders

### External Dependencies
- **Database Hosting**: Neon Database for serverless PostgreSQL
- **UI Components**: Radix UI primitives for accessible component foundations
- **Date Handling**: date-fns library for date manipulation and formatting
- **Notifications**: Browser Notification API for task reminders
- **Development Tools**: Replit integration for cloud development environment
- **Fonts**: Google Fonts integration (Roboto, DM Sans, Fira Code, Geist Mono, Architects Daughter)