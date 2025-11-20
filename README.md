# PresentNow Frontend

[![Build and Push Docker Image](https://github.com/workaround-org/presentnow-frontend/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/workaround-org/presentnow-frontend/actions/workflows/build-and-push.yml)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.10-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![Docker](https://img.shields.io/badge/Docker-enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![pnpm](https://img.shields.io/badge/pnpm-package%20manager-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

**PresentNow** is an open-source web application that helps people collaboratively organize and manage gift-giving for occasions like birthdays. This repository contains the Vue.js frontend that provides an intuitive interface for creating wish lists, suggesting presents, and coordinating gift purchases while preserving the element of surprise.

## Features

- **Wish List Management**: Create and share wish lists for any occasion
- **Present Suggestions**: Browse and suggest presents for friends and family
- **Collaborative Gifting**: Reserve presents to avoid duplicates among friends
- **Privacy-First**: Recipients can't see who is buying which present—the surprise remains intact!
- **Modern UI**: Built with Vue 3 and Vuetify for a clean, responsive interface
- **Secure Authentication**: Integrated OpenID Connect (OIDC) authentication with role-based access control
- **Production Ready**: Containerized deployment with optimized nginx configuration

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) with Composition API
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [Vuetify 3](https://vuetifyjs.com/)
- **Language**: TypeScript
- **Authentication**: [oidc-client-ts](https://github.com/authts/oidc-client-ts)
- **Routing**: Vue Router 4
- **Package Manager**: pnpm
- **Containerization**: Docker with multi-stage builds
- **Web Server**: nginx (production)

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [pnpm](https://pnpm.io/) installed (`npm install -g pnpm`)
- [PresentNow Backend](https://github.com/vvilip/presentnow-backend) running (for API access)

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/workaround-org/presentnow-frontend.git
   cd presentnow-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

The application will connect to the backend API to fetch configuration and handle authentication.

### Production Build

Build the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Docker Deployment

This project includes a Dockerfile for containerized deployment with optimized nginx configuration.

### Build Docker Image

```bash
docker build -t presentnow-frontend .
```

### Run Docker Container

```bash
docker run -p 8080:80 presentnow-frontend
```

The application will be available at `http://localhost:8080`.

### GitHub Container Registry

The Docker image is automatically built and pushed to GitHub Container Registry on every push to the `main` branch.

Pull and run the latest image:

```bash
docker run -p 8080:80 ghcr.io/workaround-org/presentnow-frontend:latest
```

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production with TypeScript type checking
- `pnpm preview` - Preview production build locally
- `pnpm type-check` - Run TypeScript type checking without building

## Authentication

PresentNow uses OpenID Connect (OIDC) for secure authentication. The application automatically fetches authentication configuration from the backend and supports:

- Single Sign-On (SSO)
- Silent token renewal
- Role-based access control (admin roles)
- Secure logout

For detailed authentication setup and configuration, see [OIDC_SETUP.md](./OIDC_SETUP.md).

## Project Structure

```
presentnow-frontend/
├── src/
│   ├── api/           # API client and backend communication
│   ├── auth/          # Authentication service and OIDC integration
│   ├── components/    # Reusable Vue components
│   ├── composables/   # Vue composables (e.g., useAuth)
│   ├── router/        # Vue Router configuration
│   ├── assets/        # Static assets (images, styles)
│   ├── App.vue        # Root component
│   └── main.ts        # Application entry point
├── public/            # Public static files
├── Dockerfile         # Multi-stage Docker build
├── nginx.conf         # Production nginx configuration
└── vite.config.ts     # Vite configuration
```

## Backend Integration

This frontend is designed to work with the [PresentNow Backend](https://github.com/vvilip/presentnow-backend), a REST API built with Java and Quarkus. The backend provides:

- User and present management
- Authentication configuration
- Present suggestion and reservation system
- Privacy controls for gift coordination

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vue Language Features)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

**Note**: Disable Vetur if you have it installed, as it conflicts with Volar.

### Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/) for build customization options.

## Contributing

Contributions are welcome! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests if applicable.

## License

This project is free and open-source software (FOSS). See [LICENSE](./LICENSE) for details.

## Related Projects

- [PresentNow Backend](https://github.com/vvilip/presentnow-backend) - Java/Quarkus REST API

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/workaround-org/presentnow-frontend/issues) on GitHub.
