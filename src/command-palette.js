/**
 * @file command-palette.js
 * @description Command palette registry and fuzzy search helpers for the main TUI.
 *
 * @functions
 *   → `buildCommandPaletteEntries` — builds the current command list with dynamic provider/tier context
 *   → `fuzzyMatchCommand` — scores a query against one string and returns match positions
 *   → `filterCommandPaletteEntries` — returns sorted command matches for a query
 *
 * @exports { COMMAND_CATEGORY_ORDER, buildCommandPaletteEntries, fuzzyMatchCommand, filterCommandPaletteEntries }
 *
 * @see src/key-handler.js
 * @see src/overlays.js
 */

export const COMMAND_CATEGORY_ORDER = ['Filters', 'Sort', 'Pages', 'Actions']

const COMMANDS = [
  // 📖 Filters
  { id: 'filter-tier-all', category: 'Filters', label: 'Filter tiers: all', shortcut: 'T', keywords: ['filter', 'tier', 'all'] },
  { id: 'filter-tier-splus', category: 'Filters', label: 'Filter tiers: S+', shortcut: null, keywords: ['filter', 'tier', 's+'] },
  { id: 'filter-tier-s', category: 'Filters', label: 'Filter tiers: S', shortcut: null, keywords: ['filter', 'tier', 's'] },
  { id: 'filter-tier-aplus', category: 'Filters', label: 'Filter tiers: A+', shortcut: null, keywords: ['filter', 'tier', 'a+'] },
  { id: 'filter-tier-a', category: 'Filters', label: 'Filter tiers: A', shortcut: null, keywords: ['filter', 'tier', 'a'] },
  { id: 'filter-tier-aminus', category: 'Filters', label: 'Filter tiers: A-', shortcut: null, keywords: ['filter', 'tier', 'a-'] },
  { id: 'filter-tier-bplus', category: 'Filters', label: 'Filter tiers: B+', shortcut: null, keywords: ['filter', 'tier', 'b+'] },
  { id: 'filter-tier-b', category: 'Filters', label: 'Filter tiers: B', shortcut: null, keywords: ['filter', 'tier', 'b'] },
  { id: 'filter-tier-c', category: 'Filters', label: 'Filter tiers: C', shortcut: null, keywords: ['filter', 'tier', 'c'] },
  { id: 'filter-provider-cycle', category: 'Filters', label: 'Filter provider: cycle', shortcut: 'D', keywords: ['filter', 'provider', 'origin'] },
  { id: 'filter-configured-toggle', category: 'Filters', label: 'Toggle configured-only models', shortcut: 'E', keywords: ['filter', 'configured', 'keys'] },

  // 📖 Sorting
  { id: 'sort-rank', category: 'Sort', label: 'Sort by rank', shortcut: 'R', keywords: ['sort', 'rank'] },
  { id: 'sort-tier', category: 'Sort', label: 'Sort by tier', shortcut: null, keywords: ['sort', 'tier'] },
  { id: 'sort-provider', category: 'Sort', label: 'Sort by provider', shortcut: 'O', keywords: ['sort', 'origin', 'provider'] },
  { id: 'sort-model', category: 'Sort', label: 'Sort by model name', shortcut: 'M', keywords: ['sort', 'model', 'name'] },
  { id: 'sort-latest-ping', category: 'Sort', label: 'Sort by latest ping', shortcut: 'L', keywords: ['sort', 'latest', 'ping'] },
  { id: 'sort-avg-ping', category: 'Sort', label: 'Sort by average ping', shortcut: 'A', keywords: ['sort', 'avg', 'average', 'ping'] },
  { id: 'sort-swe', category: 'Sort', label: 'Sort by SWE score', shortcut: 'S', keywords: ['sort', 'swe', 'score'] },
  { id: 'sort-ctx', category: 'Sort', label: 'Sort by context window', shortcut: 'C', keywords: ['sort', 'context', 'ctx'] },
  { id: 'sort-health', category: 'Sort', label: 'Sort by health', shortcut: 'H', keywords: ['sort', 'health', 'condition'] },
  { id: 'sort-verdict', category: 'Sort', label: 'Sort by verdict', shortcut: 'V', keywords: ['sort', 'verdict'] },
  { id: 'sort-stability', category: 'Sort', label: 'Sort by stability', shortcut: 'B', keywords: ['sort', 'stability'] },
  { id: 'sort-uptime', category: 'Sort', label: 'Sort by uptime', shortcut: 'U', keywords: ['sort', 'uptime'] },

  // 📖 Pages / overlays
  { id: 'open-settings', category: 'Pages', label: 'Open settings', shortcut: 'P', keywords: ['settings', 'config', 'api key'] },
  { id: 'open-help', category: 'Pages', label: 'Open help', shortcut: 'K', keywords: ['help', 'shortcuts', 'hotkeys'] },
  { id: 'open-changelog', category: 'Pages', label: 'Open changelog', shortcut: 'N', keywords: ['changelog', 'release'] },
  { id: 'open-feedback', category: 'Pages', label: 'Open feedback', shortcut: 'I', keywords: ['feedback', 'bug', 'request'] },
  { id: 'open-recommend', category: 'Pages', label: 'Open smart recommend', shortcut: 'Q', keywords: ['recommend', 'best model'] },
  { id: 'open-install-endpoints', category: 'Pages', label: 'Open install endpoints', shortcut: 'Y', keywords: ['install', 'endpoints', 'providers'] },

  // 📖 Actions
  { id: 'action-cycle-theme', category: 'Actions', label: 'Cycle theme', shortcut: 'G', keywords: ['theme', 'dark', 'light', 'auto'] },
  { id: 'action-cycle-tool-mode', category: 'Actions', label: 'Cycle tool mode', shortcut: 'Z', keywords: ['tool', 'mode', 'launcher'] },
  { id: 'action-cycle-ping-mode', category: 'Actions', label: 'Cycle ping mode', shortcut: 'W', keywords: ['ping', 'cadence', 'speed', 'slow'] },
  { id: 'action-toggle-favorite', category: 'Actions', label: 'Toggle favorite on selected model', shortcut: 'F', keywords: ['favorite', 'star'] },
  { id: 'action-reset-view', category: 'Actions', label: 'Reset view settings', shortcut: 'Shift+R', keywords: ['reset', 'view', 'sort', 'filters'] },
]

