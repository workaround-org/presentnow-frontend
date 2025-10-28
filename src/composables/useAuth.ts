import { ref, onMounted } from 'vue'
import authService from '@/auth/authService'
import { User } from 'oidc-client-ts'

export function useAuth() {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(true)
  const isAdmin = ref(false)

  const loadUser = async () => {
    isLoading.value = true
    try {
      await authService.ensureInitialized()
      user.value = await authService.getUser()
      isAuthenticated.value = await authService.isAuthenticated()
      isAdmin.value = await authService.isAdmin()
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      isLoading.value = false
    }
  }

  const login = async () => {
    try {
      await authService.login()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  onMounted(() => {
    loadUser()
  })

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    logout,
    loadUser
  }
}
