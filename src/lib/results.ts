import { supabase } from './supabase'
import { parseResults } from '../data/results'
import type { TournamentResults } from '../data/scoring'

/**
 * Fetch live tournament results via the wc-results Edge Function and normalize
 * them. Returns null if the function isn't deployed yet or the call fails —
 * callers should treat null as "no results yet" (scores show as 0).
 */
// Supabase auto-generated the deployed slug as 'hyper-action' (the function's
// display name is "wc-results"). The slug is what the endpoint resolves.
const RESULTS_FUNCTION = 'hyper-action'

export async function fetchResults(): Promise<TournamentResults | null> {
  try {
    const { data, error } = await supabase.functions.invoke(RESULTS_FUNCTION)
    if (error || !data) return null
    return parseResults(data.standings ?? [], data.matches ?? [])
  } catch {
    return null
  }
}
