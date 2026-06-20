/**
 * Edge Function: wc-results
 *
 * Server-side proxy to football-data.org. Keeps the API token secret (stored
 * as the FOOTBALL_DATA_TOKEN Supabase secret) and adds CORS so the browser can
 * read it. Returns the raw standings + matches arrays; the client runs the
 * (unit-tested) parseResults + scoreBracket logic on them.
 *
 * Deploy:
 *   supabase functions deploy wc-results
 * Secret:
 *   supabase secrets set FOOTBALL_DATA_TOKEN=<your rotated token>
 */

const TOKEN = Deno.env.get('FOOTBALL_DATA_TOKEN')!
const BASE = 'https://api.football-data.org/v4/competitions/WC'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const headers = { 'X-Auth-Token': TOKEN }
    const [standings, matches] = await Promise.all([
      fetch(`${BASE}/standings`, { headers }).then((r) => r.json()),
      fetch(`${BASE}/matches`, { headers }).then((r) => r.json()),
    ])

    return new Response(
      JSON.stringify({
        standings: standings.standings ?? [],
        matches: matches.matches ?? [],
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
