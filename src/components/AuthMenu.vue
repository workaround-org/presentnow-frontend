<template>
  <v-menu min-width="220" :offset="[8, 0]">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        size="large"
        color="#e46842"
        variant="text"
        class="auth-btn"
      >
        <v-icon v-if="isLoading">mdi-loading mdi-spin</v-icon>
        <template v-else-if="isAuthenticated">
          <v-icon size="36" class="mr-2">mdi-account-circle</v-icon>
          <span class="auth-name">{{ user?.profile?.name || user?.profile?.email || 'User' }}</span>
        </template>
        <v-icon v-else size="36">mdi-login</v-icon>
      </v-btn>
    </template>

    <v-list v-if="isAuthenticated" class="auth-menu-list pa-2" rounded="lg" elevation="4">
      <v-divider class="mb-1"></v-divider>

      <v-list-item v-if="isAdmin" class="mb-1">
        <v-list-item-title>
          <v-chip color="primary" size="small">Admin</v-chip>
        </v-list-item-title>
      </v-list-item>

      <v-list-item
        @click="router.push('/wishlists')"
        prepend-icon="mdi-format-list-bulleted"
        rounded="lg"
        class="menu-item"
      >
        <v-list-item-title class="menu-item-title">My Wishlists</v-list-item-title>
      </v-list-item>

      <v-divider class="my-1"></v-divider>

      <v-list-item
        @click="logout"
        prepend-icon="mdi-logout"
        rounded="lg"
        class="menu-item logout-item"
      >
        <v-list-item-title class="menu-item-title">Logout</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list v-else class="pa-2" rounded="lg" elevation="4">
      <v-list-item @click="login" prepend-icon="mdi-login" rounded="lg" class="menu-item">
        <v-list-item-title class="menu-item-title">Login</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, isAuthenticated, isLoading, isAdmin, login, logout } = useAuth()
</script>

<style scoped>
.auth-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

.auth-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.menu-item {
  min-height: 40px !important;
}

.menu-item-title {
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-item {
  color: #e53935;
}
</style>
