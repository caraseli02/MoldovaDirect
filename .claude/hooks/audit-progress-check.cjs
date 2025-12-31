#!/usr/bin/env node
/**
 * Stop Hook: Audit Progress Check
 *
 * Checks skill_audit_refactor.json to see if all tasks are completed.
 * If tasks remain, outputs a message to continue working on them.
 */

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, '../../skill_audit_refactor.json');

function checkAuditProgress() {
  try {
    if (!fs.existsSync(AUDIT_FILE)) {
      // No audit file, nothing to check
      process.exit(0);
    }

    const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
    const audit = JSON.parse(content);

    // Count total and completed tasks across all categories
    let totalTasks = 0;
    let completedTasks = 0;
    const pendingTasks = [];

    // Handle audit_refactor structure
    const categories = audit.audit_refactor || audit.categories || [];

    if (Array.isArray(categories)) {
      for (const category of categories) {
        if (category.steps && Array.isArray(category.steps)) {
          for (const step of category.steps) {
            totalTasks++;
            if (step.implemented === true && step.tested === true) {
              completedTasks++;
            } else if (step.implemented === false) {
              pendingTasks.push({
                id: step.id,
                description: step.description,
                file: step.file || 'N/A',
                category: category.name || category.id
              });
            }
          }
        }
      }
    }

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (pendingTasks.length > 0) {
      // There are still tasks to complete
      const nextTask = pendingTasks[0];

      console.log(`\n⚠️  AUDIT PROGRESS: ${completedTasks}/${totalTasks} tasks completed (${progress}%)`);
      console.log(`\n📋 ${pendingTasks.length} tasks remaining.`);
      console.log(`\n🎯 Next task: ${nextTask.id} - ${nextTask.description}`);
      if (nextTask.file !== 'N/A') {
        console.log(`   File: ${nextTask.file}`);
      }
      console.log(`\n💡 Continue with the TDD workflow to complete remaining audit tasks.`);

      // Exit with code 0 but with output - this is informational
      process.exit(0);
    } else if (totalTasks > 0) {
      console.log(`\n✅ AUDIT COMPLETE: All ${totalTasks} tasks have been implemented and tested!`);
      process.exit(0);
    }

    // No tasks found or empty audit
    process.exit(0);

  } catch (error) {
    // Don't block on errors, just log and continue
    console.error(`[audit-progress-check] Error: ${error.message}`);
    process.exit(0);
  }
}

checkAuditProgress();
