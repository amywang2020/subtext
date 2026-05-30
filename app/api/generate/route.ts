import { NextRequest } from 'next/server'

// ─── Stories ──────────────────────────────────────────────────────────────────

const STORIES: Record<string, { architecture: string; newsEvent: string; closingLine?: string; newsArticle?: string }> = {
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
    newsArticle: `MEXICO CITY — The U.S. State Department this week renewed its highest-level travel warnings for several Mexican states, citing a sustained surge in cartel-related violence across tourist and border regions. Advisories now urge Americans to avoid travel to Jalisco and Nayarit, where clashes between rival groups and security forces have closed highways and stranded residents for days at a time.

Tour operators report widespread cancellations along the Pacific coast, with itineraries rerouted away from areas that drew hundreds of thousands of visitors last year. Local officials say the economic toll has compounded the human one.

For families divided across the U.S.-Mexico border, the warnings translate into something quieter: calls that go unanswered, relatives unreachable for hours or days as cell networks falter and roads close. Aid groups note that elderly residents in the affected towns are often the hardest to reach.

The violence shows no sign of abating, officials said, and the advisories remain in effect indefinitely.`,
  },
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const LITERARY_SYSTEM = `You are a literary fiction writer working in the tradition of autofiction and witness literature. Close third person. Present tense. Compressed, precise prose. You do not explain. You show. Dialogue is rendered with standard quotation marks, not em dashes.`

const NEWS_SYSTEM = `You are a wire-service journalist writing in the style of AP or Reuters. Third person, past tense. Economical, factual, precise.`

// A subtle, UNNAMED shared undertone: each reader is among others nearby who
// are all absorbed elsewhere. Never names a place, school, room, or "screens"
// — it only colors the second-person line and echoes Sofía at her table. The
// real per-reader variation comes from the psychological answers and the
// answer-timing, which differ person to person even in one room.
const READER_ENVIRONMENT = `The reader is among other people nearby, each absorbed in something of their own. Use this only as faint atmosphere — NEVER as the subject or content of the second-person line, and never named. Never name a place, an institution, a room, or screens, and never make this the story's setting.`

