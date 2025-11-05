# GitHub Project Automation - How It Works

## Overview

The automation workflow syncs GitHub issues to your project board automatically, keeping everything organized without manual work.

---

## 🚀 When Does It Run?

The workflow triggers automatically on these events:

### 1. **Issue Events** (Real-time)
- ✅ **New issue created** → Adds to project immediately
- ✅ **Issue edited** → Updates project fields
- ✅ **Issue closed** → Moves to "Done" column
- ✅ **Issue reopened** → Moves back to appropriate status
- ✅ **Label added/removed** → Updates priority/status automatically
- ✅ **Assignee added/removed** → Updates status and owner field

### 2. **Manual Trigger** (On-demand)
- Run workflow from GitHub Actions tab
- Use for: Testing, bulk updates, fixing sync issues

### 3. **Scheduled** (Daily at 3 AM)
- Syncs all existing issues
- Catches any missed updates
- Ensures project stays in sync

---

## 🎯 What Does It Do?

### Step 1: Add Issue to Project
When a new issue is created, it automatically:
1. Adds the issue to your "Moldova Direct" project
2. Sets up all the project fields

### Step 2: Auto-Set Status
Based on issue state and labels:

| Condition | Status Set |
|-----------|------------|
| Issue is closed | **Done** ✅ |
| Has label `blocked` | **Todo** |
| Has label `ready` | **Todo** |
| Has label `in-progress` | **In Progress** 🔄 |
| Has label `review` | **In Progress** |
| Has assignee | **In Progress** 🔄 |
| Otherwise | **Todo** 📋 |

### Step 3: Auto-Set Priority
Based on issue labels:

| Label | Priority Set |
|-------|-------------|
| `critical`, `p0`, `urgent` | **P0 - Critical** 🔴 |
| `high`, `p1` | **P1 - High** 🟠 |
| `medium`, `p2` | **P2 - Medium** 🟡 |
| `low`, `p3` | **P3 - Low** 🟢 |
| No priority label | **P2 - Medium** (default) |

### Step 4: Set Target Date
- If issue has a milestone with due date → Sets target date automatically
- This makes the roadmap view show timeline

---

## 📊 How Your Roadmap View Works

Your project has a roadmap view that shows:

### Timeline View
```
┌─────────────────────────────────────────────────────────┐
│  Week 1          Week 2          Week 3          Week 4 │
├─────────────────────────────────────────────────────────┤
│  [P0] Issue #1 ━━━━━━┓                                  │
│  [P0] Issue #2 ━━━━━━┫ (Security Phase)                │
│                       ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│                       [P1] Issue #3 ━━━━━━━━━━━━━━━┫  │
│                                                     ┃  │
│                                                (Performance) │
└─────────────────────────────────────────────────────────┘
```

### Priority Lanes
Issues automatically organize by priority:
- **P0 - Critical**: Top of the board (red)
- **P1 - High**: Second priority (orange)
- **P2 - Medium**: Normal work (yellow)
- **P3 - Low**: Nice-to-have (green)

---

## 🔧 Configuration File Explained

Your `project-automation.config.json`:

```json
{
  "projectId": "PVT_kwHOAqMOYs4BHDyV",  // Your Moldova Direct project

  // Status field mapping
  "stageFieldId": "PVTSSF_lAHOAqMOYs4BHDyVzg37F8c",
  "stageOptionIds": {
    "Todo": "f75ad846",          // Maps to "Todo" column
    "In Progress": "47fc9ee4",   // Maps to "In Progress" column
    "Done": "98236657"           // Maps to "Done" column
  },

  // Label → Status mapping
  "stageLabelMappings": {
    "blocked": "Todo",            // Label "blocked" → Todo column
    "ready": "Todo",              // Label "ready" → Todo column
    "in-progress": "In Progress", // Label "in-progress" → In Progress
    "review": "In Progress",      // Label "review" → In Progress
    "done": "Done"                // Label "done" → Done
  },

  // Priority field mapping
  "priorityFieldId": "PVTSSF_lAHOAqMOYs4BHDyVzg37H_k",
  "priorityOptionIds": {
    "P0 - Critical": "8c426582",
    "P1 - High": "352b6cec",
    "P2 - Medium": "4244068e",
    "P3 - Low": "e1826102"
  },

  // Label → Priority mapping
  "priorityLabelMappings": {
    "critical": "P0 - Critical",
    "p0": "P0 - Critical",
    "urgent": "P0 - Critical",
    "high": "P1 - High",
    "p1": "P1 - High",
    "medium": "P2 - Medium",
    "p2": "P2 - Medium",
    "low": "P3 - Low",
    "p3": "P3 - Low"
  },

  // Target date from milestones
  "targetDateFieldId": "PVTF_lAHOAqMOYs4BHDyVzg37IAQ"
}
```

---

## 📋 Example Workflows

### Example 1: Create a New Critical Bug
**You do:**
1. Create GitHub issue
2. Add label `critical`
3. Add label `bug`

