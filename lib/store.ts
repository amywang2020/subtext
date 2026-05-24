const READER_WORDS = [
  'ash', 'aspen', 'bay', 'birch', 'brine', 'cairn', 'chalk', 'cinder',
  'clay', 'crest', 'dew', 'dusk', 'eddy', 'ember', 'fen', 'fern',
  'flint', 'frost', 'gale', 'glen', 'gorse', 'gust', 'haze', 'heath',
  'heron', 'hull', 'hush', 'inlet', 'iris', 'jade', 'kelp', 'kite',
  'knoll', 'larch', 'leaf', 'loch', 'mesa', 'mist', 'moor', 'moss',
  'murk', 'nook', 'oak', 'opal', 'peat', 'pine', 'pool', 'quill',
  'rain', 'reed', 'rime', 'roan', 'rust', 'sage', 'salt', 'shale',
  'silk', 'silt', 'slate', 'smoke', 'soot', 'spar', 'spire', 'still',
  'stone', 'swell', 'tarn', 'teal', 'tern', 'thaw', 'tide', 'thorn',
  'turf', 'umber', 'vale', 'veil', 'wick', 'wisp', 'wold', 'wren', 'yew',
]

export interface Submission {
  id: string
  timestamp: string
  intake: Record<string, string>
  personalText: string
  rating: string
  note: string
  readerWord: string
}

// In-memory fallback for local dev without Upstash configured
const localSubmissions: Submission[] = []

function isUpstashConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function upstash(command: (string | number)[]) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  const json = await res.json()
  return json.result
}

export async function addSubmission(data: Omit<Submission, 'id' | 'timestamp'>): Promise<void> {
  const entry: Submission = {
    id: Math.random().toString(36).slice(2, 9),
    timestamp: new Date().toISOString(),
    ...data,
  }
  if (isUpstashConfigured()) {
    await upstash(['RPUSH', 'subtext:submissions', JSON.stringify(entry)])
  } else {
    localSubmissions.push(entry)
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  if (isUpstashConfigured()) {
    const result = await upstash(['LRANGE', 'subtext:submissions', '0', '-1'])
    if (!Array.isArray(result)) return []
    return result.map((s: string) => {
      try { return JSON.parse(s) } catch { return null }
    }).filter(Boolean)
  }
  return [...localSubmissions]
}

export async function clearSubmissions(): Promise<void> {
  if (isUpstashConfigured()) {
    await upstash(['DEL', 'subtext:submissions'])
  } else {
    localSubmissions.length = 0
  }
}

// ─── Word assignment ──────────────────────────────────────────────────────────

function shuffle(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const localWordPool = shuffle(READER_WORDS)

export async function assignReaderWord(): Promise<string> {
  if (isUpstashConfigured()) {
    const count = await upstash(['SCARD', 'subtext:word_pool'])
    if ((count as number) === 0) {
      await upstash(['SADD', 'subtext:word_pool', ...READER_WORDS])
    }
    const word = await upstash(['SPOP', 'subtext:word_pool'])
    if (word) return word as string
  } else {
    const word = localWordPool.shift()
    if (word) return word
  }
  return READER_WORDS[Math.floor(Math.random() * READER_WORDS.length)]
}
