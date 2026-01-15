/**
 * Tests for Quality Validator
 */

import { describe, it, expect } from 'vitest'
import { QualityValidator } from '../quality-validator'
import type { FileInfo } from '../types'

describe('QualityValidator - Link Validation', () => {
  const validator = new QualityValidator()

  it('should validate all internal links are valid', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/README.md',
        name: 'README.md',
        size: 100,
        lastModified: new Date(),
        content: `# Documentation
        
[Getting Started](./getting-started.md)
[API Reference](./api/reference.md)
`,
      },
      {
        path: 'docs/getting-started.md',
        name: 'getting-started.md',
        size: 200,
        lastModified: new Date(),
        content: '# Getting Started',
      },
      {
        path: 'docs/api/reference.md',
        name: 'reference.md',
        size: 300,
        lastModified: new Date(),
        content: '# API Reference',
      },
    ]

    const report = await validator.validateLinks(files)

    expect(report.totalLinks).toBe(2)
    expect(report.validLinks).toBe(2)
    expect(report.brokenLinks).toHaveLength(0)
  })

  it('should detect broken internal links', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/README.md',
        name: 'README.md',
        size: 100,
        lastModified: new Date(),
        content: `# Documentation
        
[Getting Started](./getting-started.md)
[Missing Page](./missing.md)
[Another Missing](./api/missing.md)
`,
      },
      {
        path: 'docs/getting-started.md',
        name: 'getting-started.md',
        size: 200,
        lastModified: new Date(),
        content: '# Getting Started',
      },
    ]

    const report = await validator.validateLinks(files)

    expect(report.totalLinks).toBe(3)
    expect(report.validLinks).toBe(1)
    expect(report.brokenLinks).toHaveLength(2)
    expect(report.brokenLinks[0].link).toBe('./missing.md')
    expect(report.brokenLinks[1].link).toBe('./api/missing.md')
  })

  it('should ignore external links in validation', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/README.md',
        name: 'README.md',
        size: 100,
        lastModified: new Date(),
        content: `# Documentation
        
[External Link](https://example.com)
[Email](mailto:test@example.com)
[Internal](./getting-started.md)
`,
      },
      {
        path: 'docs/getting-started.md',
        name: 'getting-started.md',
        size: 200,
        lastModified: new Date(),
        content: '# Getting Started',
      },
    ]

    const report = await validator.validateLinks(files)

    // Should only count internal link
    expect(report.totalLinks).toBe(1)
    expect(report.validLinks).toBe(1)
  })

  it('should handle links with anchors', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/README.md',
        name: 'README.md',
        size: 100,
        lastModified: new Date(),
        content: `# Documentation
        
[Section](./getting-started.md#installation)
`,
      },
      {
        path: 'docs/getting-started.md',
        name: 'getting-started.md',
        size: 200,
        lastModified: new Date(),
        content: `# Getting Started

## Installation
`,
      },
    ]

    const report = await validator.validateLinks(files)

    expect(report.totalLinks).toBe(1)
    expect(report.validLinks).toBe(1)
  })

  it('should handle relative paths correctly', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/tutorials/getting-started.md',
        name: 'getting-started.md',
        size: 100,
        lastModified: new Date(),
        content: `# Getting Started
        
[Back to Home](../README.md)
[API Reference](../reference/api.md)
`,
      },
      {
        path: 'docs/README.md',
        name: 'README.md',
        size: 200,
        lastModified: new Date(),
        content: '# Documentation',
      },
      {
        path: 'docs/reference/api.md',
        name: 'api.md',
        size: 300,
        lastModified: new Date(),
        content: '# API Reference',
      },
    ]

    const report = await validator.validateLinks(files)

    expect(report.totalLinks).toBe(2)
    expect(report.validLinks).toBe(2)
    expect(report.brokenLinks).toHaveLength(0)
  })

  it('should report line numbers for broken links', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/README.md',
        name: 'README.md',
        size: 100,
        lastModified: new Date(),
        content: `# Documentation

Line 3
[Broken Link](./missing.md)
Line 5
`,
      },
    ]

    const report = await validator.validateLinks(files)

    expect(report.brokenLinks).toHaveLength(1)
    expect(report.brokenLinks[0].line).toBe(4)
  })
})

