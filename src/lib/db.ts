import { supabase } from './supabase'
import type { BracketPicks } from '../data/types'

export async function savePicks(userId: string, picks: BracketPicks, winnerPick: string | null) {
  const { error } = await supabase
    .from('picks')
    .upsert(
      {
        user_id: userId,
        bracket: picks as object,
        winner_pick: winnerPick,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  if (error) console.error('savePicks failed:', error.message)
}

export async function loadPicks(userId: string): Promise<BracketPicks | null> {
  const { data, error } = await supabase
    .from('picks')
    .select('bracket')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.bracket as BracketPicks
}

/** Whether this user has already submitted (locked) their bracket. */
export async function getLockStatus(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('picks')
    .select('locked_at')
    .eq('user_id', userId)
    .maybeSingle()
  return Boolean(data?.locked_at)
}

/** Lock the bracket — final submission. RLS only allows this once. */
export async function lockPicks(userId: string) {
  const { error } = await supabase
    .from('picks')
    .update({ locked_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) console.error('lockPicks failed:', error.message)
}

export async function saveProfile(
  userId: string,
  displayName: string,
  favoriteTeamId: string,
) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, display_name: displayName, favorite_team_id: favoriteTeamId },
      { onConflict: 'id' },
    )
  if (error) console.error('saveProfile failed:', error.message)
}

export interface BracketRow {
  userId: string
  displayName: string
  favoriteTeamId: string | null
  bracket: BracketPicks
}

/** One user's bracket + profile, for their profile page. */
export async function getProfile(userId: string): Promise<BracketRow | null> {
  const { data, error } = await supabase
    .from('picks')
    .select('user_id, bracket, profiles(display_name, favorite_team_id)')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  const row = data as any
  return {
    userId: row.user_id,
    displayName: row.profiles?.display_name ?? 'Anonymous',
    favoriteTeamId: row.profiles?.favorite_team_id ?? null,
    bracket: row.bracket as BracketPicks,
  }
}

/** Every submitted bracket + its owner's profile — scored client-side. */
export async function getAllBrackets(): Promise<BracketRow[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('user_id, bracket, profiles(display_name, favorite_team_id)')

  if (error || !data) return []

  return data.map((row: any) => ({
    userId: row.user_id,
    displayName: row.profiles?.display_name ?? 'Anonymous',
    favoriteTeamId: row.profiles?.favorite_team_id ?? null,
    bracket: row.bracket as BracketPicks,
  }))
}
