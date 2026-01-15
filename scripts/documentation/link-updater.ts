/**
 * Link Updater Component
 * Handles link extraction, updating, validation, and redirect generation
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { visit } from 'unist-util-visit'
import type { Link as UnistLink } from 'mdast'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { Link, LinkMap, ValidationReport, RedirectConfig, MigrationMap } from './types'

/**
 * Find all internal links in markdown content
 * @param content - Markdown content to parse
 * @param filePath - Path of the file being parsed (for context)
 * @returns Array of Link objects
 */
export async function findInternalLinks(content: string, _filePath?: string): Promise<Link[]> {
  const links: Link[] = []

  // Parse markdown content
  const tree = unified()
    .use(remarkParse)
    .parse(content)

  // Visit all link nodes
  visit(tree, 'link', (node: UnistLink) => {
    const url = node.url
    const text = node.children
      .filter((child) => child.type === 'text')
      .map((child: any) => child.value)
      .join('')

    // Determine if link is internal or external
    const isInternal = isInternalLink(url)

    links.push({
      text,
      url,
      line: node.position?.start.line ?? 0,
      column: node.position?.start.column ?? 0,
      isInternal
    })
  })

  return links
}

/**
 * Determine if a URL is an internal link
 * @param url - URL to check
 * @returns true if internal, false if external
 */
function isInternalLink(url: string): boolean {
  // External links start with http://, https://, mailto:, etc.
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return false
  }

  // Anchor-only links are internal
  if (url.startsWith('#')) {
    return true
  }

  // Relative paths are internal
  if (url.startsWith('./') || url.startsWith('../') || !url.includes('://')) {
    return true
  }

  return false
}

/**
 * Update a single link based on the link map
 * @param link - Link to update
 * @param linkMap - Mapping of old paths to new paths
 * @param currentFilePath - Path of the file containing the link
 * @returns Updated link
 */
export function updateLink(link: Link, linkMap: LinkMap, currentFilePath: string): Link {
  if (!link.isInternal) {
    return link
  }

  // Handle anchor-only links
  if (link.url.startsWith('#')) {
    return link
  }

  // Resolve the absolute path of the link target
  const currentDir = path.dirname(currentFilePath)
  const absoluteTargetPath = path.resolve(currentDir, link.url)

  // Check if this path has a mapping
  const newPath = linkMap[absoluteTargetPath]

  if (!newPath) {
    // No mapping found, return original link
    return link
  }

  // Calculate new relative path from current file to new target
  const newRelativePath = path.relative(currentDir, newPath)

  return {
    ...link,
    url: newRelativePath
  }
}

/**
 * Update all links in markdown content
 * @param content - Markdown content
 * @param linkMap - Mapping of old paths to new paths
 * @param currentFilePath - Path of the file being updated
 * @returns Updated content with new links
 */
export async function updateLinksInContent(
  content: string,
  linkMap: LinkMap,
  currentFilePath: string
): Promise<string> {
  const links = await findInternalLinks(content, currentFilePath)

  // Sort links by position (reverse order) to avoid offset issues
  const sortedLinks = [...links].sort((a, b) => {
    if (a.line !== b.line) {
      return b.line - a.line
    }
    return b.column - a.column
  })

  const lines = content.split('\n')

  for (const link of sortedLinks) {
    if (!link.isInternal || link.url.startsWith('#')) {
      continue
    }

    const updatedLink = updateLink(link, linkMap, currentFilePath)

    if (updatedLink.url !== link.url) {
      // Replace the link in the content
      const lineIndex = link.line - 1
      const line = lines[lineIndex]

      if (line !== undefined) {
        // Find and replace the URL in the line
        const linkPattern = new RegExp(`\\[${escapeRegex(link.text)}\\]\\(${escapeRegex(link.url)}\\)`)
        lines[lineIndex] = line.replace(linkPattern, `[${link.text}](${updatedLink.url})`)
      }
    }
  }

  return lines.join('\n')
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validate all links in a set of files
 * @param files - Map of file paths to their content
 * @param rootDir - Root directory for resolving paths
 * @returns Validation report
 */
export async function validateLinks(
  files: Map<string, string>,
  _rootDir: string
): Promise<ValidationReport> {
  const valid: Link[] = []
  const broken: Link[] = []
  const external: Link[] = []

  for (const [filePath, content] of files.entries()) {
    const links = await findInternalLinks(content, filePath)

    for (const link of links) {
      if (!link.isInternal) {
        external.push(link)
        continue
      }

      // Skip anchor-only links
      if (link.url.startsWith('#')) {
        valid.push(link)
        continue
      }

      // Resolve the target path
      const currentDir = path.dirname(filePath)
      const targetPath = path.resolve(currentDir, link.url)

      // Check if target exists
      if (files.has(targetPath)) {
        valid.push(link)
      } else {
        // Check if file exists on disk
        try {
          await fs.access(targetPath)
          valid.push(link)
        } catch {
          broken.push({ ...link, url: targetPath })
        }
      }
    }
  }

  return { valid, broken, external }
}

/**
 * Generate redirect configuration from migration map
 * @param migrationMap - Migration mapping
 * @param permanent - Whether redirects should be permanent (301) or temporary (302)
 * @returns Redirect configuration
 */
export function generateRedirects(
  migrationMap: MigrationMap,
  permanent: boolean = true
): RedirectConfig {
  const redirects = migrationMap.mappings.map((mapping) => ({
    from: mapping.oldPath,
    to: mapping.newPath,
    permanent
  }))

  return { redirects }
}

/**
 * Insert deprecation notice at the beginning of a file
 * @param content - Original file content
 * @param newLocation - New location of the file
 * @returns Content with deprecation notice
 */
export function insertDeprecationNotice(content: string, newLocation: string): string {
  const notice = `> **⚠️ DEPRECATED**: This documentation has been moved to [${newLocation}](${newLocation}). Please update your bookmarks.\n\n`

  return notice + content
}

/**
 * Create deprecation file at old location
 * @param oldPath - Old file path
 * @param newPath - New file path
 * @returns Deprecation file content
 */
export function createDeprecationFile(oldPath: string, newPath: string): string {
  const fileName = path.basename(oldPath)
  const newFileName = path.basename(newPath)

  return `# ${fileName} - Moved

> **⚠️ This documentation has been moved**

This file has been relocated as part of our documentation reorganization.

**New Location**: [${newFileName}](${newPath})

Please update your bookmarks and links to point to the new location.

---

*This file will be removed after the transition period (30 days).*
`
}
