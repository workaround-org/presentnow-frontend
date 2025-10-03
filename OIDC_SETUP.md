# OIDC Authentication Integration

This project uses `oidc-client-ts` for OpenID Connect authentication.

## Overview

The authentication system fetches configuration from the backend endpoint `/api/present-now/v1/public/config` and automatically configures the OIDC client with the returned settings.

## Backend Configuration

The backend must provide the following configuration via the `/api/present-now/v1/public/config` endpoint:

```json
{
  "authServerUrl": "https://your-auth-server.com",
  "authClientId": "your-client-id",
  "adminRole": "admin"
}
```

## Components

### AuthService (`src/auth/authService.js`)

The main authentication service that handles:
- Fetching configuration from the backend
- Initializing the OIDC UserManager
- Login/Logout functionality
- Token management and automatic renewal
- User profile access
- Role checking

### useAuth Composable (`src/composables/useAuth.js`)

A Vue composable that provides reactive authentication state:
- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state
- `isAdmin` - Admin role status
- `login()` - Trigger login flow
- `logout()` - Trigger logout flow
- `loadUser()` - Refresh user state

### AuthMenu Component (`src/components/AuthMenu.vue`)

A ready-to-use authentication menu component that displays:
- Login button when not authenticated
- User profile menu with logout when authenticated
- Admin badge if user has admin role

### AuthCallback Component (`src/components/AuthCallback.vue`)

Handles the OIDC redirect callback after login.

## Usage

### In Components

```vue
<script setup>
import { useAuth } from '@/composables/useAuth.js'

const { user, isAuthenticated, isLoading, isAdmin, login, logout } = useAuth()
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isAuthenticated">
    <p>Welcome, {{ user?.profile?.name }}!</p>
    <p v-if="isAdmin">You are an admin</p>
    <button @click="logout">Logout</button>
  </div>
  <div v-else>
    <button @click="login">Login</button>
  </div>
</template>
```

### Direct AuthService Usage

```javascript
import authService from '@/auth/authService.js'

// Login
await authService.login()

// Logout
await authService.logout()

// Get current user
const user = await authService.getUser()

// Check if authenticated
const isAuth = await authService.isAuthenticated()

// Check if user is admin
const isAdmin = await authService.isAdmin()

// Get access token
const token = await authService.getAccessToken()

// Check specific role
const hasRole = await authService.hasRole('admin')
```

### API Client Integration

The API client (`src/api/client.js`) automatically includes the authentication token in all requests. No additional configuration needed.

## Routes

The following route is configured for OIDC:
- `/callback` - Handles the authentication callback

## Silent Token Renewal

Silent token renewal is configured automatically. The `public/silent-renew.html` page handles background token refresh.

## Configuration

### Redirect URIs

Make sure to configure these redirect URIs in your OIDC provider:
- Login redirect: `{your-app-url}/callback`
- Logout redirect: `{your-app-url}/`
- Silent renew: `{your-app-url}/silent-renew.html`

### Scopes

Default scopes requested:
- `openid`
- `profile`
- `email`

Additional scopes can be configured in `src/auth/authService.js`.

## Error Handling

The auth service includes error handling for:
- Failed configuration fetch
- Authentication errors
- Token expiration
- Silent renewal failures

All errors are logged to the console and can be caught in components.
