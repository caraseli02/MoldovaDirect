/**
 * Comprehensive Authentication Test Runner
 *
 * Runs all authentication-related tests in the correct order
 * and generates a comprehensive test report
 */

import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface TestResult {
  suite: string
  passed: number
  failed: number
  skipped: number
  duration: number
  coverage?: number
}

interface TestReport {
  timestamp: string
  totalTests: number
  totalPassed: number
  totalFailed: number
  totalSkipped: number
  totalDuration: number
  overallCoverage: number
  results: TestResult[]
  summary: {
    unitTests: TestResult[]
    integrationTests: TestResult[]
    e2eTests: TestResult[]
  }
}

class AuthTestRunner {
  private results: TestResult[] = []

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting Comprehensive Authentication Test Suite')
    console.log('='.repeat(60))

    // Run unit tests
    console.log('\n📋 Running Unit Tests...')
    await this.runUnitTests()

    // Run integration tests
    console.log('\n🔗 Running Integration Tests...')
    await this.runIntegrationTests()

    // Run E2E tests
    console.log('\n🌐 Running E2E Tests...')
    await this.runE2ETests()

    // Generate report
    const report = this.generateReport()
    this.saveReport(report)
    this.printSummary(report)

    return report
  }

  private async runUnitTests(): Promise<void> {
    const unitTestSuites = [
      {
        name: 'Auth Store Tests',
        command: 'npm run test:unit -- tests/unit/auth-store.test.ts --run',
      },
      {
        name: 'Auth Composables Tests',
        command: 'npm run test:unit -- tests/unit/auth-composables.test.ts --run',
      },
      {
        name: 'Auth Components Tests',
        command: 'npm run test:unit -- tests/unit/auth-components.test.ts --run',
      },
      {
        name: 'Auth Middleware Tests',
        command: 'npm run test:unit -- tests/unit/middleware-auth.test.ts --run',
      },
      {
        name: 'Auth Translations Tests',
        command: 'npm run test:unit -- tests/unit/auth-translations.test.ts --run',
      },
      {
        name: 'Auth Mobile Accessibility Tests',
        command: 'npm run test:unit -- tests/unit/auth-mobile-accessibility.test.ts --run',
      },
      {
        name: 'useAuth Composable Tests',
        command: 'npm run test:unit -- tests/unit/use-auth.test.ts --run',
      },
    ]

    for (const suite of unitTestSuites) {
      await this.runTestSuite(suite.name, suite.command)
    }
  }

  private async runIntegrationTests(): Promise<void> {
    const integrationTestSuites = [
      {
        name: 'Auth Flows Integration Tests',
        command: 'npm run test:unit -- tests/integration/auth-flows.test.ts --run',
      },
      {
        name: 'Auth Shopping Integration Tests',
        command: 'npm run test:unit -- tests/integration/auth-shopping-integration.test.ts --run',
      },
    ]

    for (const suite of integrationTestSuites) {
      await this.runTestSuite(suite.name, suite.command)
    }
  }

  private async runE2ETests(): Promise<void> {
    const e2eTestSuites = [
      {
        name: 'Auth Basic E2E Tests',
        command: 'npm run test:auth',
      },
      {
        name: 'Auth Mobile Responsive Tests',
        command: 'npx playwright test tests/e2e/auth-mobile-responsive.spec.ts',
      },
      {
        name: 'Auth Email Workflows Tests',
        command: 'npx playwright test tests/e2e/auth-email-workflows.spec.ts',
      },
      {
        name: 'Auth Accessibility Tests',
        command: 'npx playwright test tests/e2e/auth-accessibility.spec.ts',
      },
      {
        name: 'Auth Multi-language Tests',
        command: 'npx playwright test tests/e2e/i18n.spec.ts --grep "auth"',
      },
    ]

    for (const suite of e2eTestSuites) {
      await this.runTestSuite(suite.name, suite.command)
    }
  }

  private async runTestSuite(name: string, command: string): Promise<void> {
    console.log(`\n  ▶️  ${name}`)
    const startTime = Date.now()

    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000, // 5 minutes timeout
      })

      const duration = Date.now() - startTime
      const result = this.parseTestOutput(name, output, duration)
      this.results.push(result)

      console.log(`     ✅ ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped (${duration}ms)`)
    }
    catch (error: unknown) {
      const duration = Date.now() - startTime
      const result: TestResult = {
        suite: name,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration,
      }
      this.results.push(result)

      console.log(`     ❌ Test suite failed (${duration}ms)`)
      console.log(`     Error: ${error.message}`)
    }
  }

  private parseTestOutput(suiteName: string, output: string, duration: number): TestResult {
    // Parse test output to extract results
    // This is a simplified parser - in practice, you'd want more robust parsing

    const passedMatch = output.match(/(\d+) passed/i)
    const failedMatch = output.match(/(\d+) failed/i)
    const skippedMatch = output.match(/(\d+) skipped/i)
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/i)

    return {
      suite: suiteName,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
      duration,
      coverage: coverageMatch ? parseFloat(coverageMatch[1]) : undefined,
    }
  }

  private generateReport(): TestReport {
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0)
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0)
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0)
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    const totalTests = totalPassed + totalFailed + totalSkipped

    const coverageResults = this.results.filter(r => r.coverage !== undefined)
    const overallCoverage = coverageResults.length > 0
      ? coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / coverageResults.length
      : 0

    // Categorize results
    const unitTests = this.results.filter(r =>
      r.suite.includes('Store')
      || r.suite.includes('Composable')
      || r.suite.includes('Component')
      || r.suite.includes('Middleware')
      || r.suite.includes('Translation'),
    )

    const integrationTests = this.results.filter(r =>
      r.suite.includes('Integration')
      || r.suite.includes('Flows'),
    )

    const e2eTests = this.results.filter(r =>
      r.suite.includes('E2E')
      || r.suite.includes('Responsive')
      || r.suite.includes('Accessibility')
      || r.suite.includes('Workflows'),
    )

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      overallCoverage,
      results: this.results,
      summary: {
        unitTests,
        integrationTests,
        e2eTests,
      },
    }
  }

  private saveReport(report: TestReport): void {
    const reportPath = join(process.cwd(), 'test-results', 'auth-test-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📊 Test report saved to: ${reportPath}`)
  }

  private printSummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 AUTHENTICATION TEST SUITE SUMMARY')
    console.log('='.repeat(60))

    console.log(`\n🕒 Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`)
    console.log(`📈 Overall Coverage: ${report.overallCoverage.toFixed(1)}%`)

    console.log(`\n📋 Test Results:`)
    console.log(`   Total Tests: ${report.totalTests}`)
    console.log(`   ✅ Passed: ${report.totalPassed}`)
    console.log(`   ❌ Failed: ${report.totalFailed}`)
    console.log(`   ⏭️  Skipped: ${report.totalSkipped}`)

    console.log(`\n📊 Test Categories:`)
    console.log(`   🧪 Unit Tests: ${report.summary.unitTests.length} suites`)
    console.log(`   🔗 Integration Tests: ${report.summary.integrationTests.length} suites`)
    console.log(`   🌐 E2E Tests: ${report.summary.e2eTests.length} suites`)

    if (report.totalFailed > 0) {
      console.log(`\n❌ Failed Test Suites:`)
      report.results
        .filter(r => r.failed > 0)
        .forEach(r => console.log(`   - ${r.suite}: ${r.failed} failed`))
    }

    console.log('\n' + '='.repeat(60))

    const successRate = (report.totalPassed / report.totalTests) * 100
    if (successRate >= 95) {
      console.log('🎉 EXCELLENT! Authentication test suite passed with flying colors!')
    }
    else if (successRate >= 85) {
      console.log('✅ GOOD! Authentication test suite mostly passed.')
    }
    else if (successRate >= 70) {
      console.log('⚠️  NEEDS WORK! Some authentication tests are failing.')
    }
    else {
      console.log('❌ CRITICAL! Many authentication tests are failing.')
    }

    console.log('='.repeat(60))
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new AuthTestRunner()
  runner.runAllTests()
    .then((report) => {
      process.exit(report.totalFailed > 0 ? 1 : 0)
    })
    .catch((error: any) => {
      console.error('Test runner failed:', error)
      process.exit(1)
    })
}

export { AuthTestRunner }
