/* ===== NOTIFICATION/REMINDER ENGINE ===== */

export interface Reminder {
  id: string
  type: 'trip_pending' | 'trip_created' | 'inactivity' | 'trending' | 'pro_tip'
  title: string
  message: string
  actionLabel?: string
  actionPath?: string
  emoji: string
  createdAt: string
}

const DISMISSED_KEY = 'roamie_dismissed_reminders'

/* ===== TRACK DISMISSED REMINDERS ===== */
function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function markDismissed(id: string) {
  try {
    const dismissed = getDismissed()
    dismissed.add(id)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]))
  } catch {
    // storage may be full
  }
}

/* ===== GENERATE REMINDERS FROM STATE ===== */
export interface ReminderInput {
  trips: { id: string; destination: string; createdAt: string; startDate?: string; endDate?: string }[]
  name: string
  roamCoins: number
  hasOnboarded: boolean
}

export function generateReminders(input: ReminderInput): Reminder[] {
  const { trips, name, roamCoins, hasOnboarded } = input
  const dismissed = getDismissed()
  const now = Date.now()
  const reminders: Reminder[] = []

  // Helper to create a unique reminder ID per session that stays consistent
  const mkId = (prefix: string, key: string) => `rem_${prefix}_${key}`

  // 0. Trip starting soon — startDate is within the next 7 days
  for (const trip of trips) {
    if (!trip.startDate) continue
    const startTime = new Date(trip.startDate).getTime()
    const daysUntil = Math.floor((startTime - now) / (1000 * 60 * 60 * 24))
    const id = mkId('upcoming', trip.id)

    if (daysUntil >= 0 && daysUntil <= 7 && !dismissed.has(id)) {
      let message: string
      let emoji: string
      if (daysUntil === 0) {
        message = `Today's the day! Your ${trip.destination} trip starts now. Have an amazing time! 🎉`
        emoji = '🎉'
      } else if (daysUntil === 1) {
        message = `Your ${trip.destination} trip starts tomorrow! Get your bags packed! 🎒`
        emoji = '⏰'
      } else if (daysUntil <= 3) {
        message = `Only ${daysUntil} days until ${trip.destination}! Start planning what to pack.`
        emoji = '🗓️'
      } else {
        message = `${trip.destination} trip is coming up in ${daysUntil} days! Excited? ✨`
        emoji = '🌟'
      }

      reminders.push({
        id,
        type: 'trip_pending',
        title: `${trip.destination} is calling!`,
        message,
        actionLabel: 'View Trip',
        actionPath: `/itinerary/${trip.id}`,
        emoji,
        createdAt: trip.createdAt,
      })
    }
  }

  // 1. Trip pending reminders — trip was created > 2 days ago (only if no startDate set)
  for (const trip of trips) {
    // Skip if we already have a startDate-based reminder for this trip
    const upcomingId = mkId('upcoming', trip.id)
    if (trip.startDate && !dismissed.has(upcomingId)) continue

    const daysSinceCreated = Math.floor((now - new Date(trip.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const id = mkId('trip', trip.id)

    if (daysSinceCreated >= 2 && !dismissed.has(id)) {
      reminders.push({
        id,
        type: 'trip_pending',
        title: `Your ${trip.destination} trip is waiting!`,
        message: daysSinceCreated >= 7
          ? `It's been ${daysSinceCreated} days since you planned ${trip.destination}. Set your travel dates! 🗓️`
          : `Your ${trip.destination} itinerary is ready. When are you going?`,
        actionLabel: 'View Trip',
        actionPath: `/itinerary/${trip.id}`,
        emoji: '✈️',
        createdAt: trip.createdAt,
      })
    }
  }

  // 2. New user welcome / inactivity
  if (hasOnboarded) {
    const lastTripDate = trips.length > 0
      ? new Date(trips[0].createdAt).getTime()
      : 0
    const daysSinceLastTrip = lastTripDate ? Math.floor((now - lastTripDate) / (1000 * 60 * 60 * 24)) : 0

    const idleId = mkId('idle', name || 'wanderer')
    if (trips.length === 0 && !dismissed.has(idleId)) {
      reminders.push({
        id: idleId,
        type: 'inactivity',
        title: `${name || 'Wanderer'}, the world is calling! 🌍`,
        message: "You haven't planned any trips yet. Let's find your next adventure!",
        actionLabel: 'Plan a Trip',
        actionPath: '/plan',
        emoji: '🗺️',
        createdAt: new Date().toISOString(),
      })
    } else if (daysSinceLastTrip >= 5 && !dismissed.has(idleId)) {
      reminders.push({
        id: idleId,
        type: 'inactivity',
        title: `Time for a new adventure, ${name || 'Wanderer'}!`,
        message: `It's been ${daysSinceLastTrip} days since your last trip. Ready to explore somewhere new?`,
        actionLabel: 'Explore Destinations',
        actionPath: '/plan',
        emoji: '🌟',
        createdAt: new Date().toISOString(),
      })
    }
  }

  // 3. RoamCoin tip
  const coinId = mkId('coins', 'tip')
  if (roamCoins >= 50 && !dismissed.has(coinId)) {
    reminders.push({
      id: coinId,
      type: 'pro_tip',
      title: `You have 🪙 ${roamCoins} RoamCoins!`,
      message: 'Complete a trip to earn 500 more coins. Share it on the feed for bonus rewards!',
      actionLabel: 'See Stats',
      actionPath: '/stats',
      emoji: '🪙',
      createdAt: new Date().toISOString(),
    })
  }

  // 4. Trending — always show if not dismissed and user has trips
  const trendId = mkId('trend', 'spotlight')
  if (trips.length > 0 && !dismissed.has(trendId)) {
    reminders.push({
      id: trendId,
      type: 'trending',
      title: 'New spots are trending! 🔥',
      message: 'Other ROAMIE travellers are discovering hidden gems this week. Check them out!',
      actionLabel: 'Explore',
      actionPath: '/home',
      emoji: '🔥',
      createdAt: new Date().toISOString(),
    })
  }

  // Sort by most recent first based on createdAt
  reminders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return reminders
}

/* ===== DISMISS A REMINDER ===== */
export function dismissReminder(id: string) {
  markDismissed(id)
}

/* ===== CLEAR ALL DISMISSED (for testing / reset) ===== */
export function clearAllDismissed() {
  try {
    localStorage.removeItem(DISMISSED_KEY)
  } catch {
    // ignore
  }
}

/* ===== REQUEST BROWSER NOTIFICATION PERMISSION ===== */
export function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied')
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted')
  }
  if (Notification.permission === 'denied') {
    return Promise.resolve('denied')
  }
  return Notification.requestPermission()
}

/* ===== SEND A BROWSER NOTIFICATION ===== */
export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }
  try {
    new Notification(title, {
      icon: '/roamie-icon.svg',
      badge: '/roamie-icon.svg',
      ...options,
    })
  } catch {
    // fallback for older browsers
  }
}

/* ===== GET NOTIFICATION PERMISSION STATUS ===== */
export function getBrowserNotificationStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
