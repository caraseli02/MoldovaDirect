/**
 * Background Job Manager
 * Manages async operations with progress tracking
 *
 * In production, this should be replaced with a proper job queue
 * like Bull, BullMQ, or stored in Redis/Database
 */

import type { BackgroundJob } from '~/types/admin-testing'

// In-memory job storage (will reset on server restart)
const jobs = new Map<string, BackgroundJob>()

/**
 * Create a new background job
 */
export function createJob(
  type: BackgroundJob['type'],
  metadata?: Record<string, any>
): BackgroundJob {
  const id = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const job: BackgroundJob = {
    id,
    type,
    status: 'pending',
    progress: 0,
    progressMessage: 'Starting...',
    startedAt: new Date().toISOString(),
    metadata
  }

  jobs.set(id, job)
  return job
}

/**
 * Get job by ID
 */
export function getJob(id: string): BackgroundJob | undefined {
  return jobs.get(id)
}

/**
 * Update job progress
 */
export function updateJobProgress(
  id: string,
  progress: number,
  message: string
): void {
  const job = jobs.get(id)
  if (job) {
    job.progress = Math.min(100, Math.max(0, progress))
    job.progressMessage = message
    job.status = 'running'
    jobs.set(id, job)
  }
}

/**
 * Mark job as completed
 */
export function completeJob(id: string, result: any): void {
  const job = jobs.get(id)
  if (job) {
    job.status = 'completed'
    job.progress = 100
    job.progressMessage = 'Completed'
    job.completedAt = new Date().toISOString()
    job.result = result
    jobs.set(id, job)

    // Clean up completed jobs after 1 hour
    setTimeout(() => {
      jobs.delete(id)
    }, 60 * 60 * 1000)
  }
}

/**
 * Mark job as failed
 */
export function failJob(id: string, error: string): void {
  const job = jobs.get(id)
  if (job) {
    job.status = 'failed'
    job.progressMessage = 'Failed'
    job.completedAt = new Date().toISOString()
    job.error = error
    jobs.set(id, job)

    // Clean up failed jobs after 1 hour
    setTimeout(() => {
      jobs.delete(id)
    }, 60 * 60 * 1000)
  }
}

/**
 * Get all jobs (for admin viewing)
 */
export function getAllJobs(): BackgroundJob[] {
  return Array.from(jobs.values())
}

/**
 * Clean up old jobs
 */
export function cleanupOldJobs(olderThanHours: number = 24): number {
  const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000
  let deleted = 0

  for (const [id, job] of jobs.entries()) {
    if (job.completedAt) {
      const completedTime = new Date(job.completedAt).getTime()
      if (completedTime < cutoff) {
        jobs.delete(id)
        deleted++
      }
    }
  }

  return deleted
}
