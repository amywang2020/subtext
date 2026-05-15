import { NextRequest } from 'next/server'

// ─── Stories ──────────────────────────────────────────────────────────────────

const STORIES: Record<string, { architecture: string; newsEvent: string }> = {
  border: {
    architecture: `A woman drives her elderly mother through the town where the mother grew up in south Texas. The mother keeps pointing to lots where houses used to be, and the daughter keeps saying yes, I know, even when she doesn't know. The fields look different. Neither of them says what they mean by that.`,
    newsEvent: `Border wall construction in south Texas; eminent domain seizures of private land along the Rio Grande; families whose property has been taken or divided; the physical transformation of towns and agricultural land in the construction corridor.`,
  },
  smoke: {
    architecture: `Two college roommates who haven't spoken in three years happen to be in the same city. They meet for a walk because it's a thing to do with your hands. The sky is the wrong color — that particular California yellow-grey. One of them is about to move abroad. They talk about the smoke.`,
    newsEvent: `Wildfire smoke and air quality warnings across California and the western United States; AQI levels reaching hazardous thresholds; how recurring fire seasons have changed daily life; the atmospheric quality of smoke-filtered light that has become a feature of western summers.`,
  },
  hospital: {
    architecture: `A man sits in a hospital waiting room while his wife is in labor. It is taking longer than expected. A nurse passes him twice without making eye contact. He buys a coffee from the vending machine and then another one. He counts the chairs. At some point he realizes he's been holding his phone face-down.`,
    newsEvent: `Hospital staffing shortages and nurse strikes across the United States; critical understaffing in labor and delivery units; the impact of healthcare worker burnout and contract disputes on patient care; the gap between staffing levels and patient need in maternity wards.`,
  },
  desk: {
    architecture: `A daughter helps her father clean out his desk on a Saturday, when no one else will see. They take two trips to the car. He has kept, for twenty years, a magnet from a family vacation that she barely remembers. She carries it in her coat pocket the whole drive home without telling him.`,
    newsEvent: `Mass tech layoffs; tens of thousands of jobs cut across major technology companies; rising office building vacancies in San Francisco, Seattle, and Austin; the human cost of corporate restructuring and reduction-in-force announcements delivered by email.`,
  },
  garden: {
    architecture: `Two brothers at their childhood home for the first time since their mother's funeral. One of them goes out to water the garden before realizing. The other watches from the window. They eat dinner late and leave most of it.`,
    newsEvent: `Severe drought conditions across the western United States; mandatory water restrictions and conservation orders in multiple states; groundwater depletion in the Colorado River basin; the cumulative impact of multi-year drought on residential life, agriculture, and municipal water supply.`,
  },
  recipe: {
    architecture: `A Palestinian-American woman teaches her daughter to make her grandmother's recipe. She doesn't know all the steps — there are gaps where she must approximate. The daughter doesn't know they are approximating. It comes out close but not exactly right, and they eat it anyway without saying so.`,
    newsEvent: `The conflict in Gaza; ongoing ceasefire negotiations; the displacement of Palestinian families and the severing of intergenerational connection; the loss of cultural continuity — recipes, language, place-knowledge — that cannot be recovered under conditions of war and dispossession.`,
  },
  table: {
    architecture: `A social gathering — dinner or a long lunch. Sofía has her phone face-up on the table. Everyone has noticed. Nobody says anything yet. Gossip: someone asks why she's so distracted; someone mentions the divorce. Spring break comes up. Someone complains about Puerto Vallarta — the cartel situation, itineraries changed. Sofía looks up. Her grandmother lives in Mexico. She has spent all day waiting to hear back.`,
    newsEvent: `Cartel violence in Mexico, particularly in tourist and border regions including Jalisco and Nayarit; U.S. State Department travel advisories; the impact of ongoing violence on both travelers and residents; the experience of families divided across the U.S.-Mexico border living with sustained uncertainty.`,
  },
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const LITERARY_SYSTEM = `You are a literary fiction writer working in the tradition of autofiction and witness literature. Close third person. Present tense. Compressed, precise prose. You do not explain. You show.`

const NEWS_SYSTEM = `You are a wire-service journalist writing in the style of AP or Reuters. Third person, past tense. Economical, factual, precise.`

function buildPersonalPrompt(architecture: string, intake: Record<string, string>): string {
  return `Generate a prose piece of 280–320 words. Output only the story — no title, no preamble.

THE FIXED SITUATION (the plot does not change):
${architecture}

READER CONTEXT (weave in without naming or announcing):
— Time: ${intake.time}
— Place: ${intake.place}
— Light: ${intake.light}
— Setting: ${intake.location}
— Tomorrow: ${intake.tomorrow}
— Alone: ${intake.alone}

INSTRUCTIONS:
— Open with a sentence that places the reader in time and environment — not as setup, but as weather. This is where recognition begins.
— Let the reader's context inhabit the threshold: their light, their hour, their city are the room the characters are in.
— Somewhere in the middle: one line that feels slightly too precise — pressing on the fourth wall without breaking it. (Use second person only here, once, briefly.)
— The facts of the situation do not change. What changes is what it feels like to be in the room.
— No dialogue tags. One closing image. Stop at 320 words.`
}

function buildNewsPrompt(newsEvent: string): string {
  return `Write a news article of 150–180 words about the following event. Output only the article — no headline formatting, no preamble.

THE EVENT:
${newsEvent}

INSTRUCTIONS:
— Lead with the most newsworthy fact.
— Include specific details: geography, scale, official statements or data where plausible.
— No characters, no interiority, no literary devices.
— Just the record. Stop at 180 words.`
}

// ─── Streaming helper ─────────────────────────────────────────────────────────

async function streamOpenRouter(
  system: string,
  prompt: string,
  type: 'personal' | 'news',
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'Subtext',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-opus-4',
      stream: true,
      max_tokens: type === 'personal' ? 700 : 400,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  })

  const reader = res.body!.getReader()
  const dec = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data: ')) continue
      const raw = t.slice(6)
      if (raw === '[DONE]') return
      let chunk: { choices?: Array<{ delta?: { content?: string } }> }
      try { chunk = JSON.parse(raw) } catch { continue }
      const text = chunk.choices?.[0]?.delta?.content
      if (text) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, text })}\n\n`))
      }
    }
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { intake } = await req.json()

  const story = STORIES[intake.storyId as string] ?? STORIES.table
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await Promise.all([
          streamOpenRouter(
            LITERARY_SYSTEM,
            buildPersonalPrompt(story.architecture, intake),
            'personal',
            controller,
            encoder
          ),
          streamOpenRouter(
            NEWS_SYSTEM,
            buildNewsPrompt(story.newsEvent),
            'news',
            controller,
            encoder
          ),
        ])
      } catch (err) {
        console.error('Generation error:', err)
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
