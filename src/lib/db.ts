import { supabase, isSupabaseEnabled } from './supabase'
import type { SavedTrip, ItineraryItem } from '../store/RoamieContext'

/* ===== PROFILES ===== */
export async function createProfile(userId: string, data: {
  name: string
  adventure_level: number
  social_level: number
  selected_vibes: number[]
}) {
  if (!isSupabaseEnabled()) return null

  const { data: profile, error } = await supabase!
    .from('profiles')
    .insert({ id: userId, ...data })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return null
  }
  return profile
}

export async function getProfile(userId: string) {
  if (!isSupabaseEnabled()) return null

  const { data: profile, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return profile
}

export async function updateProfile(userId: string, updates: Partial<{
  name: string
  adventure_level: number
  social_level: number
  selected_vibes: number[]
}>) {
  if (!isSupabaseEnabled()) return null

  const { data: profile, error } = await supabase!
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }
  return profile
}

/* ===== CONVERTERS (snake_case ↔ camelCase) ===== */
function tripFromDB(raw: Record<string, unknown>): SavedTrip {
  return {
    id: raw.id as string,
    destination: raw.destination as string,
    preferences: raw.preferences as string[],
    likedMoods: raw.liked_moods as number[],
    itinerary: raw.itinerary as ItineraryItem[],
    createdAt: raw.created_at as string,
  }
}

function tripToDB(trip: Omit<SavedTrip, 'id' | 'createdAt'> & { user_id: string }) {
  return {
    user_id: trip.user_id,
    destination: trip.destination,
    preferences: trip.preferences,
    liked_moods: trip.likedMoods,
    itinerary: trip.itinerary,
  }
}

/* ===== TRIPS ===== */
export async function createTrip(trip: {
  user_id: string
  destination: string
  preferences: string[]
  likedMoods: number[]
  itinerary: ItineraryItem[]
}) {
  if (!isSupabaseEnabled()) return null

  const { data, error } = await supabase!
    .from('trips')
    .insert(tripToDB(trip))
    .select()
    .single()

  if (error) {
    console.error('Error creating trip:', error)
    return null
  }
  return data ? tripFromDB(data as Record<string, unknown>) : null
}

export async function getTrips(userId: string): Promise<SavedTrip[]> {
  if (!isSupabaseEnabled()) return []

  const { data: trips, error } = await supabase!
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trips:', error)
    return []
  }
  return (trips ?? []).map(t => tripFromDB(t as Record<string, unknown>))
}

export async function deleteTrip(tripId: string) {
  if (!isSupabaseEnabled()) return false

  const { error } = await supabase!
    .from('trips')
    .delete()
    .eq('id', tripId)

  if (error) {
    console.error('Error deleting trip:', error)
    return false
  }
  return true
}

/* ===== COMMUNITY POSTS ===== */
export interface CommunityPost {
  id: string
  user_id: string
  user_name: string
  user_avatar: string
  location: string
  image_url: string
  caption: string
  tags: string
  likes_count: number
  comments_count: number
  created_at: string
}

export async function getCommunityPosts() {
  if (!isSupabaseEnabled()) return []

  const { data: posts, error } = await supabase!
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching community posts:', error)
    return []
  }
  return posts as CommunityPost[]
}

export async function likePost(postId: string, userId: string) {
  if (!isSupabaseEnabled()) return false

  const { error } = await supabase!
    .from('post_likes')
    .insert({ post_id: postId, user_id: userId })

  if (error) {
    console.error('Error liking post:', error)
    return false
  }
  return true
}

export async function unlikePost(postId: string, userId: string) {
  if (!isSupabaseEnabled()) return false

  const { error } = await supabase!
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error unliking post:', error)
    return false
  }
  return true
}
