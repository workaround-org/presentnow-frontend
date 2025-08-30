# presentnow-frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

## Docker

This project includes a Dockerfile for containerized deployment.

### Build Docker Image Locally

```sh
docker build -t presentnow-frontend .
```

### Run Docker Container

```sh
docker run -p 8080:80 presentnow-frontend
```

The application will be available at http://localhost:8080.

### GitHub Actions

The Docker image is automatically built and pushed to GitHub Container Registry on every push to the `main` branch via the [build-and-push workflow](.github/workflows/build-and-push.yml).

To pull and run the latest image from GitHub Container Registry:

```sh
docker run -p 8080:80 ghcr.io/workaround-org/presentnow-frontend:latest
```
