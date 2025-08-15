import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  name: string
  phone?: string
  preferredLanguage?: string
  emailVerified?: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isAdmin: (state) => {
      const adminEmails = ['admin@moldovadirect.com']
      return state.user ? adminEmails.includes(state.user.email) : false
    }
  },

  actions: {
    async register(data: { email: string; password: string; name: string; phone?: string }) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: data
        })
        
        this.user = response.user
        this.isAuthenticated = true
        
        await navigateTo('/account')
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })
        
        this.user = response.user
        this.isAuthenticated = true
        
        await navigateTo('/account')
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
        
        this.user = null
        this.isAuthenticated = false
        
        await navigateTo('/')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      try {
        const response = await $fetch('/api/auth/me')
        this.user = response.user
        this.isAuthenticated = true
        return response.user
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        return null
      }
    },

    async updateProfile(data: Partial<User>) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/profile', {
          method: 'PUT',
          body: data
        })
        
        this.user = response.user
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})