#!/usr/bin/env node
/**
 * TDD Guard Hook for Claude Code
 *
 * Enforces test-first development by:
 * 1. Checking skill_audit_refactor.json for tasks with test_exists: false
 * 2. Blocking implementation until tests are created
 * 3. Providing guidance on which tests need to be written
 *
 * Based on: https://nizar.se/tdd-guard-for-claude-code/
 * Combined with Ralph Wiggum loop technique: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
 */

const fs = require('fs');
const path = require('path');

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
        resolve({ tool_name: '', tool_input: {} });
      }
    });
    // Handle case where no stdin is provided
    setTimeout(() => resolve({ tool_name: '', tool_input: {} }), 100);
  });
}

/**
 * Load audit refactor tasks
 */
function loadAuditTasks() {
  if (!fs.existsSync(AUDIT_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  } catch (_e) {
    return null;
  }
}

/**
 * Find tasks requiring tests (test_exists: false)
 */
function findTasksNeedingTests(auditData) {
  const tasksNeedingTests = [];

  if (!auditData?.audit_refactor) return tasksNeedingTests;

  for (const category of auditData.audit_refactor) {
    for (const step of category.steps || []) {
      if (step.test_exists === false && step.test_file) {
        tasksNeedingTests.push({
          category: category.name,
          categoryId: category.id,
          skill: category.skill,
          priority: category.priority,
          stepId: step.id,
          description: step.description,
          file: step.file || step.files?.[0],
          testFile: step.test_file,
          testExists: step.test_exists,
          implemented: step.implemented
        });
      }
    }
  }

  return tasksNeedingTests;
}

/**
 * Check if a file path matches any task requiring tests
 */
function checkFileAgainstTasks(filePath, tasksNeedingTests) {
  const normalizedPath = filePath.replace(/^\//, '').replace(/\\/g, '/');

  for (const task of tasksNeedingTests) {
    if (!task.file) continue;

    const taskFile = task.file.replace(/^\//, '').replace(/\\/g, '/');

    // Check if the file being edited matches a task file
    if (normalizedPath.includes(taskFile) || taskFile.includes(normalizedPath)) {
      // Check if this is implementation code (not test file)
      if (!normalizedPath.includes('.test.') && !normalizedPath.includes('.spec.') && !normalizedPath.includes('/tests/')) {
        return task;
      }
    }
  }

  return null;
}

/**
 * Get current task context
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
 * Set current task context
 */
function setCurrentTask(task) {
  const dir = path.dirname(CURRENT_TASK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CURRENT_TASK_FILE, JSON.stringify(task, null, 2));
}

/**
 * Main TDD Guard logic
 */
async function main() {
  const input = await readStdin();
  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};

  // Only check Edit and Write tools (file modifications)
  if (!['Edit', 'Write', 'MultiEdit'].includes(toolName)) {
    // Allow other tools
    process.exit(0);
  }

  const filePath = toolInput.file_path || toolInput.path || '';

  // Skip test files - always allow
  if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('/tests/')) {
    process.exit(0);
  }

  // Skip non-source files
  if (!filePath.match(/\.(ts|tsx|vue|js|jsx)$/)) {
    process.exit(0);
  }

  // Load audit tasks
  const auditData = loadAuditTasks();
  if (!auditData) {
    process.exit(0);
  }

  const tasksNeedingTests = findTasksNeedingTests(auditData);
  const matchingTask = checkFileAgainstTasks(filePath, tasksNeedingTests);

  if (matchingTask && !matchingTask.implemented) {
    // Block the edit and provide guidance
    const output = {
      decision: 'block',
      reason: `🛑 TDD GUARD: Test must be created first!

📋 Task: ${matchingTask.description}
📁 File: ${matchingTask.file}
🧪 Required Test: ${matchingTask.testFile}
🏷️  Skill: ${matchingTask.skill}
⚡ Priority: ${matchingTask.priority}

Before implementing changes to this file, you must:

1. CREATE THE TEST FIRST:
   Create file: ${matchingTask.testFile}

2. Write test cases that verify:
   - The expected behavior after the fix
   - Edge cases and error scenarios

3. RUN THE TEST (it should fail):
   pnpm test ${matchingTask.testFile}

4. UPDATE skill_audit_refactor.json:
   Set "test_exists": true for task "${matchingTask.stepId}"

5. THEN implement the fix in:
   ${matchingTask.file}

This follows the Red-Green-Refactor TDD cycle.`
    };

    // Save current task context for post-hook
    setCurrentTask(matchingTask);

    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // Allow the edit
  process.exit(0);
}

main().catch(err => {
  console.error('TDD Guard error:', err.message);
  process.exit(0); // Don't block on errors
});
