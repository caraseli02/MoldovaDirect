#!/usr/bin/env node
/**
 * Test Validator Hook for Claude Code (PostToolUse)
 *
 * Follows Anthropic best practices:
 * https://code.claude.com/docs/en/hooks-guide
 *
 * Runs after file modifications to:
 * 1. Execute related tests
 * 2. Validate tests pass
 * 3. Provide visual review guidance if needed
 * 4. Update task status in skill_audit_refactor.json
 *
 * Exit codes:
 * - 0: Success (hook completed)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const AUDIT_FILE = path.join(PROJECT_DIR, 'skill_audit_refactor.json');
const CURRENT_TASK_FILE = path.join(PROJECT_DIR, '.claude/hooks/.current-task.json');

/**
 * Read hook input from stdin (JSON format per Anthropic docs)
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (_e) {
        resolve({ tool_input: {} });
      }
    });
    setTimeout(() => {
      if (!data) resolve({ tool_input: {} });
    }, 100);
  });
}

/**
 * Find test file for a given source file
 */
function findTestFile(sourceFile) {
  const testPatterns = [
    // Same directory with .test.ts
    sourceFile.replace(/\.(ts|tsx|vue|js|jsx)$/, '.test.ts'),
    sourceFile.replace(/\.(ts|tsx|vue|js|jsx)$/, '.spec.ts'),
    // tests/__tests__ directory pattern
    sourceFile.replace(/^(.+?)\/([^/]+)\.(ts|tsx|vue|js|jsx)$/, '$1/__tests__/$2.test.ts'),
    // tests/ mirror structure
    `tests/${sourceFile.replace(/\.(ts|tsx|vue|js|jsx)$/, '.test.ts')}`,
  ];

  for (const pattern of testPatterns) {
    const fullPath = path.join(PROJECT_DIR, pattern);
    if (fs.existsSync(fullPath)) {
      return pattern;
    }
  }

  return null;
}

/**
 * Run tests for a specific file
 */
function runTests(testFile) {
  try {
    const result = execSync(`pnpm test ${testFile} --run`, {
      encoding: 'utf8',
      timeout: 60000,
      cwd: PROJECT_DIR,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || error.stderr || error.message
    };
  }
}

/**
 * Check if visual test is needed for this task
 */
function needsVisualTest(filePath) {
  const visualTestPatterns = [
    /components\//,
    /pages\//,
    /layouts\//,
    /\.vue$/
  ];

  return visualTestPatterns.some(pattern => pattern.test(filePath));
}

/**
 * Load current task context
 */
function getCurrentTask() {
  if (fs.existsSync(CURRENT_TASK_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CURRENT_TASK_FILE, 'utf8'));
    } catch (_e) {
      return null;
    }
  }
  return null;
}

/**
 * Update task status in audit file
 */
function updateTaskStatus(categoryId, stepId, updates) {
  if (!fs.existsSync(AUDIT_FILE)) return false;

  try {
    const auditData = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));

    for (const category of auditData.audit_refactor || []) {
      if (category.id === categoryId) {
        for (const step of category.steps || []) {
          if (step.id === stepId) {
            Object.assign(step, updates);
            fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditData, null, 2));
            return true;
          }
        }
      }
    }
  } catch (_e) {
    return false;
  }

  return false;
}

/**
 * Main post-tool validation logic
 */
async function main() {
  const input = await readStdin();
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';

  // Skip if no file path
  if (!filePath) {
    process.exit(0);
  }

  // Skip non-source files
  if (!filePath.match(/\.(ts|tsx|vue|js|jsx)$/)) {
    process.exit(0);
  }

  // Check if this was a test file being created
  if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('/tests/')) {
    console.log(`✅ Test file created: ${filePath}`);

    // Run the new test to verify it's properly structured
    const testResult = runTests(filePath);
    if (testResult.success) {
      console.log(`✅ Test runs successfully (should fail initially in TDD)`);
    } else {
      console.log(`🔴 Test fails as expected (Red phase of TDD)`);
      console.log(`Now implement the fix to make it pass (Green phase)`);
    }

    process.exit(0);
  }

  // For implementation files, find and run related tests
  const testFile = findTestFile(filePath);
  const currentTask = getCurrentTask();

  if (testFile) {
    console.log(`🧪 Running tests: ${testFile}`);

    const testResult = runTests(testFile);

    if (testResult.success) {
      console.log(`✅ All tests pass!`);

      // Update task status if we have context
      if (currentTask) {
        updateTaskStatus(currentTask.categoryId, currentTask.stepId, {
          implemented: true,
          tested: true
        });
        console.log(`📋 Updated task "${currentTask.stepId}" as implemented and tested`);
      }

      // Check if visual test is needed
      if (needsVisualTest(filePath)) {
        console.log(`\n📸 VISUAL TEST RECOMMENDED:`);
        console.log(`This component change may need visual verification.`);
        console.log(`Run: pnpm run test:visual:all`);
        console.log(`Or use Chrome DevTools MCP to verify visually.`);
      }
    } else {
      console.log(`❌ Tests failed!`);
      console.log(`\nTest output:\n${testResult.output.slice(0, 500)}`);
      console.log(`\n🔄 Fix the implementation and try again.`);
    }
  } else {
    console.log(`⚠️ No test file found for: ${filePath}`);

    if (currentTask) {
      console.log(`Expected test at: ${currentTask.testFile}`);
      console.log(`Create the test first following TDD principles.`);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Test Validator error:', err.message);
  process.exit(0);
});
