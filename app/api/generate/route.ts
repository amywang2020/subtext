import { NextRequest } from 'next/server'

// ─── Stories ──────────────────────────────────────────────────────────────────

const STORIES: Record<string, { architecture: string; newsEvent: string; closingLine?: string }> = {
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
    closingLine: `\n\nSomewhere, her grandmother's phone rings into whatever room it's in.`,
  },
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const LITERARY_SYSTEM = `You are a literary fiction writer working in the tradition of autofiction and witness literature. Close third person. Present tense. Compressed, precise prose. You do not explain. You show. Dialogue is rendered with standard quotation marks, not em dashes.`

const NEWS_SYSTEM = `You are a wire-service journalist writing in the style of AP or Reuters. Third person, past tense. Economical, factual, precise.`

function buildPersonalPrompt(architecture: string, newsEvent: string, intake: Record<string, string>): string {
  return `Generate a prose piece of 280–320 words. Output only the story — no title, no preamble.

THE FIXED SITUATION (the plot does not change):
${architecture}

STRUCTURAL CONTEXT (the systemic pressure behind the scene — do not name it or editorialize; let it weight the texture):
${newsEvent}

READER CONTEXT — two layers, both invisible:

SENSORY (embed concretely, do not announce):
— Ambient sound: ${intake.sound}
— Object nearest to their hand: ${intake.object}
— Current time: ${intake.time}
— After this, they are going: ${intake.goingAfter}

PSYCHOLOGICAL (calibrate register, do not name):
— Where their attention is right now: ${intake.presence}
— Where their phone is: ${intake.phone}

INSTRUCTIONS:
— Open with a sentence of ambient texture — sound, temperature, the weight of the hour. Not a description of the room. Not "the light." The first sentence is weather.
— The sound can find one moment in the scene — a background detail, unannounced, as if it were always there.
— The object is not a prop. Do not place it in the story. Use it to read the reader's environment: what kind of space they're in, what their afternoon looks like, what social register surrounds them. Let that inference color the atmosphere without the object appearing.
— The psychological layer calibrates Sofía's register. If the reader is mostly somewhere else: Sofía's fear is physically present, embodied, hard to keep still — her hands, her posture, small involuntary movements. If the reader is mostly here: Sofía is composed on the surface, dissociated, observing the table from a slight remove, the fear running underneath.
— Sofía's phone is face-up on the table — this is fixed and does not change. The reader's phone answer calibrates its weight in the room: face-up readers get a phone that pulls at the edges of every sentence; face-down readers get one that is present but held at a distance, suppressed.
— Do not surface the intake answers as observations. Invisible scaffolding, not reported data.
— The story's geography is fixed — do not relocate it. Reader context changes texture, not setting.
— Somewhere in the middle: one line in second person that feels slightly too precise — as if the story knows something about the reader without being told. It must not echo any intake answer directly — no specific times, no clock numbers, no named objects, no locations, nothing from the intake. The recognition must come from emotional logic, not reported data: something about the texture of waiting, the weight of an unanswered hour, the particular quality of half-attention. It lands as uncanny because it names a feeling, not a fact. One sentence only.
— Stay outside. No interior memory chains. What the character notices is external: objects, light, bodies, sound, time. Interiority lives in what they do with their hands, not what they remember. Avoid similes — precision over imagery. If you reach for "like" or "as if," cut it and find the direct observation instead.
— No names for anyone except Sofía. The other people at the table are voices, gestures, pronouns. They do not have identities — only opinions and obliviousness.
— Sofía has not heard from her grandmother all day. Do not invent a call, a notification, or any incoming contact. The tension is the sustained absence — the phone that hasn't rung, the silence she is waiting inside of.
— Use at most one class or status marker for the table guests. The obliviousness of the conversation carries the register.
— No dialogue tags. Do not write a closing line — stop before the final beat. Reach a complete sentence, then stop. Hard limit: 300 words.`
}

