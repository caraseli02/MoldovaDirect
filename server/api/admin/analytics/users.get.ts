/**
 * Admin User Analytics API Endpoint
 * 
 * Requirements addressed:
 * - 3.1: Display key metrics including total users, active users
 * - 3.3: Display user registration trends, login frequency, and user activity patterns
 * 
 * Returns user analytics data including:
 * - Registration trends over time
 * - User activity patterns
 * - Login frequency statistics
 * - User engagement metrics
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export interface UserAnalyticsData {
  registrationTrends: Array<{
    date: string
    registrations: number
    cumulativeUsers: number
  }>
  activityTrends: Array<{
    date: string
    activeUsers: number
    logins: number
    pageViews: number
    productViews: number
    cartAdditions: number
    orders: number
  }>
  summary: {
    totalUsers: number
    activeUsersLast30Days: number
    newUsersLast30Days: number
    avgDailyActiveUsers: number
    userRetentionRate: number
  }
  topUserActivities: Array<{
    userId: string
    userName: string
    totalActivities: number
    lastActivity: string
    activityBreakdown: Record<string, number>
  }>
}

export default defineCachedEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    // Verify admin access
    const supabase = await serverSupabaseClient(event)

    // Parse query parameters for date filtering
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30
    const startDate = query.startDate as string
    const endDate = query.endDate as string

    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `AND created_at BETWEEN '${startDate}' AND '${endDate}'`
    } else {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - days)
      dateFilter = `AND created_at >= '${daysAgo.toISOString()}'`
    }

    // Get registration trends
    const { data: registrationTrends, error: trendsError } = await supabase
      .from('user_registration_trends')
      .select('*')
      .order('date', { ascending: true })

    if (trendsError) {
      console.error('Registration trends error:', trendsError)
    }

    // Get daily user activity
    const { data: activityTrends, error: activityError } = await supabase
      .from('daily_user_activity')
      .select('*')
      .order('date', { ascending: true })

    if (activityError) {
      console.error('Activity trends error:', activityError)
    }

    // Get user summary statistics
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Total users
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // New users in last 30 days
    const { count: newUsersLast30Days, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Active users in last 30 days (users with any activity)
    const { data: activeUsersData, error: activeUsersError } = await supabase
      .from('user_activity_logs')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const activeUsersLast30Days = activeUsersData 
      ? new Set(activeUsersData.map(u => u.user_id)).size 
      : 0

    // Calculate average daily active users
    const avgDailyActiveUsers = activityTrends && activityTrends.length > 0
      ? Math.round(activityTrends.reduce((sum, day) => sum + (day.active_users || 0), 0) / activityTrends.length)
      : 0

    // Calculate user retention rate (simplified: active users / total users)
    const userRetentionRate = totalUsers && totalUsers > 0
      ? Math.round((activeUsersLast30Days / totalUsers) * 100 * 100) / 100
      : 0

    // Get top user activities
    const { data: topActivitiesRaw, error: topActivitiesError } = await supabase
      .rpc('get_top_user_activities', { 
        days_back: days,
        limit_count: 10 
      })
      .select('*')

    // If the RPC doesn't exist, fall back to a simpler query
    let topUserActivities = []
    if (topActivitiesError) {
      // Fallback: Get users with most activities
      const { data: userActivities, error: fallbackError } = await supabase
        .from('user_activity_logs')
        .select(`
          user_id,
          activity_type,
          created_at,
          profiles!inner(name)
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000)

      if (!fallbackError && userActivities) {
        // Group by user and count activities
        const userActivityMap = new Map()
        
        userActivities.forEach(activity => {
          const userId = activity.user_id
          if (!userActivityMap.has(userId)) {
            userActivityMap.set(userId, {
              userId,
              userName: activity.profiles?.name || 'Unknown User',
              totalActivities: 0,
              lastActivity: activity.created_at,
              activityBreakdown: {}
            })
          }
          
          const userStats = userActivityMap.get(userId)
          userStats.totalActivities++
          userStats.activityBreakdown[activity.activity_type] = 
            (userStats.activityBreakdown[activity.activity_type] || 0) + 1
          
          // Update last activity if this is more recent
          if (new Date(activity.created_at) > new Date(userStats.lastActivity)) {
            userStats.lastActivity = activity.created_at
          }
        })

        topUserActivities = Array.from(userActivityMap.values())
          .sort((a, b) => b.totalActivities - a.totalActivities)
          .slice(0, 10)
      }
    } else {
      topUserActivities = topActivitiesRaw || []
    }

    const analyticsData: UserAnalyticsData = {
      registrationTrends: registrationTrends || [],
      activityTrends: activityTrends || [],
      summary: {
        totalUsers: totalUsers || 0,
        activeUsersLast30Days,
        newUsersLast30Days: newUsersLast30Days || 0,
        avgDailyActiveUsers,
        userRetentionRate
      },
      topUserActivities
    }

    return {
      success: true,
      data: analyticsData
    }

  } catch (error) {
    console.error('User analytics error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user analytics'
    })
  }
}, {
  maxAge: 60 * 10, // Cache for 10 minutes (analytics can tolerate staleness)
  name: 'admin-analytics-users',
  getKey: (event) => {
    const query = getQuery(event)
    const days = query.days || 30
    const startDate = query.startDate || ''
    const endDate = query.endDate || ''
    return `days:${days}:start:${startDate}:end:${endDate}`
  },
  swr: true // Enable stale-while-revalidate for better UX
})