describe('QualityValidator - Code Example Validation', () => {
  const validator = new QualityValidator()

  it('should validate code examples without placeholders', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/api.md',
        name: 'api.md',
        size: 100,
        lastModified: new Date(),
        content: `# API Documentation

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

\`\`\`javascript
const result = greet('World')
console.log(result)
\`\`\`
`,
      },
    ]

    const report = await validator.validateCodeExamples(files)

    expect(report.totalExamples).toBe(2)
    expect(report.validExamples).toBe(2)
    expect(report.invalidExamples).toHaveLength(0)
  })

  it('should detect code examples with placeholders', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/config.md',
        name: 'config.md',
        size: 100,
        lastModified: new Date(),
        content: `# Configuration

\`\`\`typescript
const config = {
  apiKey: '[YOUR_API_KEY]',
  endpoint: '<your-endpoint>',
  // TODO: Add more config
}
\`\`\`
`,
      },
    ]

    const report = await validator.validateCodeExamples(files)

    expect(report.totalExamples).toBe(1)
    expect(report.validExamples).toBe(0)
    expect(report.invalidExamples).toHaveLength(1)
    expect(report.invalidExamples[0].error).toContain('placeholders')
  })

  it('should detect syntax errors in code examples', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/example.md',
        name: 'example.md',
        size: 100,
        lastModified: new Date(),
        content: `# Example

\`\`\`typescript
function test() {
  const x = {
    a: 1,
    b: 2
  // Missing closing brace
}
\`\`\`
`,
      },
    ]

    const report = await validator.validateCodeExamples(files)

    expect(report.totalExamples).toBe(1)
    expect(report.validExamples).toBe(0)
    expect(report.invalidExamples).toHaveLength(1)
    expect(report.invalidExamples[0].error).toContain('braces')
  })

  it('should skip validation for code blocks without language', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/example.md',
        name: 'example.md',
        size: 100,
        lastModified: new Date(),
        content: `# Example

\`\`\`
This is plain text
No syntax validation needed
\`\`\`
`,
      },
    ]

    const report = await validator.validateCodeExamples(files)

    expect(report.totalExamples).toBe(1)
    expect(report.validExamples).toBe(1)
  })

  it('should report line numbers for invalid code examples', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/example.md',
        name: 'example.md',
        size: 100,
        lastModified: new Date(),
        content: `# Example

Line 3
\`\`\`typescript
const x = [TODO]
\`\`\`
`,
      },
    ]

    const report = await validator.validateCodeExamples(files)

    expect(report.invalidExamples).toHaveLength(1)
    expect(report.invalidExamples[0].line).toBe(4)
    expect(report.invalidExamples[0].language).toBe('typescript')
  })
})

