import { defineStore } from 'pinia'

export interface QuizAnswers {
  categoryId: string | null
  experienceLevel: string | null
  budgetRange: string | null
  occasion: string | null
}

export interface QuizSession {
  id: string
  answers: QuizAnswers
  recommendations: string[] // Product IDs
  completedAt: number
  convertedAt: number | null
}

interface QuizState {
  sessions: QuizSession[]
  currentSession: QuizSession | null
  isQuizOpen: boolean
}

/**
 * Composable for managing product quiz state and recommendations
 * Integrates with Pinia store for persistence and analytics
 */
export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    sessions: [],
    currentSession: null,
    isQuizOpen: false,
  }),

  getters: {
    /**
     * Get completion rate (sessions with all answers / total sessions)
     */
    completionRate: (state): number => {
      if (state.sessions.length === 0) return 0
      const completed = state.sessions.filter(
        (s) =>
          s.answers.categoryId &&
          s.answers.experienceLevel &&
          s.answers.budgetRange &&
          s.answers.occasion
      ).length
      return (completed / state.sessions.length) * 100
    },

    /**
     * Get conversion rate (sessions with purchases / completed sessions)
     */
    conversionRate: (state): number => {
      const completed = state.sessions.filter(
        (s) =>
          s.answers.categoryId &&
          s.answers.experienceLevel &&
          s.answers.budgetRange &&
          s.answers.occasion
      )
      if (completed.length === 0) return 0
      const converted = completed.filter((s) => s.convertedAt !== null).length
      return (converted / completed.length) * 100
    },

    /**
     * Get drop-off statistics by step
     */
    dropOffStats: (state) => {
      const stats = {
        step1: 0, // Category
        step2: 0, // Experience
        step3: 0, // Budget
        step4: 0, // Occasion
      }

      state.sessions.forEach((session) => {
        if (!session.answers.categoryId) stats.step1++
        else if (!session.answers.experienceLevel) stats.step2++
        else if (!session.answers.budgetRange) stats.step3++
        else if (!session.answers.occasion) stats.step4++
      })

      return stats
    },

    /**
     * Get most popular category selections
     */
    popularCategories: (state): Record<string, number> => {
      const categories: Record<string, number> = {}
      state.sessions.forEach((session) => {
        if (session.answers.categoryId) {
          categories[session.answers.categoryId] =
            (categories[session.answers.categoryId] || 0) + 1
        }
      })
      return categories
    },
  },

  actions: {
    /**
     * Initialize quiz store
     */
    initialize() {
      this.loadSessionsFromStorage()
    },

    /**
     * Open quiz modal
     */
    openQuiz() {
      this.isQuizOpen = true
      this.startNewSession()
      this.trackEvent('quiz_opened')
    },

    /**
     * Close quiz modal
     */
    closeQuiz() {
      this.isQuizOpen = false
      this.trackEvent('quiz_closed', {
        sessionId: this.currentSession?.id,
        step: this.getCurrentStep(),
      })
    },

    /**
     * Start a new quiz session
     */
    startNewSession() {
      const session: QuizSession = {
        id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        answers: {
          categoryId: null,
          experienceLevel: null,
          budgetRange: null,
          occasion: null,
        },
        recommendations: [],
        completedAt: 0,
        convertedAt: null,
      }

      this.currentSession = session
      this.sessions.push(session)
      this.saveSessionsToStorage()
    },

    /**
     * Update current session answers
     */
    updateAnswers(answers: Partial<QuizAnswers>) {
      if (!this.currentSession) return

      this.currentSession.answers = {
        ...this.currentSession.answers,
        ...answers,
      }

      this.saveSessionsToStorage()
      this.trackEvent('quiz_answer_updated', { answers })
    },

    /**
     * Complete current quiz session
     */
    async completeSession(recommendations: string[]) {
      if (!this.currentSession) return

      this.currentSession.recommendations = recommendations
      this.currentSession.completedAt = Date.now()

      this.saveSessionsToStorage()
      this.trackEvent('quiz_completed', {
        sessionId: this.currentSession.id,
        answers: this.currentSession.answers,
        recommendationsCount: recommendations.length,
      })
    },

    /**
     * Mark session as converted (user made a purchase)
     */
    markSessionConverted(sessionId: string) {
      const session = this.sessions.find((s) => s.id === sessionId)
      if (session) {
        session.convertedAt = Date.now()
        this.saveSessionsToStorage()
        this.trackEvent('quiz_conversion', {
          sessionId,
          timeToPurchase: session.convertedAt - session.completedAt,
        })
      }
    },

    /**
     * Get current quiz step based on answers
     */
    getCurrentStep(): number {
      if (!this.currentSession) return 0

      const { categoryId, experienceLevel, budgetRange, occasion } =
        this.currentSession.answers

      if (!categoryId) return 1
      if (!experienceLevel) return 2
      if (!budgetRange) return 3
      if (!occasion) return 4
      return 5 // Results
    },

    /**
     * Track analytics event
     */
    trackEvent(eventName: string, properties?: Record<string, any>) {
      // Track to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', eventName, properties)
      }

      // Track to custom analytics (if configured)
      if (typeof window !== 'undefined' && (window as any).analytics) {
        ;(window as any).analytics.track(eventName, properties)
      }
    },

    /**
     * Save sessions to localStorage
     */
    saveSessionsToStorage() {
      if (process.client) {
        try {
          // Keep only last 50 sessions
          const sessionsToSave = this.sessions.slice(-50)
          localStorage.setItem(
            'moldova-direct-quiz-sessions',
            JSON.stringify(sessionsToSave)
          )
        } catch (error) {
          console.warn('Failed to save quiz sessions:', error)
        }
      }
    },

    /**
     * Load sessions from localStorage
     */
    loadSessionsFromStorage() {
      if (process.client) {
        try {
          const saved = localStorage.getItem('moldova-direct-quiz-sessions')
          if (saved) {
            const sessions = JSON.parse(saved)

            // Filter out old sessions (older than 90 days)
            const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
            this.sessions = sessions.filter(
              (s: QuizSession) => s.completedAt > ninetyDaysAgo || s.completedAt === 0
            )

            // Save cleaned sessions back
            if (this.sessions.length !== sessions.length) {
              this.saveSessionsToStorage()
            }
          }
        } catch (error) {
          console.warn('Failed to load quiz sessions:', error)
          this.sessions = []
        }
      }
    },

    /**
     * Get quiz analytics data
     */
    getAnalytics() {
      const totalSessions = this.sessions.length
      const completedSessions = this.sessions.filter((s) => s.completedAt > 0).length
      const convertedSessions = this.sessions.filter((s) => s.convertedAt !== null).length

      return {
        totalSessions,
        completedSessions,
        convertedSessions,
        completionRate: this.completionRate,
        conversionRate: this.conversionRate,
        dropOffStats: this.dropOffStats,
        popularCategories: this.popularCategories,
        averageTimeToComplete: this.getAverageCompletionTime(),
        averageTimeToPurchase: this.getAveragePurchaseTime(),
      }
    },

    /**
     * Calculate average time to complete quiz (in seconds)
     */
    getAverageCompletionTime(): number {
      const completed = this.sessions.filter((s) => s.completedAt > 0)
      if (completed.length === 0) return 0

      const totalTime = completed.reduce((sum, session) => {
        const startTime = parseInt(session.id.split('_')[1])
        return sum + (session.completedAt - startTime)
      }, 0)

      return Math.round(totalTime / completed.length / 1000) // Convert to seconds
    },

    /**
     * Calculate average time from quiz completion to purchase (in seconds)
     */
    getAveragePurchaseTime(): number {
      const converted = this.sessions.filter((s) => s.convertedAt !== null)
      if (converted.length === 0) return 0

      const totalTime = converted.reduce((sum, session) => {
        if (session.convertedAt) {
          return sum + (session.convertedAt - session.completedAt)
        }
        return sum
      }, 0)

      return Math.round(totalTime / converted.length / 1000) // Convert to seconds
    },

    /**
     * Clear all quiz data
     */
    clearAllData() {
      this.sessions = []
      this.currentSession = null
      this.saveSessionsToStorage()
    },
  },
})

/**
 * Composable wrapper for quiz store
 */
export const useQuizRecommendations = () => {
  const store = useQuizStore()

  // Initialize store on first use
  if (process.client && store.sessions.length === 0) {
    store.initialize()
  }

  return {
    // State
    isQuizOpen: computed(() => store.isQuizOpen),
    currentSession: computed(() => store.currentSession),

    // Getters
    completionRate: computed(() => store.completionRate),
    conversionRate: computed(() => store.conversionRate),
    analytics: computed(() => store.getAnalytics()),

    // Actions
    openQuiz: store.openQuiz,
    closeQuiz: store.closeQuiz,
    updateAnswers: store.updateAnswers,
    completeSession: store.completeSession,
    markSessionConverted: store.markSessionConverted,
    trackEvent: store.trackEvent,
  }
}
