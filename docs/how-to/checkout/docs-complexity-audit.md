# Documentation Complexity Audit

## Overview

[Add high-level overview here]


**Date:** 2026-01-13
**Scope:** `docs/` directory hierarchy
**Auditor:** Antigravity

## Executive Summary

The documentation is **comprehensive and well-organized**, but suffers from **information bloat** due to an accumulation of historical reports, "one-off" fix summaries, and architectural decision records (ADRs) mixed with living documentation.

While the *structure* is sound (using `archive/`, `specs/`, `architecture/`), the *content* within these folders often blurs the line between "current truth" and "historical context."

## 📊 Quick Stats

*   **Total Files**: ~90 Markdown files
*   **Active Guides**: ~15 (e.g., `QUICK_START`, `PROJECT_STATUS`)
*   **Historical/Archived**: ~40+ (in `docs/archive`)
*   **Grey Area**: ~35 files (in `architecture/`, `analysis/`, `specs/`) that may be outdated.

---

## 📂 Structural Analysis

### 1. 🟢 The "Good" (Keep as is)
*   **Root `README.md`**: Excellent entry point.
*   **`getting-started/`**: Lean, actionable, up-to-date.
*   **`status/`**: `PROJECT_STATUS.md` is the single source of truth.
*   **`meta/`**: Policies are clear.

### 2. 🟡 The "Cluttered" (Needs Grooming)
*   **`architecture/`**: This folder mixes **timeless system design** (e.g., `CHECKOUT_FLOW.md`) with **point-in-time reports** (e.g., `BUILD_SUCCESS_REPORT.md`, `PR_258_...`).
    *   *Risk*: A developer might read `AccESSIBILITY_REFACTORING_PLAN` and think it's pending, when it might be done.
*   **`analysis/`**: Contains dated reports (`CODE_REVIEW_2025.md`) that belong in the archive.
*   **`specs/`**: mostly fine, but `requirements.md` and `tasks.md` in the root are ambiguous.

### 3. 🔴 The "Noise" (Candidates for Archive/Delete)
*   Fix Summaries outside of archive (e.g., one-off build fix reports).
*   Duplicate "README" files in subfolders if they don't add value.

---

## 🚀 Action Plan

### Phase 1: Clarify "Living" vs "Historical"
**Goal**: The `docs/architecture` folder should only contain current system design.

1.  **Move to Archive**:
    *   `docs/architecture/BUILD_SUCCESS_REPORT.md` -> `docs/archive/reports/`
    *   `docs/architecture/ASSET_OPTIMIZATION_SUMMARY.md` -> `docs/archive/reports/`
    *   `docs/architecture/PR_258_...` -> `docs/archive/reviews/`
    *   `docs/architecture/*_PLAN.md` -> `docs/archive/plans/` (if completing)
2.  **Move to Archive**:
    *   `docs/analysis/CODE_REVIEW_2025.md` -> `docs/archive/reviews/`
    *   `docs/analysis/DOCUMENTATION_REVIEW_...` -> `docs/archive/reviews/`

### Phase 2: Consolidate Specs
**Goal**: Make `docs/specs` navigable.

1.  Move root `requirements.md` and `tasks.md` into a specific functional folder (e.g., `specs/general-requirements/`) OR rename them to be clearly global (e.g., `GLOBAL_REQUIREMENTS.md`).

### Phase 3: Maintenance
1.  Adopt a "Wiki" mindset: If a doc isn't being read or updated, archive it.
2.  Use the `PROJECT_STATUS.md` as the main navigational hub for "what are we building now".

## ✅ Conclusion
The complexity comes not from the *number* of files, but from the **cognitive load** of distinguishing current docs from past reports. By aggressively archiving point-in-time documents, we can reduce the "active" documentation set by ~40%, making the codebase feel much lighter.
