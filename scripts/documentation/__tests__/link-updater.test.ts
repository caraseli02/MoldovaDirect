/**
 * Unit tests for Link Updater
 */

import { describe, it, expect } from 'vitest'
import {
  findInternalLinks,
  updateLink,
  updateLinksInContent,
  validateLinks,
  generateRedirects,
  insertDeprecationNotice,
  createDeprecationFile
} from '../link-updater'
import type { Link, LinkMap, MigrationMap } from '../types'

describe('Link Updater - Link Extraction', () => {
  it('should extract markdown links from content', async () => {
    const content = `
# Test Document

This is a [link to another doc](./other.md).
Here is an [external link](https://example.com).
And an [anchor link](#section).
`
    
    const links = await findInternalLinks(content)
    
    expect(links).toHaveLength(3)
    expect(links[0].text).toBe('link to another doc')
    expect(links[0].url).toBe('./other.md')
    expect(links[0].isInternal).toBe(true)
    
    expect(links[1].text).toBe('external link')
    expect(links[1].url).toBe('https://example.com')
    expect(links[1].isInternal).toBe(false)
    
    expect(links[2].text).toBe('anchor link')
    expect(links[2].url).toBe('#section')
    expect(links[2].isInternal).toBe(true)
  })
  
  it('should handle relative paths correctly', async () => {
    const content = `
[Parent directory](../parent.md)
[Current directory](./current.md)
[Subdirectory](subdir/file.md)
`
    
    const links = await findInternalLinks(content)
    
    expect(links).toHaveLength(3)
    expect(links[0].url).toBe('../parent.md')
    expect(links[0].isInternal).toBe(true)
    expect(links[1].url).toBe('./current.md')
    expect(links[1].isInternal).toBe(true)
    expect(links[2].url).toBe('subdir/file.md')
    expect(links[2].isInternal).toBe(true)
  })
  
  it('should classify protocol-based URLs as external', async () => {
    const content = `
[HTTP](http://example.com)
[HTTPS](https://example.com)
[FTP](ftp://example.com)
[Mailto](mailto:test@example.com)
`
    
    const links = await findInternalLinks(content)
    
    expect(links).toHaveLength(4)
    expect(links.every(link => !link.isInternal)).toBe(true)
  })
  
  it('should handle links with anchors', async () => {
    const content = `
[Link with anchor](./doc.md#section)
[Just anchor](#section)
[External with anchor](https://example.com#section)
`
    
    const links = await findInternalLinks(content)
    
    expect(links).toHaveLength(3)
    expect(links[0].url).toBe('./doc.md#section')
    expect(links[0].isInternal).toBe(true)
    expect(links[1].url).toBe('#section')
    expect(links[1].isInternal).toBe(true)
    expect(links[2].url).toBe('https://example.com#section')
    expect(links[2].isInternal).toBe(false)
  })
  
  it('should extract line and column information', async () => {
    const content = `# Title

[First link](./first.md)

[Second link](./second.md)
`
    
    const links = await findInternalLinks(content)
    
    expect(links).toHaveLength(2)
    expect(links[0].line).toBeGreaterThan(0)
    expect(links[0].column).toBeGreaterThan(0)
    expect(links[1].line).toBeGreaterThan(links[0].line)
  })
  
  it('should handle empty content', async () => {
    const links = await findInternalLinks('')
    expect(links).toHaveLength(0)
  })
  
  it('should handle content with no links', async () => {
    const content = `
# Document

This is just text with no links.
`
    
    const links = await findInternalLinks(content)
    expect(links).toHaveLength(0)
  })
})

describe('Link Updater - Link Updating', () => {
  it('should update internal link based on link map', () => {
    const link: Link = {
      text: 'Test Link',
      url: './old-location.md',
      line: 1,
      column: 1,
      isInternal: true
    }
    
    const linkMap: LinkMap = {
      '/docs/old-location.md': '/docs/new-location.md'
    }
    
    const currentFilePath = '/docs/index.md'
    const updatedLink = updateLink(link, linkMap, currentFilePath)
    
    // The link should be updated to point to the new location
    expect(updatedLink.url).not.toBe(link.url)
  })
  
  it('should not update external links', () => {
    const link: Link = {
      text: 'External',
      url: 'https://example.com',
      line: 1,
      column: 1,
      isInternal: false
    }
    
    const linkMap: LinkMap = {}
    const currentFilePath = '/docs/index.md'
    const updatedLink = updateLink(link, linkMap, currentFilePath)
    
    expect(updatedLink.url).toBe(link.url)
  })
  
  it('should not update anchor-only links', () => {
    const link: Link = {
      text: 'Anchor',
      url: '#section',
      line: 1,
      column: 1,
      isInternal: true
    }
    
    const linkMap: LinkMap = {}
    const currentFilePath = '/docs/index.md'
    const updatedLink = updateLink(link, linkMap, currentFilePath)
    
    expect(updatedLink.url).toBe('#section')
  })
  
  it('should return original link if no mapping exists', () => {
    const link: Link = {
      text: 'Test',
      url: './unmapped.md',
      line: 1,
      column: 1,
      isInternal: true
    }
    
    const linkMap: LinkMap = {}
    const currentFilePath = '/docs/index.md'
    const updatedLink = updateLink(link, linkMap, currentFilePath)
    
    expect(updatedLink.url).toBe(link.url)
  })
  
  it('should update links in content correctly', async () => {
    const content = `# Test Document

Check out [this guide](./old/guide.md) for more info.
Also see [another doc](./old/another.md).
`
    
    const linkMap: LinkMap = {
      '/docs/old/guide.md': '/docs/tutorials/guide.md',
      '/docs/old/another.md': '/docs/how-to/another.md'
    }
    
    const currentFilePath = '/docs/index.md'
    const updatedContent = await updateLinksInContent(content, linkMap, currentFilePath)
    
    // Content should be updated with new paths
    expect(updatedContent).toContain('tutorials/guide.md')
    expect(updatedContent).toContain('how-to/another.md')
    expect(updatedContent).not.toContain('./old/guide.md')
    expect(updatedContent).not.toContain('./old/another.md')
  })
  
  it('should preserve external links when updating content', async () => {
    const content = `# Test

[Internal](./internal.md)
[External](https://example.com)
`
    
    const linkMap: LinkMap = {
      '/docs/internal.md': '/docs/new/internal.md'
    }
    
    const currentFilePath = '/docs/index.md'
    const updatedContent = await updateLinksInContent(content, linkMap, currentFilePath)
    
    expect(updatedContent).toContain('https://example.com')
  })
})