describe('QualityValidator - Structure Validation', () => {
  const validator = new QualityValidator()

  it('should validate tutorial structure with required sections', () => {
    const file: FileInfo = {
      path: 'docs/tutorials/getting-started.md',
      name: 'getting-started.md',
      size: 100,
      lastModified: new Date(),
      content: `# Getting Started

## Introduction

Welcome to the tutorial.

## Prerequisites

- Node.js 18+
- npm or yarn

## Steps

### Step 1: Install

\`\`\`bash
npm install
\`\`\`

### Step 2: Run

\`\`\`bash
npm start
\`\`\`
`,
      category: 'tutorial',
    }

    const report = validator.validateStructure(file, 'tutorial')

    expect(report.hasRequiredSections).toBe(true)
    expect(report.missingSections).toHaveLength(0)
  })

  it('should detect missing sections in tutorial', () => {
    const file: FileInfo = {
      path: 'docs/tutorials/incomplete.md',
      name: 'incomplete.md',
      size: 100,
      lastModified: new Date(),
      content: `# Incomplete Tutorial

## Introduction

This tutorial is missing prerequisites and steps.
`,
      category: 'tutorial',
    }

    const report = validator.validateStructure(file, 'tutorial')

    expect(report.hasRequiredSections).toBe(false)
    expect(report.missingSections).toContain('Prerequisites')
    expect(report.missingSections).toContain('Steps')
  })

  it('should validate how-to structure', () => {
    const file: FileInfo = {
      path: 'docs/how-to/deploy.md',
      name: 'deploy.md',
      size: 100,
      lastModified: new Date(),
      content: `# How to Deploy

## Prerequisites

- AWS account
- CLI tools

## Steps

1. Build the project
2. Deploy to AWS
`,
      category: 'how-to',
    }

    const report = validator.validateStructure(file, 'how-to')

    expect(report.hasRequiredSections).toBe(true)
    expect(report.missingSections).toHaveLength(0)
  })

  it('should validate reference structure', () => {
    const file: FileInfo = {
      path: 'docs/reference/api.md',
      name: 'api.md',
      size: 100,
      lastModified: new Date(),
      content: `# API Reference

## Overview

This is the API documentation.

## Parameters

- \`id\`: string - The resource ID
- \`options\`: object - Configuration options

## Examples

\`\`\`typescript
api.get({ id: '123' })
\`\`\`
`,
      category: 'reference',
    }

    const report = validator.validateStructure(file, 'reference')

    expect(report.hasRequiredSections).toBe(true)
    expect(report.missingSections).toHaveLength(0)
  })

  it('should provide recommendations for tutorials', () => {
    const file: FileInfo = {
      path: 'docs/tutorials/no-steps.md',
      name: 'no-steps.md',
      size: 100,
      lastModified: new Date(),
      content: `# Tutorial

## Introduction
## Prerequisites
## Implementation
`,
      category: 'tutorial',
    }

    const report = validator.validateStructure(file, 'tutorial')

    expect(report.recommendations).toContain('Tutorials should include step-by-step instructions')
  })

  it('should provide recommendations for how-to guides', () => {
    const file: FileInfo = {
      path: 'docs/how-to/guide.md',
      name: 'guide.md',
      size: 100,
      lastModified: new Date(),
      content: `# How-to Guide

## Steps

1. Do this
2. Do that
`,
      category: 'how-to',
    }

    const report = validator.validateStructure(file, 'how-to')

    expect(report.recommendations).toContain('How-to guides should include prerequisites section')
  })
})

describe('QualityValidator - Metadata Validation', () => {
  const validator = new QualityValidator()

  it('should validate complete metadata', () => {
    const file: FileInfo = {
      path: 'docs/guide.md',
      name: 'guide.md',
      size: 100,
      lastModified: new Date(),
      content: `---
title: Complete Guide
description: A comprehensive guide to the system
last-updated: 2024-01-15
tags: guide, tutorial, beginner
---

# Complete Guide

Content here.
`,
    }

    const report = validator.validateMetadata(file)

    expect(report.hasTitle).toBe(true)
    expect(report.hasDescription).toBe(true)
    expect(report.hasLastUpdated).toBe(true)
    expect(report.hasTags).toBe(true)
    expect(report.missingFields).toHaveLength(0)
  })

  it('should detect missing metadata fields', () => {
    const file: FileInfo = {
      path: 'docs/incomplete.md',
      name: 'incomplete.md',
      size: 100,
      lastModified: new Date(),
      content: `# Incomplete Document

No frontmatter metadata.
`,
    }

    const report = validator.validateMetadata(file)

    expect(report.hasTitle).toBe(true) // Extracted from H1
    expect(report.hasDescription).toBe(false)
    expect(report.hasLastUpdated).toBe(false)
    expect(report.hasTags).toBe(false)
    expect(report.missingFields).toContain('description')
    expect(report.missingFields).toContain('last-updated')
    expect(report.missingFields).toContain('tags')
  })

  it('should extract title from H1 if not in frontmatter', () => {
    const file: FileInfo = {
      path: 'docs/no-frontmatter.md',
      name: 'no-frontmatter.md',
      size: 100,
      lastModified: new Date(),
      content: `# Document Title

Content without frontmatter.
`,
    }

    const report = validator.validateMetadata(file)

    expect(report.hasTitle).toBe(true)
  })
})

