<script setup>
</script>

<template>
  <v-app>
    <main>
      <RouterView/>
    </main>
  </v-app>
</template>

<style>
* {
  font-family: 'Poppins', sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  background: url('./assets/images/background.png') no-repeat center center fixed;
  background-size: cover;
  color: #2c3e50;
}

.v-application {
  background: transparent !important;
}
</style>