**Automation does:**
- ✅ Adds issue to project
- ✅ Sets Status: "Todo"
- ✅ Sets Priority: "P0 - Critical"
- ✅ Shows up at top of roadmap (red priority)

---

### Example 2: Start Working on a Task
**You do:**
1. Assign yourself to issue
2. Add label `in-progress`

**Automation does:**
- ✅ Moves to "In Progress" column
- ✅ Keeps priority as-is
- ✅ Updates roadmap to show active work

---

### Example 3: Complete a Feature
**You do:**
1. Close the issue

**Automation does:**
- ✅ Moves to "Done" column automatically
- ✅ Marks as complete in roadmap
- ✅ Updates project completion percentage

---

### Example 4: Plan a Roadmap Phase
**You do:**
1. Create milestone "Phase 1: Security Fixes"
2. Set milestone due date: 2025-11-15
3. Add issues to milestone
4. Add labels for priority

**Automation does:**
- ✅ Sets target date on all issues: 2025-11-15
- ✅ Sets priority based on labels
- ✅ Roadmap view shows timeline automatically
- ✅ Shows all Phase 1 issues grouped together

---

## 🎨 Your Current Project Setup

Your project has these views:

### 1. **Board View** (Default)
```
┌─────────┬──────────────┬────────┐
│  Todo   │ In Progress  │  Done  │
├─────────┼──────────────┼────────┤
│ Issue 1 │   Issue 3    │ Issue 7│
│ Issue 2 │   Issue 4    │ Issue 8│
│ Issue 5 │   Issue 6    │        │
└─────────┴──────────────┴────────┘
```

### 2. **Roadmap View** (Timeline)
Shows issues arranged by:
- **Target Date** (X-axis) - When they're due
- **Priority** (Y-axis) - How critical they are
- Perfect for planning sprints and phases!

### 3. **Table View**
Spreadsheet-like view with all fields:
- Title
- Status
- Priority
- Assignee
- Target Date
- Labels

---

## 🔐 Security Token Setup

**IMPORTANT:** The workflow needs a token to work.

You need to create `PROJECT_AUTOMATION_TOKEN` in your repository secrets:

1. Go to https://github.com/settings/tokens/new
2. Create a Personal Access Token (classic)
3. Select scopes:
   - ✅ `repo` (Full control of repositories)
   - ✅ `project` (Full control of projects)
4. Copy the token
5. Go to your repo → Settings → Secrets → Actions
6. Add new secret: `PROJECT_AUTOMATION_TOKEN`
7. Paste the token

**Without this token, the automation won't work!**

---

## 📈 Benefits

### Time Saved
- **Before:** Manually drag 50+ issues to project board (30 mins)
- **After:** Automatic (0 mins)

### Always Up-to-Date
- Project syncs in real-time
- No stale data
- No forgotten issues

### Better Planning
- Roadmap view shows timeline
- Priority clearly visible
- Easy to see what's blocked

### Team Coordination
- Everyone sees current status
- Clear priorities
- No confusion about what to work on

---

## 🧪 Testing the Automation

After merging to main:

### Test 1: Create an issue
```bash
gh issue create --title "Test automation" --label "p1,bug"
```
**Expected:** Issue appears in project with Priority "P1 - High"

### Test 2: Assign yourself
```bash
gh issue edit 100 --add-assignee @me
```
**Expected:** Issue moves to "In Progress"

### Test 3: Close issue
```bash
gh issue close 100
```
**Expected:** Issue moves to "Done"

---

## 🐛 Troubleshooting

### Issue not appearing in project?
- Check workflow runs in Actions tab
- Verify `PROJECT_AUTOMATION_TOKEN` is set
- Check config file is in main branch

### Priority not set correctly?
- Check label spelling (case-insensitive)
- Review `priorityLabelMappings` in config
- Labels like `p0`, `critical`, `urgent` all map to P0

### Status wrong?
- Check if issue is assigned (auto-sets In Progress)
- Check label mappings in config
- Remember: Closed issues always go to Done

---

## 🎯 Integration with Your Roadmap Document

Your `docs/ARCHITECTURE_IMPROVEMENT_ROADMAP.md` defines:
- **Phase 1:** Security (Week 1) - P0 priority
- **Phase 2:** Performance (Week 1-2) - P1 priority
- **Phase 3:** Code Quality (Week 3-4) - P2 priority
- **Phase 4:** Testing (Week 5) - P2 priority

**How to use automation with roadmap:**

1. Create milestone for each phase
2. Set due dates matching roadmap timeline
3. Create issues from roadmap tasks
4. Add to milestones
5. Add priority labels (p0, p1, p2)
6. Automation handles the rest!

The project roadmap view will show your entire plan visually!

---

## 🚀 Next Steps

Once merged to main:

1. ✅ Create `PROJECT_AUTOMATION_TOKEN` secret
2. ✅ Create milestones for roadmap phases
3. ✅ Create issues from roadmap document
4. ✅ Add labels and assignments
5. ✅ Watch automation organize everything!

---

**Questions?** Check the workflow logs in Actions tab or review this document.