describe('QualityValidator - Quality Report Generation', () => {
  const validator = new QualityValidator()

  it('should generate comprehensive quality report', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/good.md',
        name: 'good.md',
        size: 100,
        lastModified: new Date(),
        content: `---
title: Good Document
description: A well-structured document
last-updated: 2024-01-15
tags: guide, complete
---

# Good Document

## Introduction

This is a complete document.

## Examples

\`\`\`typescript
const value = 42
\`\`\`

[Link to other](./other.md)
`,
        category: 'tutorial',
      },
      {
        path: 'docs/other.md',
        name: 'other.md',
        size: 100,
        lastModified: new Date(),
        content: `# Other Document

Content here.
`,
        category: 'reference',
      },
      {
        path: 'docs/bad.md',
        name: 'bad.md',
        size: 100,
        lastModified: new Date(),
        content: `# Bad Document

[Broken Link](./missing.md)

\`\`\`typescript
const x = [PLACEHOLDER]
\`\`\`
`,
        category: 'tutorial',
      },
    ]

    const report = await validator.generateQualityReport(files)

    // Should have overall score
    expect(report.overallScore).toBeGreaterThan(0)
    expect(report.overallScore).toBeLessThanOrEqual(100)

    // Should have link validation
    expect(report.linkValidation.totalLinks).toBeGreaterThan(0)
    expect(report.linkValidation.brokenLinks.length).toBeGreaterThan(0)

    // Should have code validation
    expect(report.codeValidation.totalExamples).toBeGreaterThan(0)
    expect(report.codeValidation.invalidExamples.length).toBeGreaterThan(0)

    // Should have structure issues
    expect(report.structureIssues.length).toBeGreaterThan(0)

    // Should have metadata issues
    expect(report.metadataIssues.length).toBeGreaterThan(0)

    // Should have recommendations
    expect(report.recommendations.length).toBeGreaterThan(0)
  })

  it('should calculate perfect score for perfect documents', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/perfect.md',
        name: 'perfect.md',
        size: 100,
        lastModified: new Date(),
        content: `---
title: Perfect Document
description: A perfect document
last-updated: 2024-01-15
tags: perfect, complete
---

# Perfect Document

## Introduction

This is perfect.

## Prerequisites

- None

## Steps

### Step 1

Do this.

## Examples

\`\`\`typescript
const value = 42
console.log(value)
\`\`\`
`,
        category: 'tutorial',
      },
    ]

    const report = await validator.generateQualityReport(files)

    expect(report.overallScore).toBe(100)
    expect(report.linkValidation.brokenLinks).toHaveLength(0)
    expect(report.codeValidation.invalidExamples).toHaveLength(0)
    expect(report.structureIssues).toHaveLength(0)
    expect(report.metadataIssues).toHaveLength(0)
    expect(report.recommendations).toHaveLength(0)
  })

  it('should provide specific recommendations based on issues', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/issues.md',
        name: 'issues.md',
        size: 100,
        lastModified: new Date(),
        content: `# Document with Issues

[Broken](./missing.md)

\`\`\`typescript
const x = [TODO]
\`\`\`
`,
        category: 'tutorial',
      },
    ]

    const report = await validator.generateQualityReport(files)

    expect(report.recommendations).toContain('Fix 1 broken links')
    expect(report.recommendations).toContain('Fix 1 invalid code examples')
    expect(report.recommendations).toContain('Improve structure in 1 documents')
    expect(report.recommendations).toContain('Add missing metadata to 1 documents')
  })

  it('should handle empty file list', async () => {
    const files: FileInfo[] = []

    const report = await validator.generateQualityReport(files)

    expect(report.overallScore).toBe(100)
    expect(report.linkValidation.totalLinks).toBe(0)
    expect(report.codeValidation.totalExamples).toBe(0)
    expect(report.recommendations).toHaveLength(0)
  })

  it('should calculate score based on all validation categories', async () => {
    const files: FileInfo[] = [
      {
        path: 'docs/partial.md',
        name: 'partial.md',
        size: 100,
        lastModified: new Date(),
        content: `---
title: Partial Document
description: Partially complete
last-updated: 2024-01-15
tags: partial
---

# Partial Document

## Introduction

Some content.

\`\`\`typescript
const value = 42
\`\`\`
`,
        category: 'tutorial',
      },
    ]

    const report = await validator.generateQualityReport(files)

    // Score should be between 0 and 100
    expect(report.overallScore).toBeGreaterThan(0)
    expect(report.overallScore).toBeLessThan(100)

    // Should have some structure issues (missing Prerequisites and Steps)
    expect(report.structureIssues.length).toBeGreaterThan(0)
  })
})
