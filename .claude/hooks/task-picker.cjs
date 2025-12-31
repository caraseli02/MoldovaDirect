#!/usr/bin/env node
/**
 * Task Picker for Claude Code
 *
 * Helps identify the next task to work on from skill_audit_refactor.json
 * Prioritizes by:
 * 1. Priority level (P0 > P1 > P2 > P3 > P4)
 * 2. Tasks with test_exists: false (need tests first)
 * 3. Tasks not yet implemented
 *
 * Usage: node task-picker.js [--priority P0-P4] [--skill <skill-name>] [--next]
 */

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(process.cwd(), 'skill_audit_refactor.json');
const CURRENT_TASK_FILE = path.join(process.cwd(), '.claude/hooks/.current-task.json');

/**
 * Load audit refactor tasks
 */
function loadAuditTasks() {
  if (!fs.existsSync(AUDIT_FILE)) {
    console.error('❌ skill_audit_refactor.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
}

/**
 * Get priority order value (lower = higher priority)
 */
function getPriorityOrder(priority) {
  const order = {
    'P0-critical': 0,
    'P1-high': 1,
    'P2-medium': 2,
    'P3-low': 3,
    'P4-optional': 4
  };
  return order[priority] ?? 5;
}

/**
 * Get all pending tasks sorted by priority
 */
function getPendingTasks(auditData, filters = {}) {
  const pendingTasks = [];

  for (const category of auditData.audit_refactor || []) {
    // Apply skill filter
    if (filters.skill && category.skill !== filters.skill) continue;

    // Apply priority filter
    if (filters.priority && category.priority !== filters.priority) continue;

    for (const step of category.steps || []) {
      if (step.implemented) continue; // Skip completed tasks

      const tasks = step.tasks || [];
      const pendingSubtasks = tasks.filter(t => !t.implemented);

      if (pendingSubtasks.length === 0 && step.implemented) continue;

      pendingTasks.push({
        category: category.name,
        categoryId: category.id,
        skill: category.skill,
        priority: category.priority,
        priorityOrder: getPriorityOrder(category.priority),
        stepId: step.id,
        description: step.description,
        file: step.file || step.files?.[0],
        testFile: step.test_file,
        testExists: step.test_exists,
        implemented: step.implemented,
        tested: step.tested,
        subtasks: pendingSubtasks,
        nextSubtask: pendingSubtasks[0]
      });
    }
  }

  // Sort by priority, then by test_exists (tests first)
  pendingTasks.sort((a, b) => {
    if (a.priorityOrder !== b.priorityOrder) {
      return a.priorityOrder - b.priorityOrder;
    }
    // Prioritize tasks needing tests
    if (a.testExists !== b.testExists) {
      return a.testExists ? 1 : -1;
    }
    return 0;
  });

  return pendingTasks;
}

/**
 * Format task for display
 */
function formatTask(task, verbose = false) {
  const lines = [];
  const testStatus = task.testExists ? '✅' : '❌';
  const implStatus = task.implemented ? '✅' : '⏳';

  lines.push(`\n${'═'.repeat(60)}`);
  lines.push(`📋 ${task.description}`);
  lines.push(`${'─'.repeat(60)}`);
  lines.push(`ID: ${task.stepId}`);
  lines.push(`Skill: ${task.skill} | Priority: ${task.priority}`);
  lines.push(`File: ${task.file || 'N/A'}`);
  lines.push(`Test: ${testStatus} ${task.testFile || 'N/A'}`);
  lines.push(`Status: Test ${testStatus} | Impl ${implStatus}`);

  if (verbose && task.subtasks?.length > 0) {
    lines.push(`\nSubtasks (${task.subtasks.length} pending):`);
    for (const subtask of task.subtasks.slice(0, 5)) {
      const icon = subtask.type === 'test-first' ? '🧪' :
                   subtask.type === 'implementation' ? '🔧' :
                   subtask.type === 'validation' ? '✓' :
                   subtask.type === 'visual-test' ? '📸' : '•';
      lines.push(`  ${icon} ${subtask.task}`);
    }
    if (task.subtasks.length > 5) {
      lines.push(`  ... and ${task.subtasks.length - 5} more`);
    }
  }

  if (task.nextSubtask) {
    lines.push(`\n▶️  NEXT ACTION: ${task.nextSubtask.task}`);
    lines.push(`   Type: ${task.nextSubtask.type}`);
  }

  return lines.join('\n');
}

/**
 * Save current task for hooks
 */
function setCurrentTask(task) {
  const dir = path.dirname(CURRENT_TASK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CURRENT_TASK_FILE, JSON.stringify(task, null, 2));
}

/**
 * Generate summary statistics
 */
function generateSummary(auditData) {
  const stats = {
    total: 0,
    completed: 0,
    pending: 0,
    needTests: 0,
    byPriority: {},
    bySkill: {}
  };

  for (const category of auditData.audit_refactor || []) {
    for (const step of category.steps || []) {
      stats.total++;

      if (step.implemented && step.tested) {
        stats.completed++;
      } else {
        stats.pending++;
      }

      if (step.test_exists === false) {
        stats.needTests++;
      }

      // By priority
      stats.byPriority[category.priority] = (stats.byPriority[category.priority] || 0) + 1;

      // By skill
      stats.bySkill[category.skill] = (stats.bySkill[category.skill] || 0) + 1;
    }
  }

  return stats;
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2);
  const auditData = loadAuditTasks();

  const filters = {};
  let showNext = false;
  let showSummary = false;
  let verbose = false;
  let limit = 5;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--priority' && args[i + 1]) {
      filters.priority = args[++i];
    } else if (args[i] === '--skill' && args[i + 1]) {
      filters.skill = args[++i];
    } else if (args[i] === '--next') {
      showNext = true;
    } else if (args[i] === '--summary') {
      showSummary = true;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      verbose = true;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--help') {
      console.log(`
Task Picker - Find next audit refactor task

Usage: node task-picker.js [options]

Options:
  --next          Show only the next task to work on
  --summary       Show summary statistics
  --priority P0   Filter by priority (P0-critical, P1-high, etc.)
  --skill <name>  Filter by skill (nuxt, vue, reka-ui, etc.)
  --verbose, -v   Show subtasks
  --limit <n>     Limit results (default: 5)
  --help          Show this help

Examples:
  node task-picker.js --next
  node task-picker.js --priority P0-critical
  node task-picker.js --skill nuxt --verbose
  node task-picker.js --summary
`);
      process.exit(0);
    }
  }

  // Show summary
  if (showSummary) {
    const stats = generateSummary(auditData);
    console.log('\n📊 AUDIT REFACTOR SUMMARY');
    console.log('═'.repeat(40));
    console.log(`Total Steps: ${stats.total}`);
    console.log(`Completed: ${stats.completed} (${Math.round(stats.completed / stats.total * 100)}%)`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Need Tests First: ${stats.needTests}`);
    console.log('\nBy Priority:');
    for (const [priority, count] of Object.entries(stats.byPriority)) {
      console.log(`  ${priority}: ${count}`);
    }
    console.log('\nBy Skill:');
    for (const [skill, count] of Object.entries(stats.bySkill)) {
      console.log(`  ${skill}: ${count}`);
    }
    process.exit(0);
  }

  const pendingTasks = getPendingTasks(auditData, filters);

  if (pendingTasks.length === 0) {
    console.log('✅ All tasks completed! No pending work.');
    process.exit(0);
  }

  // Show next task only
  if (showNext) {
    const nextTask = pendingTasks[0];
    console.log(formatTask(nextTask, true));

    // Save for hooks
    setCurrentTask(nextTask);

    // Provide TDD guidance
    if (!nextTask.testExists) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log('🧪 TDD WORKFLOW:');
      console.log('1. Create test file: ' + nextTask.testFile);
      console.log('2. Write failing test cases');
      console.log('3. Run: pnpm test ' + nextTask.testFile);
      console.log('4. Update skill_audit_refactor.json: "test_exists": true');
      console.log('5. Implement the fix');
      console.log('6. Run tests again (should pass)');
      console.log('7. Visual review if needed');
    }

    process.exit(0);
  }

  // Show list of pending tasks
  console.log(`\n📋 PENDING TASKS (${pendingTasks.length} total, showing ${Math.min(limit, pendingTasks.length)})`);

  for (const task of pendingTasks.slice(0, limit)) {
    console.log(formatTask(task, verbose));
  }

  if (pendingTasks.length > limit) {
    console.log(`\n... and ${pendingTasks.length - limit} more tasks`);
    console.log('Use --limit to see more, or --next for the highest priority task');
  }
}

main();