const ID_TO_TIER = {
  'filter-tier-all': null,
  'filter-tier-splus': 'S+',
  'filter-tier-s': 'S',
  'filter-tier-aplus': 'A+',
  'filter-tier-a': 'A',
  'filter-tier-aminus': 'A-',
  'filter-tier-bplus': 'B+',
  'filter-tier-b': 'B',
  'filter-tier-c': 'C',
}

export function buildCommandPaletteEntries() {
  return COMMANDS.map((entry) => ({
    ...entry,
    tierValue: Object.prototype.hasOwnProperty.call(ID_TO_TIER, entry.id) ? ID_TO_TIER[entry.id] : undefined,
  }))
}

/**
 * 📖 Fuzzy matching optimized for short command labels and keyboard aliases.
 * @param {string} query
 * @param {string} text
 * @returns {{ matched: boolean, score: number, positions: number[] }}
 */
export function fuzzyMatchCommand(query, text) {
  const q = (query || '').trim().toLowerCase()
  const t = (text || '').toLowerCase()

  if (!q) return { matched: true, score: 0, positions: [] }
  if (!t) return { matched: false, score: 0, positions: [] }

  let qIdx = 0
  const positions = []
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (q[qIdx] === t[i]) {
      positions.push(i)
      qIdx++
    }
  }

  if (qIdx !== q.length) return { matched: false, score: 0, positions: [] }

  let score = q.length * 10

  // 📖 Bonus when matches are contiguous.
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] === positions[i - 1] + 1) score += 5
  }

  // 📖 Bonus for word boundaries and prefix matches.
  for (const pos of positions) {
    if (pos === 0) score += 8
    else {
      const prev = t[pos - 1]
      if (prev === ' ' || prev === ':' || prev === '-' || prev === '/') score += 6
    }
  }

  // 📖 Small penalty for very long labels so focused labels float up.
  score -= Math.max(0, t.length - q.length)

  return { matched: true, score, positions }
}

/**
 * 📖 Filter and rank command palette entries by fuzzy score.
 * @param {Array<{ id: string, label: string, category: string, keywords?: string[] }>} entries
 * @param {string} query
 * @returns {Array<{ id: string, label: string, category: string, shortcut?: string|null, keywords?: string[], score: number, matchPositions: number[] }>}
 */
export function filterCommandPaletteEntries(entries, query) {
  const normalizedQuery = (query || '').trim()

  const ranked = []
  for (const entry of entries) {
    const labelMatch = fuzzyMatchCommand(normalizedQuery, entry.label)
    let bestScore = labelMatch.score
    let matchPositions = labelMatch.positions
    let matched = labelMatch.matched

    if (!matched && Array.isArray(entry.keywords)) {
      for (const keyword of entry.keywords) {
        const keywordMatch = fuzzyMatchCommand(normalizedQuery, keyword)
        if (!keywordMatch.matched) continue
        matched = true
        // 📖 Keyword matches should rank below direct label matches.
        const keywordScore = Math.max(1, keywordMatch.score - 7)
        if (keywordScore > bestScore) {
          bestScore = keywordScore
          matchPositions = []
        }
      }
    }

    if (!matched) continue
    ranked.push({ ...entry, score: bestScore, matchPositions })
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const aCat = COMMAND_CATEGORY_ORDER.indexOf(a.category)
    const bCat = COMMAND_CATEGORY_ORDER.indexOf(b.category)
    if (aCat !== bCat) return aCat - bCat
    return a.label.localeCompare(b.label)
  })

  return ranked
}
