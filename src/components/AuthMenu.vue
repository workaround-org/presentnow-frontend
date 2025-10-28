<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        size="large"
      >
        <v-icon v-if="isLoading">mdi-loading mdi-spin</v-icon>
        <v-icon v-else-if="isAuthenticated">mdi-account-circle</v-icon>
        <v-icon v-else>mdi-login</v-icon>
      </v-btn>
    </template>

    <v-list v-if="isAuthenticated">
      <v-list-item>
        <v-list-item-title>{{ user?.profile?.name || user?.profile?.email || 'User' }}</v-list-item-title>
        <v-list-item-subtitle>{{ user?.profile?.email }}</v-list-item-subtitle>
      </v-list-item>
      
      <v-divider></v-divider>
      
      <v-list-item v-if="isAdmin">
        <v-list-item-title>
          <v-chip color="primary" size="small">Admin</v-chip>
        </v-list-item-title>
      </v-list-item>
      
      <v-list-item @click="logout" prepend-icon="mdi-logout">
        <v-list-item-title>Logout</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list v-else>
      <v-list-item @click="login" prepend-icon="mdi-login">
        <v-list-item-title>Login</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, isLoading, isAdmin, login, logout } = useAuth()
</script>