function buildGenericPrompt(architecture: string, newsEvent: string, intake: Record<string, string>): string {
  return `Generate a prose piece of 280–320 words. Output only the story — no title, no preamble.

THE FIXED SITUATION (the plot does not change):
${architecture}

STRUCTURAL CONTEXT (the systemic pressure — do not name it; let it weight the texture):
${newsEvent}

READER CONTEXT — embed invisibly:
— Ambient sound: ${intake.sound}
— Current time: ${intake.time}
— After this, they are going: ${intake.goingAfter}

INSTRUCTIONS:
— Open with a sentence of ambient texture — sound, temperature, the weight of the hour.
— Embed the sound as a background detail, unannounced, as if it were always there.
— Present tense. Close third person. Compressed, precise prose.
— No explanation. Show. No similes.
— Stop at 300 words.`
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

const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  'X-Title': 'Subtext',
}

// ─── Buffered generation ──────────────────────────────────────────────────────

async function generateOpenRouter(system: string, prompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: OPENROUTER_HEADERS,
    body: JSON.stringify({
      model: 'anthropic/claude-opus-4.7',
      stream: false,
      max_tokens: 700,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  })
  const data = await res.json()
  if (!data.choices?.[0]?.message?.content) {
    console.error('[subtext] OpenRouter generate error:', JSON.stringify(data).slice(0, 600))
  }
  return data.choices?.[0]?.message?.content ?? ''
}

// ─── Validation ───────────────────────────────────────────────────────────────

async function validateStory(text: string, objectWord: string): Promise<boolean> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: OPENROUTER_HEADERS,
    body: JSON.stringify({
      model: 'anthropic/claude-haiku-4.5',
      stream: false,
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Check this story for specific problems. Reply with JSON only: {"valid": true} or {"valid": false, "issues": ["..."]}.

STORY:
${text}

CHECK FOR (any one fails the whole story):
1. Character names other than "Sofía" (e.g. Marcus, Andrea, Lauren, David)
2. Incoming contact actually arrives for Sofía: a call rings, a notification banner appears, the phone buzzes with a new message, or a voicemail is received. NOTE: Sofía waiting for contact, the phone being silent, or references to not having heard back are NOT violations — the silence is the point of the story
3. The word "${objectWord}" appearing literally in the story
4. Story ends mid-sentence
5. Opening sentence has "light" or "the light" as its grammatical subject`,
      }],
    }),
  })
  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? '{}'
  console.log('[subtext] validator response:', content)
  try {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) return (JSON.parse(match[0]) as { valid: boolean }).valid === true
  } catch { /* fall through */ }
  return true
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
    headers: OPENROUTER_HEADERS,
    body: JSON.stringify({
      model: 'anthropic/claude-opus-4.7',
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
      let personalText = ''

      try {
        const personalPrompt = intake.storyId === 'table'
          ? buildPersonalPrompt(story.architecture, story.newsEvent, intake)
          : buildGenericPrompt(story.architecture, story.newsEvent, intake)

        await Promise.all([
          // Personal: generate → validate → retry once if needed
          (async () => {
            for (let attempt = 0; attempt < 2; attempt++) {
              const text = await generateOpenRouter(LITERARY_SYSTEM, personalPrompt)
              const valid = await validateStory(text, intake.object ?? '')
              console.log(`[subtext] personal attempt ${attempt + 1}: ${valid ? 'PASS' : 'FAIL'}`)
              personalText = text
              if (valid) break
            }
          })(),
          // News: stream immediately while personal is being validated
          streamOpenRouter(NEWS_SYSTEM, buildNewsPrompt(story.newsEvent), 'news', controller, encoder),
        ])
      } catch (err) {
        console.error('Generation error:', err)
      }

      const fullPersonal = personalText + (story.closingLine ?? '')
      if (fullPersonal) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'personal', text: fullPersonal })}\n\n`))
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
