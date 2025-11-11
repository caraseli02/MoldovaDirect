/**
 * Test User Developer Tools Plugin
 *
 * Exposes helpful utilities on window.$testUsers for quick persona management
 * from the browser console during development and testing.
 */

import { testUserPersonas, type TestUserPersonaKey } from '~/lib/testing/testUserPersonas'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const router = useRouter()

  // Only enable in environments where test users are enabled
  if (!config.public.enableTestUsers) {
    return
  }

  const authStore = useAuthStore()

  // Expose dev tools on window
  if (process.client) {
    (window as any).$testUsers = {
      /**
       * List all available personas
       */
      list() {
        console.table(
          Object.values(testUserPersonas).map((p) => ({
            Key: p.key,
            Title: p.title,
            Email: p.user.email,
            Language: p.user.preferredLanguage,
            'Focus Areas': p.focusAreas.join(', ')
          }))
        )
        console.log('\nUsage: $testUsers.activate("persona-key")')
      },

      /**
       * Activate a persona by key
       */
      activate(key: TestUserPersonaKey) {
        try {
          if (!testUserPersonas[key]) {
            console.error(`❌ Unknown persona: ${key}`)
            console.log('Available personas:', Object.keys(testUserPersonas))
            return false
          }

          authStore.simulateLogin(key)
          console.log(`✅ Activated persona: ${testUserPersonas[key].title}`)
          console.log(`📧 Email: ${testUserPersonas[key].user.email}`)
          console.log(`🌍 Language: ${testUserPersonas[key].user.preferredLanguage}`)
          console.log('\nNavigate to: /test-users to see test script')
          return true
        } catch (error) {
          console.error('❌ Failed to activate persona:', error)
          return false
        }
      },

      /**
       * End current simulation
       */
      end() {
        authStore.simulateLogout()
        console.log('✅ Simulation ended')
        return true
      },

      /**
       * Get current active persona
       */
      current() {
        const personaKey = authStore.activeTestPersona
        if (!personaKey) {
          console.log('No active persona')
          return null
        }

        const persona = testUserPersonas[personaKey]
        console.log(`📋 Active Persona: ${persona.title}`)
        console.log(`🔑 Key: ${personaKey}`)
        console.log(`📧 Email: ${persona.user.email}`)
        console.log(`🌍 Language: ${persona.user.preferredLanguage}`)

        const progress = authStore.getPersonaProgress(personaKey)
        if (progress) {
          console.log(`\n📊 Progress: ${progress.completionPercentage}% complete`)
          console.log(`✓ Completed steps: ${progress.completedSteps.length}/${persona.testScript.length}`)
        }

        return persona
      },

      /**
       * Show test script for current persona
       */
      script() {
        const personaKey = authStore.activeTestPersona
        if (!personaKey) {
          console.log('No active persona. Use $testUsers.activate("key") first')
          return
        }

        const persona = testUserPersonas[personaKey]
        const progress = authStore.getPersonaProgress(personaKey)

        console.log(`\n📝 Test Script for: ${persona.title}\n`)
        persona.testScript.forEach((step, index) => {
          const isCompleted = progress?.completedSteps.includes(index)
          const marker = isCompleted ? '✅' : '☐'
          console.log(`${marker} ${index + 1}. ${step}`)

          if (progress?.notes[index]) {
            console.log(`   📝 Note: ${progress.notes[index]}`)
          }
        })

        if (progress) {
          console.log(`\n📊 Progress: ${progress.completionPercentage}% complete`)
        }
      },

      /**
       * Mark a test script step as complete
       */
      complete(stepIndex: number) {
        const personaKey = authStore.activeTestPersona
        if (!personaKey) {
          console.log('No active persona')
          return false
        }

        const persona = testUserPersonas[personaKey]
        if (stepIndex < 0 || stepIndex >= persona.testScript.length) {
          console.error(`❌ Invalid step index. Must be between 0 and ${persona.testScript.length - 1}`)
          return false
        }

        authStore.toggleTestScriptStep(personaKey, stepIndex, persona.testScript.length)
        console.log(`✅ Toggled step ${stepIndex + 1}`)
        return true
      },

      /**
       * Add a note to a test script step
       */
      note(stepIndex: number, noteText: string) {
        const personaKey = authStore.activeTestPersona
        if (!personaKey) {
          console.log('No active persona')
          return false
        }

        const persona = testUserPersonas[personaKey]
        if (stepIndex < 0 || stepIndex >= persona.testScript.length) {
          console.error(`❌ Invalid step index. Must be between 0 and ${persona.testScript.length - 1}`)
          return false
        }

        authStore.updateTestScriptNote(personaKey, stepIndex, noteText)
        console.log(`📝 Added note to step ${stepIndex + 1}`)
        return true
      },

      /**
       * Clear progress for current persona
       */
      clearProgress() {
        const personaKey = authStore.activeTestPersona
        if (!personaKey) {
          console.log('No active persona')
          return false
        }

        authStore.clearPersonaProgress(personaKey)
        console.log('✅ Progress cleared')
        return true
      },

      /**
       * Navigate to test users page
       */
      open() {
        router.push('/test-users')
        console.log('📱 Navigating to test users page...')
      },

      /**
       * Set simulation mode
       */
      mode(mode: 'normal' | 'slow-network' | 'intermittent-errors' | 'offline') {
        authStore.setSimulationMode(mode)
        console.log(`🔧 Simulation mode set to: ${mode}`)
        return true
      },

      /**
       * Export current session
       */
      async export() {
        const personaKey = authStore.activeTestPersona
        if (!personaKey) {
          console.log('No active persona to export')
          return null
        }

        const progress = authStore.getPersonaProgress(personaKey)
        if (!progress) {
          console.log('No progress data to export')
          return null
        }

        const { exportPersonaSession } = await import('~/lib/testing/simulationHelpers')
        const sessionJson = exportPersonaSession(
          personaKey,
          authStore.simulationMode,
          {
            completedSteps: progress.completedSteps,
            notes: progress.notes
          }
        )

        console.log('📤 Session exported (copy from below):')
        console.log(sessionJson)
        return sessionJson
      },

      /**
       * Show help
       */
      help() {
        console.log(`
🧪 Test User Dev Tools - Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Persona Management:
  $testUsers.list()              List all available personas
  $testUsers.activate(key)       Activate a persona
  $testUsers.end()               End current simulation
  $testUsers.current()           Show current active persona
  $testUsers.open()              Navigate to test users page

📝 Test Script:
  $testUsers.script()            Show test script for current persona
  $testUsers.complete(index)     Toggle completion of a step
  $testUsers.note(index, text)   Add note to a step
  $testUsers.clearProgress()     Clear progress for current persona

🔧 Simulation:
  $testUsers.mode(mode)          Set simulation mode
                                 Options: 'normal', 'slow-network',
                                         'intermittent-errors', 'offline'

💾 Import/Export:
  $testUsers.export()            Export current session state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Example: $testUsers.activate('vip-customer')
        `)
      }
    }

    // Show welcome message in console
    console.log(
      '%c🧪 Test User Dev Tools Loaded',
      'background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    )
    console.log('Type $testUsers.help() for available commands')
  }
})
