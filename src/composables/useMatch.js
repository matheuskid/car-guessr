import { ref, computed } from 'vue'

const STORAGE_KEY = 'car-guessr-match-history'
const MATCH_ROUNDS = 5
const MAX_GUESSES_PER_ROUND = 5
const MAX_POINTS_PER_ROUND = 1000
const PENALTY_PER_GUESS = 200

/**
 * Picks `count` unique vehicles from `pool` using partial Fisher-Yates shuffle.
 * Each vehicle gets a random image assigned.
 */
function pickUniqueVehicles(pool, count) {
  const arr = [...pool]
  const picked = []
  for (let i = 0; i < count && arr.length > 0; i++) {
    const idx = Math.floor(Math.random() * arr.length)
    const vehicle = arr.splice(idx, 1)[0]
    // Assign a random image from the vehicle's image pool
    const randomImage = vehicle.imageUrls[Math.floor(Math.random() * vehicle.imageUrls.length)]
    picked.push({
      ...vehicle,
      imageUrl: randomImage
    })
  }
  return picked
}

/**
 * Calculates score for a round based on attempt count.
 * 1st attempt = 1000, 2nd = 800, ..., 5th = 200, failed = 0
 */
function calculateRoundScore(victory, guessCount) {
  if (!victory) return 0
  return Math.max(0, MAX_POINTS_PER_ROUND - (guessCount - 1) * PENALTY_PER_GUESS)
}

/**
 * Loads match history from localStorage.
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { matches: [], stats: { totalMatches: 0, bestScore: 0 } }
    return JSON.parse(raw)
  } catch {
    return { matches: [], stats: { totalMatches: 0, bestScore: 0 } }
  }
}

/**
 * Saves match history to localStorage.
 */
function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/**
 * Match composable — manages the lifecycle of a 5-round match.
 *
 * Usage:
 *   const match = useMatch()
 *   match.startMatch(vehiclePool, difficulty)
 *   // ... after each round ends:
 *   match.completeRound(victory, guessCount)
 *   // ... when match is over:
 *   match.saveMatch()
 */
export function useMatch() {
  // ── Reactive state ──
  const currentRound = ref(0)          // 1-based, 0 = not started
  const matchVehicles = ref([])        // the 5 cars for this match
  const roundResults = ref([])         // { vehicleKey, score, guessCount, victory }
  const matchScore = ref(0)
  const isMatchActive = ref(false)
  const isMatchOver = ref(false)
  const lastRoundScore = ref(0)        // for transition display
  const showingRoundResult = ref(false) // true while the round-result overlay is visible

  // ── Computed ──
  const currentVehicle = computed(() => {
    if (currentRound.value < 1 || currentRound.value > matchVehicles.value.length) return null
    return matchVehicles.value[currentRound.value - 1]
  })

  const totalRounds = computed(() => MATCH_ROUNDS)

  const maxPointsPerRound = computed(() => MAX_POINTS_PER_ROUND)

  const bestScore = computed(() => {
    const history = loadHistory()
    return history.stats.bestScore || 0
  })

  // ── Actions ──

  /**
   * Starts a new match: picks 5 unique vehicles and sets round to 1.
   * @param {Array} vehiclePool - playable vehicles to pick from
   * @param {number|null} difficulty - difficulty filter (null = all)
   */
  function startMatch(vehiclePool, difficulty = null) {
    const pool = difficulty
      ? vehiclePool.filter(v => v.difficulty === difficulty)
      : vehiclePool

    if (pool.length < MATCH_ROUNDS) {
      console.warn(`Not enough vehicles for a full match (need ${MATCH_ROUNDS}, have ${pool.length})`)
    }

    matchVehicles.value = pickUniqueVehicles(pool, MATCH_ROUNDS)
    currentRound.value = 1
    roundResults.value = []
    matchScore.value = 0
    lastRoundScore.value = 0
    isMatchActive.value = true
    isMatchOver.value = false
    showingRoundResult.value = false
  }

  /**
   * Records the result of the current round and advances.
   * @param {boolean} victory - whether the player guessed correctly
   * @param {number} guessCount - number of guesses used
   */
  function completeRound(victory, guessCount) {
    const score = calculateRoundScore(victory, guessCount)
    const vehicle = currentVehicle.value

    roundResults.value.push({
      vehicleKey: vehicle ? `${vehicle.make}_${vehicle.model}_${vehicle.gen || ''}` : 'unknown',
      vehicleMake: vehicle?.make || '',
      vehicleModel: vehicle?.model || '',
      vehicleImageUrl: vehicle?.imageUrl?.url || '',
      vehicle: vehicle || null,
      score,
      guessCount,
      victory
    })

    lastRoundScore.value = score
    matchScore.value += score
    showingRoundResult.value = true
  }

  /**
   * Advances to the next round (called after the player sees the round result).
   */
  function advanceRound() {
    showingRoundResult.value = false

    if (currentRound.value >= MATCH_ROUNDS) {
      isMatchOver.value = true
      isMatchActive.value = false
      saveMatch()
    } else {
      currentRound.value++
    }
  }

  /**
   * Persists the completed match to localStorage.
   */
  function saveMatch() {
    const history = loadHistory()

    const matchData = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      totalScore: matchScore.value,
      rounds: roundResults.value
    }

    history.matches.push(matchData)
    history.stats.totalMatches = history.matches.length
    if (matchScore.value > (history.stats.bestScore || 0)) {
      history.stats.bestScore = matchScore.value
    }

    saveHistory(history)
  }

  /**
   * Resets the match state so a new match can be started.
   */
  function resetMatch() {
    currentRound.value = 0
    matchVehicles.value = []
    roundResults.value = []
    matchScore.value = 0
    lastRoundScore.value = 0
    isMatchActive.value = false
    isMatchOver.value = false
    showingRoundResult.value = false
  }

  return {
    // State
    currentRound,
    matchVehicles,
    roundResults,
    matchScore,
    isMatchActive,
    isMatchOver,
    lastRoundScore,
    showingRoundResult,

    // Computed
    currentVehicle,
    totalRounds,
    maxPointsPerRound,
    bestScore,

    // Actions
    startMatch,
    completeRound,
    advanceRound,
    resetMatch,

    // Constants (for UI)
    MATCH_ROUNDS,
    MAX_POINTS_PER_ROUND,
    MAX_GUESSES_PER_ROUND,
    PENALTY_PER_GUESS
  }
}