describe('Link Updater - Redirect Generation', () => {
  it('should generate redirect configuration from migration map', () => {
    const migrationMap: MigrationMap = {
      mappings: [
        {
          oldPath: '/docs/old1.md',
          newPath: '/docs/new1.md',
          category: 'tutorial',
          priority: 1,
          estimatedEffort: 'low'
        },
        {
          oldPath: '/docs/old2.md',
          newPath: '/docs/new2.md',
          category: 'how-to',
          priority: 2,
          estimatedEffort: 'medium'
        }
      ]
    }
    
    const redirectConfig = generateRedirects(migrationMap)
    
    expect(redirectConfig.redirects).toHaveLength(2)
    expect(redirectConfig.redirects[0].from).toBe('/docs/old1.md')
    expect(redirectConfig.redirects[0].to).toBe('/docs/new1.md')
    expect(redirectConfig.redirects[0].permanent).toBe(true)
  })
  
  it('should support temporary redirects', () => {
    const migrationMap: MigrationMap = {
      mappings: [
        {
          oldPath: '/docs/old.md',
          newPath: '/docs/new.md',
          category: 'reference',
          priority: 1,
          estimatedEffort: 'low'
        }
      ]
    }
    
    const redirectConfig = generateRedirects(migrationMap, false)
    
    expect(redirectConfig.redirects[0].permanent).toBe(false)
  })
})

describe('Link Updater - Deprecation Notices', () => {
  it('should insert deprecation notice at beginning of content', () => {
    const content = `# Original Document

This is the original content.
`
    
    const newLocation = '/docs/new-location.md'
    const result = insertDeprecationNotice(content, newLocation)
    
    expect(result).toContain('DEPRECATED')
    expect(result).toContain(newLocation)
    expect(result).toContain('# Original Document')
  })
  
  it('should create deprecation file with proper format', () => {
    const oldPath = '/docs/old/guide.md'
    const newPath = '/docs/new/guide.md'
    
    const content = createDeprecationFile(oldPath, newPath)
    
    expect(content).toContain('Moved')
    expect(content).toContain(newPath)
    expect(content).toContain('update your bookmarks')
  })
})

describe('Link Updater - Link Validation', () => {
  it('should validate links and categorize them correctly', async () => {
    const files = new Map<string, string>([
      ['/docs/index.md', '[Link to guide](./guide.md)\n[External](https://example.com)'],
      ['/docs/guide.md', '# Guide\n\nContent here.']
    ])
    
    const report = await validateLinks(files, '/docs')
    
    // Should have valid internal link
    expect(report.valid.length).toBeGreaterThan(0)
    
    // Should have external link
    expect(report.external.length).toBeGreaterThan(0)
    
    // Should have no broken links (all files exist)
    expect(report.broken.length).toBe(0)
  })
  
  it('should detect broken internal links', async () => {
    const files = new Map<string, string>([
      ['/docs/index.md', '[Broken link](./nonexistent.md)']
    ])
    
    const report = await validateLinks(files, '/docs')
    
    // Should detect broken link
    expect(report.broken.length).toBeGreaterThan(0)
    expect(report.broken[0].url).toContain('nonexistent.md')
  })
  
  it('should handle anchor-only links as valid', async () => {
    const files = new Map<string, string>([
      ['/docs/index.md', '[Anchor](#section)']
    ])
    
    const report = await validateLinks(files, '/docs')
    
    // Anchor links should be valid
    expect(report.valid.length).toBeGreaterThan(0)
    expect(report.broken.length).toBe(0)
  })
  
  it('should classify external links correctly', async () => {
    const files = new Map<string, string>([
      ['/docs/index.md', '[HTTP](http://example.com)\n[HTTPS](https://example.com)\n[Mailto](mailto:test@example.com)']
    ])
    
    const report = await validateLinks(files, '/docs')
    
    // All should be external
    expect(report.external.length).toBe(3)
    expect(report.valid.length).toBe(0)
    expect(report.broken.length).toBe(0)
  })
})
