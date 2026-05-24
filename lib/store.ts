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
