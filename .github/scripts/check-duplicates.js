#!/usr/bin/env node

/**
 * Duplicate Issue Detection Script
 *
 * This script helps detect potential duplicate issues by:
 * 1. Analyzing issue titles and descriptions
 * 2. Finding similar keywords and phrases
 * 3. Checking label overlap
 * 4. Reporting potential duplicates
 *
 * Usage:
 *   node .github/scripts/check-duplicates.js [issue-number]
 *   node .github/scripts/check-duplicates.js --all
 */

import { execSync } from 'child_process';

// Minimum similarity score to flag as potential duplicate (0-100)
const SIMILARITY_THRESHOLD = 70;

// Keywords that indicate similar issues
const KEYWORD_GROUPS = {
  auth: ['authentication', 'auth', 'login', 'logout', 'session', 'mfa', '2fa'],
  performance: ['performance', 'slow', 'optimization', 'n+1', 'query', 'cache', 'speed'],
  security: ['security', 'vulnerability', 'exploit', 'xss', 'csrf', 'injection', 'auth'],
  cart: ['cart', 'checkout', 'order', 'payment', 'stripe'],
  admin: ['admin', 'dashboard', 'backend'],
  ui: ['ui', 'ux', 'interface', 'component', 'design'],
  database: ['database', 'sql', 'query', 'migration', 'schema'],
};

// Get all open issues
function getAllIssues() {
  try {
    const output = execSync('gh issue list --state open --limit 1000 --json number,title,body,labels', {
      encoding: 'utf-8',
    });
    return JSON.parse(output);
  } catch (error) {
    console.error('Error fetching issues:', error.message);
    process.exit(1);
  }
}

// Get single issue
function getIssue(number) {
  try {
    const output = execSync(`gh issue view ${number} --json number,title,body,labels`, {
      encoding: 'utf-8',
    });
    return JSON.parse(output);
  } catch (error) {
    console.error(`Error fetching issue #${number}:`, error.message);
    process.exit(1);
  }
}

// Normalize text for comparison
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract keywords from text
function extractKeywords(text) {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');

  // Filter out common words
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their']);

  return words.filter(word => word.length > 2 && !commonWords.has(word));
}

// Calculate Jaccard similarity between two sets of keywords
function calculateSimilarity(keywords1, keywords2) {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

// Check if issues share category labels
function hasSharedCategory(labels1, labels2) {
  const categories = new Set(['security', 'performance', 'bug', 'enhancement', 'refactoring', 'cart', 'checkout', 'admin', 'ui', 'database']);

  const cats1 = new Set(labels1.map(l => l.name).filter(n => categories.has(n)));
  const cats2 = new Set(labels2.map(l => l.name).filter(n => categories.has(n)));

  const intersection = new Set([...cats1].filter(x => cats2.has(x)));
  return intersection.size > 0;
}

// Find keyword group matches
function getKeywordGroupMatches(text) {
  const normalized = normalizeText(text);
  const matches = [];

  for (const [group, keywords] of Object.entries(KEYWORD_GROUPS)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      matches.push(group);
    }
  }

  return matches;
}

// Find potential duplicates for an issue
function findDuplicates(targetIssue, allIssues) {
  const targetKeywords = extractKeywords(`${targetIssue.title} ${targetIssue.body || ''}`);
  const targetGroups = getKeywordGroupMatches(`${targetIssue.title} ${targetIssue.body || ''}`);

  const potentialDuplicates = [];

  for (const issue of allIssues) {
    if (issue.number === targetIssue.number) continue;

    const issueKeywords = extractKeywords(`${issue.title} ${issue.body || ''}`);
    const issueGroups = getKeywordGroupMatches(`${issue.title} ${issue.body || ''}`);

    // Calculate text similarity
    const similarity = calculateSimilarity(targetKeywords, issueKeywords);

    // Check for shared category labels
    const sharedCategory = hasSharedCategory(targetIssue.labels || [], issue.labels || []);

    // Check for keyword group overlap
    const groupOverlap = targetGroups.filter(g => issueGroups.includes(g));

    // Boost score if same category
    let adjustedScore = similarity;
    if (sharedCategory) {
      adjustedScore += 10;
    }
    if (groupOverlap.length > 0) {
      adjustedScore += groupOverlap.length * 5;
    }

    if (adjustedScore >= SIMILARITY_THRESHOLD) {
      potentialDuplicates.push({
        issue,
        similarity: Math.round(adjustedScore),
        sharedCategory,
        groupOverlap,
      });
    }
  }

  // Sort by similarity
  return potentialDuplicates.sort((a, b) => b.similarity - a.similarity);
}

