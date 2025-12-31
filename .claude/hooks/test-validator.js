#!/usr/bin/env node
/**
 * Test Validator Hook for Claude Code
 *
 * Runs after file modifications to:
 * 1. Execute related tests
 * 2. Validate tests pass
 * 3. Trigger visual review if needed
 * 4. Update task status in skill_audit_refactor.json
 *
 * Part of the TDD Guard system for enforcing test-first development.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUDIT_FILE = path.join(process.cwd(), 'skill_audit_refactor.json');
const CURRENT_TASK_FILE = path.join(process.cwd(), '.claude/hooks/.current-task.json');

/**
 * Read hook input from stdin
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (_e) {
        resolve({ tool_name: '', tool_input: {}, tool_result: {} });
      }
    });
    setTimeout(() => resolve({ tool_name: '', tool_input: {}, tool_result: {} }), 100);
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
    if (fs.existsSync(pattern)) {
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
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
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
  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};
  const toolResult = input.tool_result || {};

  // Only check after Edit and Write tools
  if (!['Edit', 'Write', 'MultiEdit'].includes(toolName)) {
    process.exit(0);
  }

  // Check if the tool succeeded
  if (toolResult.error) {
    process.exit(0);
  }

  const filePath = toolInput.file_path || toolInput.path || '';

  // Skip non-source files
  if (!filePath.match(/\.(ts|tsx|vue|js|jsx)$/)) {
    process.exit(0);
  }

  const output = {
    messages: []
  };

  // Check if this was a test file being created
  if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('/tests/')) {
    output.messages.push(`✅ Test file created: ${filePath}`);

    // Run the new test to verify it's properly structured
    const testResult = runTests(filePath);
    if (testResult.success) {
      output.messages.push(`✅ Test runs successfully (should fail initially in TDD)`);
    } else {
      output.messages.push(`🔴 Test fails as expected (Red phase of TDD)`);
      output.messages.push(`Now implement the fix to make it pass (Green phase)`);
    }

    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // For implementation files, find and run related tests
  const testFile = findTestFile(filePath);
  const currentTask = getCurrentTask();

  if (testFile) {
    output.messages.push(`🧪 Running tests: ${testFile}`);

    const testResult = runTests(testFile);

    if (testResult.success) {
      output.messages.push(`✅ All tests pass!`);

      // Update task status if we have context
      if (currentTask) {
        updateTaskStatus(currentTask.categoryId, currentTask.stepId, {
          implemented: true,
          tested: true
        });
        output.messages.push(`📋 Updated task "${currentTask.stepId}" as implemented and tested`);
      }

      // Check if visual test is needed
      if (needsVisualTest(filePath)) {
        output.messages.push(`\n📸 VISUAL TEST RECOMMENDED:`);
        output.messages.push(`This component change may need visual verification.`);
        output.messages.push(`Run: pnpm run test:visual:all`);
        output.messages.push(`Or use Chrome DevTools MCP to verify visually.`);
      }
    } else {
      output.messages.push(`❌ Tests failed!`);
      output.messages.push(`\nTest output:\n${testResult.output.slice(0, 500)}`);
      output.messages.push(`\n🔄 Fix the implementation and try again.`);
    }
  } else {
    output.messages.push(`⚠️ No test file found for: ${filePath}`);

    if (currentTask) {
      output.messages.push(`Expected test at: ${currentTask.testFile}`);
      output.messages.push(`Create the test first following TDD principles.`);
    }
  }

  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(err => {
  console.error('Test Validator error:', err.message);
  process.exit(0);
});