function buildPersonalPrompt(architecture: string, newsEvent: string, intake: Record<string, string>, profile: ReaderProfile | null): string {
  const weather = profile
    ? `THE READER'S INFERRED WEATHER (your primary calibration — apply it as craft, never state it):
— Register: ${profile.register}
— Tempo: ${profile.tempo}
— Diction: ${profile.diction}
— Carrying underneath: ${profile.preoccupation}
— Render Sofía: ${profile.sofia}`
    : `THE READER (calibrate register; never name these):
— How they answered: ${intake.pace ?? 'at an even pace'}${intake.hesitation ? `; ${intake.hesitation}` : ''}. A longer hesitation means the fear sits closer to the surface.`

  return `Generate a prose piece of 280–320 words. Output only the story — no title, no preamble.

THE FIXED SITUATION (the plot does not change):
${architecture}

STRUCTURAL CONTEXT (the systemic pressure behind the scene — do not name it or editorialize; let it weight the texture):
${newsEvent}

READER CONTEXT — invisible. Apply the inferred weather concretely; never name or quote what produced it.

${weather}

DIRECT SIGNALS (mechanical calibration):
— Current time: ${intake.time}
— Where their attention is: ${intake.presence}
— Where their phone is: ${intake.phone}

SHARED UNDERTONE (faint, never the setting):
${READER_ENVIRONMENT}

INSTRUCTIONS:
— Open with a sentence of ambient texture whose rhythm obeys the Tempo and whose word-choice obeys the Diction above. Vary the anchor between readers — heat, the hour, a held silence, the wine, the air pressure of a long meal, a single sound — but NEVER open on cutlery, forks, or plates, and never "the light" as the grammatical subject. The first sentence is weather, and it should already carry this reader's register.
— Apply the inferred weather as craft, not content: let Register, Tempo, and Diction shape the prose itself — sentence length, word texture, the emotional key. Never state any of it; the reader should feel it in how the story is written, not read it described.
— The psychological layer calibrates Sofía's register. If the reader is mostly somewhere else: Sofía's fear is physically present, embodied, hard to keep still — her hands, her posture, small involuntary movements. If the reader is mostly here: Sofía is composed on the surface, dissociated, observing the table from a slight remove, the fear running underneath.
— Sofía's phone is face-up on the table — this is fixed and does not change. The reader's phone answer calibrates its weight in the room: face-up readers get a phone that pulls at the edges of every sentence; face-down readers get one that is present but held at a distance, suppressed.
— Do not surface the intake answers as observations. Invisible scaffolding, not reported data.
— The story's geography is fixed — do not relocate it. Reader context changes texture, not setting.
— The reader's real surround (a classroom, a university, students, people on laptops or phones, screens) is NEVER depicted as Sofía's setting. Her scene remains the gathering. Their surround exists only as the faint undertone beneath the second-person line.
— Somewhere in the middle: one line in second person that feels slightly too precise. It must grow out of THIS reader's "Carrying underneath" (the preoccupation above) fused with the waiting — name a private feeling specific to that preoccupation, not a generic one. FORBIDDEN: the "everyone around you is elsewhere / half-listening / each in their own small distance" construction in any form — it is overused; find a fresh angle from the preoccupation instead. No echo of any intake (no times, clock numbers, objects, titles, locations). It lands as uncanny because it names a private feeling, not a fact. One sentence only.
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

READER CONTEXT — infer invisibly, never name:
— The last thing they listened to: ${intake.listened}
— The last book they read: ${intake.book}
— Current time: ${intake.time}

INSTRUCTIONS:
— Open with a sentence of ambient texture — sound, temperature, the weight of the hour.
— Let what they last read and heard color the mood; never name or place them.
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

const STORY_MODEL = 'anthropic/claude-opus-4.8-fast'   // the writer — 4.8 quality, ~half the latency for the live room
const NEWS_MODEL = 'anthropic/claude-sonnet-4.6'      // wire-service filler — lighter
const VALIDATOR_MODEL = 'openai/gpt-4.1-mini'         // cross-provider verifier — avoids self-preference
const INFERENCE_MODEL = 'google/gemini-2.5-flash'     // cross-provider profiler — foreign to the writer

interface ReaderProfile {
  register: string
  tempo: string
  diction: string
  preoccupation: string
  sofia: string
}

const INFERENCE_SYSTEM = `You are a psychological profiler for a literary personalization engine. From a few small signals about a reader, you infer concrete RENDERING DIRECTIVES for a short story — never personality clichés, never naming or quoting the inputs. You translate taste and behavior into craft. Output strict JSON only.`

// Stage 1: turn raw signals into concrete craft directives. A cross-provider
// model is used on purpose — its "read" is foreign to the Opus writer's prior,
// which perturbs the writer off its default rendering and fights homogeneity.
async function inferProfile(intake: Record<string, string>): Promise<ReaderProfile | null> {
  const prompt = `A reader gave these signals. Infer how their story should be RENDERED — concrete craft directives, not personality description. Never name or quote the book, the music, or the phone; translate them into register, tempo, and diction.

SIGNALS:
— last book read: ${intake.book ?? '—'}
— last thing listened to: ${intake.listened ?? '—'}
— attention right now: ${intake.presence ?? '—'}
— phone: ${intake.phone ?? '—'}
— answered: ${intake.pace ?? 'at an even pace'}${intake.hesitation ? `; ${intake.hesitation}` : ''}

Return JSON only. Each value is a short, concrete directive (≤ 16 words), no clichés, no mention of the book/music/phone as objects:
{
  "register": "the emotional key the prose should sit in",
  "tempo": "sentence rhythm and pacing",
  "diction": "word texture — spare vs lush, plain vs ornate",
  "preoccupation": "what the reader carries underneath, as a felt undertone",
  "sofia": "one concrete directive for rendering Sofía's body and fear, from attention + phone + pace"
}`
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: OPENROUTER_HEADERS,
      body: JSON.stringify({
        model: INFERENCE_MODEL,
        stream: false,
        max_tokens: 300,
        messages: [
          { role: 'system', content: INFERENCE_SYSTEM },
          { role: 'user', content: prompt },
        ],
      }),
    })
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return null
    const p = JSON.parse(match[0]) as ReaderProfile
    console.log('[subtext] profile:', JSON.stringify(p))
    return p
  } catch (e) {
    console.error('[subtext] inferProfile error:', e)
    return null
  }
}

async function generateOpenRouter(system: string, prompt: string, model: string = STORY_MODEL): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: OPENROUTER_HEADERS,
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 900,
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

async function validateStory(text: string, leakTerms: string[]): Promise<boolean> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: OPENROUTER_HEADERS,
    body: JSON.stringify({
      model: VALIDATOR_MODEL,
      stream: false,
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Check this story for specific problems. Reply with JSON only: {"valid": true} or {"valid": false, "issues": ["..."]}.

STORY:
${text}

CHECK FOR (any one fails the whole story):
1. ANY proper personal name other than "Sofía" — this includes people who are only referred to, not present (e.g. a friend named "Mariana", or "Marcus", "Lauren", "David"). Terms of address are fine: "mija", "honey", "sweetie", "abuela", "Sof", "Sofi".
2. Incoming contact actually ARRIVES for Sofía: a call rings, a notification banner appears, the phone buzzes with a new message, or a voicemail is received. NOTE: Sofía waiting for contact, the phone staying silent or dark, or references to not having heard back are NOT violations — the silence is the point of the story.
3. Any of these reader-provided phrases appearing literally in the story: ${leakTerms.filter(Boolean).map(t => `"${t}"`).join(', ') || '(none — skip this check)'}
4. The story's final sentence is cut off — it ends mid-clause or without terminal punctuation (one of . ? ! ").
5. The opening sentence has "light" or "the light" as its grammatical subject.
6. A simile — any comparison built with "like" or "as if" / "as though" (e.g. "like furniture", "as though it might ring", "the laugh hung like smoke"). Ordinary non-comparative uses ("would you like", "things like that") are fine.
7. More than ONE luxury or status marker stacked onto the table guests (e.g. a travel agent AND a private villa AND a chartered boat AND multiple resort destinations). A single marker is fine; several stacked tips the guests into caricature.`,
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
  encoder: TextEncoder,
  model: string = NEWS_MODEL
) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: OPENROUTER_HEADERS,
    body: JSON.stringify({
      model,
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
  const { intake, model } = await req.json()
  const storyModel: string = model || STORY_MODEL

  const story = STORIES[intake.storyId as string] ?? STORIES.table
  const encoder = new TextEncoder()

  // Stage 1 (inference) starts immediately; news streams concurrently so the
  // extra call is masked. Only the table story uses the inferred profile.
  const profilePromise = intake.storyId === 'table' ? inferProfile(intake) : Promise.resolve(null)

  const stream = new ReadableStream({
    async start(controller) {
      let personalText = ''

      try {
        await Promise.all([
          // Personal: infer profile → build prompt → generate → validate → retry once
          (async () => {
            const profile = await profilePromise
            if (profile) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'profile', profile })}\n\n`))
            }
            const personalPrompt = intake.storyId === 'table'
              ? buildPersonalPrompt(story.architecture, story.newsEvent, intake, profile)
              : buildGenericPrompt(story.architecture, story.newsEvent, intake)
            for (let attempt = 0; attempt < 2; attempt++) {
              const text = await generateOpenRouter(LITERARY_SYSTEM, personalPrompt, storyModel)
              const valid = await validateStory(text, [intake.book, intake.listened].filter(Boolean) as string[])
              console.log(`[subtext] personal attempt ${attempt + 1}: ${valid ? 'PASS' : 'FAIL'}`)
              personalText = text
              if (valid) break
            }
          })(),
          // The record: a fixed, pre-written article when available (no LLM —
          // it's identical for every reader anyway). Falls back to generation
          // only for stories that don't have one pre-written.
          (async () => {
            if (story.newsArticle) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'news', text: story.newsArticle })}\n\n`))
            } else {
              await streamOpenRouter(NEWS_SYSTEM, buildNewsPrompt(story.newsEvent), 'news', controller, encoder)
            }
          })(),
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