// Format output
function printDuplicates(targetIssue, duplicates) {
  console.log('\n' + '='.repeat(80));
  console.log(`Checking issue #${targetIssue.number}: ${targetIssue.title}`);
  console.log('='.repeat(80));

  if (duplicates.length === 0) {
    console.log('\n✅ No potential duplicates found\n');
    return;
  }

  console.log(`\n⚠️  Found ${duplicates.length} potential duplicate(s):\n`);

  for (const { issue, similarity, sharedCategory, groupOverlap } of duplicates) {
    console.log(`📌 Issue #${issue.number} (${similarity}% similar)`);
    console.log(`   Title: ${issue.title}`);

    if (sharedCategory) {
      console.log('   ✓ Shares category labels');
    }

    if (groupOverlap.length > 0) {
      console.log(`   ✓ Related topics: ${groupOverlap.join(', ')}`);
    }

    console.log('');
  }

  console.log('To view an issue: gh issue view <number>');
  console.log('To mark as duplicate: comment "Duplicate of #<number>" and close\n');
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  console.log('🔍 Fetching issues...');
  const allIssues = getAllIssues();
  console.log(`Found ${allIssues.length} open issues`);

  if (args.length === 0) {
    console.log('\nUsage:');
    console.log('  node check-duplicates.js <issue-number>  # Check specific issue');
    console.log('  node check-duplicates.js --all           # Check all recent issues');
    console.log('  node check-duplicates.js --recent N      # Check last N issues\n');
    process.exit(0);
  }

  if (args[0] === '--all') {
    console.log('\n🔍 Checking all issues for duplicates...\n');

    const duplicatesFound = [];

    for (const issue of allIssues) {
      const duplicates = findDuplicates(issue, allIssues);
      if (duplicates.length > 0) {
        duplicatesFound.push({ issue, duplicates });
      }
    }

    if (duplicatesFound.length === 0) {
      console.log('✅ No duplicates found across all issues\n');
      return;
    }

    console.log(`⚠️  Found potential duplicates for ${duplicatesFound.length} issue(s):\n`);

    for (const { issue, duplicates } of duplicatesFound) {
      console.log(`#${issue.number}: ${issue.title}`);
      for (const { issue: dup, similarity } of duplicates.slice(0, 3)) {
        console.log(`  → #${dup.number} (${similarity}% similar): ${dup.title.slice(0, 60)}...`);
      }
      console.log('');
    }

    return;
  }

  if (args[0] === '--recent') {
    const count = parseInt(args[1]) || 10;
    console.log(`\n🔍 Checking last ${count} issues...\n`);

    const recentIssues = allIssues.slice(0, count);

    for (const issue of recentIssues) {
      const duplicates = findDuplicates(issue, allIssues);
      if (duplicates.length > 0) {
        printDuplicates(issue, duplicates);
      }
    }

    return;
  }

  // Check specific issue
  const issueNumber = parseInt(args[0]);
  if (isNaN(issueNumber)) {
    console.error('Error: Invalid issue number');
    process.exit(1);
  }

  console.log(`\n🔍 Checking issue #${issueNumber}...\n`);
  const targetIssue = getIssue(issueNumber);
  const duplicates = findDuplicates(targetIssue, allIssues);

  printDuplicates(targetIssue, duplicates);
}

main();
