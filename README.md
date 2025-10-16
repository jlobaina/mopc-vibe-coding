# MOPC Expropriation Management System

Sistema digital para la gestión del proceso de expropiación del Ministerio de Obras Públicas y Comunicaciones de la República Dominicana.

## Architecture Overview

This system implements a modular monolith architecture based on the research recommendations:

- **Backend**: Python Django with REST Framework
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL (primary) + Redis (caching)
- **Authentication**: OAuth 2.0 with JWT
- **Testing**: Jest (frontend) + Pytest (backend)
- **Deployment**: Docker + Kubernetes

## Project Structure

```
mopc-platform/
├── backend/                 # Django backend application
│   ├── src/
│   │   ├── core/           # Core Django settings and utilities
│   │   ├── authentication/ # Authentication and authorization
│   │   ├── workflow/       # Workflow engine for expropriation process
│   │   ├── documents/      # Document management system
│   │   ├── departments/    # Department-specific modules
│   │   ├── integrations/   # External system integrations
│   │   └── api/           # REST API endpoints
│   ├── requirements.txt
│   ├── pytest.ini
│   └── Dockerfile
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── departments/   # Department-specific interfaces
│   │   ├── services/      # API service calls
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
├── infrastructure/         # Infrastructure as Code
│   ├── docker-compose.yml
│   ├── kubernetes/
│   └── terraform/
├── docs/                  # Documentation
└── README.md
```

## Key Features

1. **Digital Document Management**: Replace paper-based file transfers
2. **Workflow Automation**: 16-step expropriation process tracking
3. **Department Dashboards**: Specialized interfaces for each department
4. **Real-time Notifications**: Status updates and alerts
5. **External Integrations**: Catastro, Bienes Nacionales, Contraloría
6. **Security**: End-to-end encryption and audit trails
7. **Mobile Responsive**: Field agent access

## Current Process Analysis

The system addresses these key issues from the current 16-step process:
- Duplicity of functions between departments
- Lack of real-time tracking
- Excessive paper dependency
- Sequential bottlenecks

## Development Workflow

1. Follow the comprehensive todo list for systematic implementation
2. Use feature branches for each major component
3. Implement test-driven development with Jest and Pytest
4. Deploy using blue-green deployment strategy
5. Monitor with comprehensive observability stack

## Getting Started

1. Clone the repository
2. Set up Docker environment
3. Run database migrations
4. Start development servers
5. Access the application at http://localhost:3000

## Technology Stack Details

Based on comprehensive research analysis:

- **Backend**: Django chosen for admin interface, security, rapid development
- **Frontend**: React for flexibility and TypeScript support
- **Database**: PostgreSQL for data integrity and compliance
- **Infrastructure**: Docker + Kubernetes for scalability
- **Security**: OAuth 2.0 + JWT for government standards compliance