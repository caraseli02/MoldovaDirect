# GitHub Project Automation Setup

## Steps


This guide shows how to bootstrap a GitHub Project and keep it in sync with issues using the tooling added in this repository.

## Prerequisites

1. **Personal access token (fine-grained or classic)** with the following scopes:
   - `project` (read/write)
   - `repo` (read/write)
2. [GitHub CLI](https://cli.github.com/) _or_ curl for testing (optional).
3. Node.js 22 or newer (matches the repo `engines` requirement).

## 1. Create the project and config file

Run the setup script with your GitHub token:

```bash
GITHUB_TOKEN=<your_token> node scripts/setup-github-project.mjs \
  --owner=<org-or-user> \
  --title="<Project name>" \
  --areas="API,Frontend,Operations" \
  --priority="Critical,High,Medium,Low"
```

> ℹ️ Prefer not to export variables each time? Add `GITHUB_TOKEN=<your_token>` to your local `.env` file—the setup script now
> loads it automatically via [`dotenv`](https://github.com/motdotla/dotenv).

The script will:

- Create a **Projects (beta)** board owned by the user or organization you pass in.
- Add custom fields: `Stage`, `Priority`, `Area`, `Owner`, `Target Date`, and `Iteration`.
- Generate `project-automation.config.json` with all of the project/field/option IDs required by the automation workflow. Any previous config is backed up automatically.
- Seed area options for the domains already covered by our issue backlog (Admin, API, Authentication, Checkout, Payments, Security, Performance, Mobile, User Facing, UX, Analytics, Compliance, Quality).
- Populate label mappings so existing labels like `critical`, `high-priority`, `security`, `admin`, or `testing` automatically sync into the proper Stage, Priority, and Area values.

After the script finishes, commit the generated `project-automation.config.json`:

```bash
git add project-automation.config.json
git commit -m "chore(projects): track automation config"
```

> 💡 Want different lanes or priorities? Pass custom `--areas` or `--priority` lists; the config will include the matching option IDs.

## 2. Store the automation token

Create a repository secret named **`PROJECT_AUTOMATION_TOKEN`** that contains the same token you used for the setup script (or another token with the same scopes). The GitHub Actions workflow reads this secret when it needs to modify the project.

1. Navigate to **Settings → Secrets and variables → Actions**.
2. Click **New repository secret**.
3. Name it `PROJECT_AUTOMATION_TOKEN` and paste the token value.
4. Save.

## 3. Push the workflow

Once the config file is committed and the secret is stored, push the changes (including this workflow) to `main`.

The workflow `.github/workflows/project-automation.yml` listens to issue events and will:

- Ensure the issue is present on the project board.
- Update the **Stage** column based on labels (`ready`, `blocked`, `review`), assignments, or close events.
- Map priority labels (e.g., `priority/*`, `critical`, `high-priority`, `medium-priority`) to the **Priority** field (`Critical`, `High`, `Medium`, `Low`).
- Map area labels (either `area/*` or backlog labels like `admin`, `security`, `testing`) to the **Area** field when the option exists.
- Mirror assignees into the **Owner** text field.
- Copy the milestone due date into **Target Date**.

## 4. Understand the generated config

The `project-automation.config.json` file now includes label-mapping helpers so existing issues flow into the correct fields without renaming their labels. A simplified excerpt looks like this:

```json
{
  "stageLabelMappings": {
    "ready": "Ready",
    "in-progress": "In Progress",
    "needs-spec": "Backlog"
  },
  "priorityLabelMappings": {
    "critical": "Critical",
    "high-priority": "High",
    "medium-priority": "Medium"
  },
  "areaLabelMappings": {
    "admin": "Admin",
    "security": "Security",
    "testing": "Quality"
  }
}
```

Add or remove entries as your label taxonomy evolves—the automation reads these mappings on every run. If you introduce a new area (for example `observability`), add it to the project via the setup script (or manually in the project UI) and extend `areaLabelMappings` with the new label → option pair.

## 5. Backfill existing issues automatically

To keep historical issues aligned, the workflow now supports both manual and scheduled syncs:

- **Manual run:** Navigate to **Actions → Project automation → Run workflow** to trigger a full backfill of every issue in the repository. This is ideal after large-scale label changes.
- **Nightly schedule:** A daily cron job (03:00 UTC) reprocesses open and closed issues so late label edits or milestone changes stay in sync without additional clicks.

Both modes reuse the same logic as live issue events, so every issue ends up with the current Stage, Priority, Area, Owner, and Target Date values defined in the project.

## 6. Label & milestone conventions

To get full value from the automation, adopt the following conventions:

- Apply `ready`, `blocked`, and `review` labels to drive column changes.
- Use `priority/critical`, `priority/high`, `priority/medium`, or `priority/low` labels for backlog ordering.
- Tag issues with `area/<name>` labels that correspond to the options created during setup.
- Add milestones with due dates to populate the **Target Date** field.

## 7. Customize further (optional)

- Re-run the setup script with the `--output` flag if you want to generate a preview config before committing.
- Extend the GitHub Actions workflow to sync pull requests by duplicating the job under an additional `pull_request` trigger.
- Use the `projectNumber` and `projectUrl` values from the config file to wire dashboards or documentation references.

With these pieces in place every new or updated issue will flow straight onto your project board with the right metadata—no manual triage required.
