'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'landing' | 'select' | 'intake' | 'transition' | 'story'
type TransitionStep = 'blank' | 'moment' | 'familiar'

interface IntakeAnswers {
  location: string
  light: string
  tomorrow: string
  alone: string
}

interface DetectedCtx {
  time: string
  place: string
}

interface Story {
  id: string
  place: string
  gesture: string
  architecture: string
  newsEvent: string
}

// ─── Stories ──────────────────────────────────────────────────────────────────

const STORIES: Story[] = [
  {
    id: 'border',
    place: 'south texas',
    gesture: 'a drive through a changed town',
    architecture: `A woman drives her elderly mother through the town where the mother grew up in south Texas. The mother keeps pointing to lots where houses used to be, and the daughter keeps saying yes, I know, even when she doesn't know. The fields look different. Neither of them says what they mean by that.`,
    newsEvent: `Border wall construction in south Texas; eminent domain seizures of private land along the Rio Grande; families whose property has been taken or divided; the physical transformation of towns and agricultural land in the construction corridor.`,
  },
  {
    id: 'smoke',
    place: 'california',
    gesture: 'a walk in the wrong-colored sky',
    architecture: `Two college roommates who haven't spoken in three years happen to be in the same city. They meet for a walk because it's a thing to do with your hands. The sky is the wrong color — that particular California yellow-grey. One of them is about to move abroad. They talk about the smoke.`,
    newsEvent: `Wildfire smoke and air quality warnings across California and the western United States; AQI levels reaching hazardous thresholds; how recurring fire seasons have changed daily life; the particular atmospheric quality of smoke-filtered light that has become a recurring feature of western summers.`,
  },
  {
    id: 'hospital',
    place: 'a hospital',
    gesture: 'a waiting room, a phone face-down',
    architecture: `A man sits in a hospital waiting room while his wife is in labor. It is taking longer than expected. A nurse passes him twice without making eye contact. He buys a coffee from the vending machine and then another one. He counts the chairs. At some point he realizes he's been holding his phone face-down.`,
    newsEvent: `Hospital staffing shortages and nurse strikes across the United States; critical understaffing in labor and delivery units; the impact of healthcare worker burnout and contract disputes on patient care; the gap between staffing levels and patient need in maternity wards.`,
  },
  {
    id: 'desk',
    place: 'an office',
    gesture: 'a saturday, a desk cleared out',
    architecture: `A daughter helps her father clean out his desk on a Saturday, when no one else will see. They take two trips to the car. He has kept, for twenty years, a magnet from a family vacation that she barely remembers. She carries it in her coat pocket the whole drive home without telling him.`,
    newsEvent: `Mass tech layoffs; tens of thousands of jobs cut across major technology companies; office building vacancies rising in San Francisco, Seattle, and Austin; the human cost of corporate restructuring and reduction-in-force announcements delivered by email.`,
  },
  {
    id: 'garden',
    place: 'home',
    gesture: 'the garden, before remembering',
    architecture: `Two brothers at their childhood home for the first time since their mother's funeral. One of them goes out to water the garden before realizing. The other watches from the window. They eat dinner late and leave most of it.`,
    newsEvent: `Severe drought conditions across the western United States; mandatory water restrictions and conservation orders in multiple states; groundwater depletion in the Colorado River basin; the cumulative impact of multi-year drought on residential life, agriculture, and municipal water supply.`,
  },
  {
    id: 'recipe',
    place: 'a kitchen',
    gesture: 'a recipe with gaps',
    architecture: `A Palestinian-American woman teaches her daughter to make her grandmother's recipe. She doesn't know all the steps — there are gaps where she must approximate. The daughter doesn't know they are approximating. It comes out close but not exactly right, and they eat it anyway without saying so.`,
    newsEvent: `The conflict in Gaza; ongoing ceasefire negotiations; the displacement of Palestinian families and the severing of intergenerational connection; the loss of cultural continuity — recipes, language, place-knowledge — that cannot be recovered under conditions of war and dispossession.`,
  },
  {
    id: 'table',
    place: 'a restaurant',
    gesture: 'a phone, face-up on the table',
    architecture: `A social gathering — dinner or a long lunch. Sofía has her phone face-up on the table. Everyone has noticed. Nobody says anything yet. Gossip: someone asks why she's so distracted; someone mentions the divorce. Spring break comes up. Someone complains about Puerto Vallarta — the cartel situation, itineraries changed. Sofía looks up. Her grandmother lives in Mexico. She has spent all day waiting to hear back.`,
    newsEvent: `Cartel violence in Mexico, particularly in tourist and border regions including Jalisco and Nayarit; U.S. State Department travel advisories; the impact of ongoing violence on both travelers and residents; the experience of families divided across the U.S.-Mexico border living with sustained uncertainty.`,
  },
]

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'location',
    prompt: 'Are you inside or outside?',
    options: ['inside', 'outside'],
  },
  {
    id: 'light',
    prompt: 'What does the light look like?',
    options: [
      'thin and artificial',
      'warm, coming through a window',
      'already gone',
      "I'm not paying attention",
    ],
  },
  {
    id: 'tomorrow',
    prompt: 'Do you have somewhere to be tomorrow?',
    options: ['yes, early', 'yes, but not urgent', 'nothing', "I don't know yet"],
  },
  {
    id: 'alone',
    prompt: 'Are you alone?',
    options: ['yes', 'no, but I might as well be', 'no'],
  },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function formatTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const period = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  const min = m.toString().padStart(2, '0')
  return `${hour}:${min} ${period}`
}

async function detectCtx(): Promise<DetectedCtx> {
  const time = formatTime(new Date())
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error('ipapi failed')
    const data = await res.json()
    const place =
      [data.city, data.region, data.country_name].filter(Boolean).join(', ') ||
      Intl.DateTimeFormat().resolvedOptions().timeZone
    return { time, place }
  } catch {
    return { time, place: Intl.DateTimeFormat().resolvedOptions().timeZone }
  }
}

// ─── Landing ──────────────────────────────────────────────────────────────────

function Landing({ onBegin }: { onBegin: () => void }) {
  const [clicked, setClicked] = useState(false)

  function handleClick() {
    if (clicked) return
    setClicked(true)
    setTimeout(onBegin, 400)
  }

  return (
    <div className="screen screen-dark">
      <div className="landing-inner">
        <p className="landing-main">This story will happen once.</p>
        <p className="landing-sub">It will not save.</p>
        <button className={`begin-btn${clicked ? ' clicked' : ''}`} onClick={handleClick}>
          Begin
        </button>
      </div>
    </div>
  )
}

// ─── StorySelect ──────────────────────────────────────────────────────────────

function StorySelect({ onSelect }: { onSelect: (story: Story) => void }) {
  return (
    <div className="screen screen-dark">
      <div className="select-inner">
        <p className="select-eyebrow">seven scenes</p>
        <ul className="select-list">
          {STORIES.map((story) => (
            <li
              key={story.id}
              className="select-item"
              onClick={() => onSelect(story)}
            >
              <span className="select-place">{story.place}</span>
              <span className="select-sep"> · </span>
              <span className="select-gesture">{story.gesture}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── IntakeQuestion ───────────────────────────────────────────────────────────

function IntakeQuestion({
  question,
  onSelect,
}: {
  question: (typeof QUESTIONS)[number]
  onSelect: (id: string, val: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleOptionClick(val: string) {
    if (selected !== null) return
    setSelected(val)
    setTimeout(() => onSelect(question.id, val), 180)
  }

  return (
    <div className="intake-screen">
      <div className="intake-inner">
        <p className="intake-prompt">{question.prompt}</p>
        <div className="intake-options">
          {question.options.map((opt, i) => (
            <button
              key={opt}
              className={`intake-option${
                selected === null ? '' : selected === opt ? ' selected' : ' dimmed'
              }`}
              style={{ animationDelay: `${i * 0.08 + 0.15}s` }}
              onClick={() => handleOptionClick(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TransitionScreen ─────────────────────────────────────────────────────────

function TransitionScreen({ step }: { step: TransitionStep }) {
  if (step === 'blank') return <div className="screen screen-dark" />
  return (
    <div className="screen screen-dark">
      <p className="transition-text" key={step}>
        {step === 'moment' ? 'One moment.' : 'This may feel familiar.'}
      </p>
    </div>
  )
}

// ─── WhatModal ────────────────────────────────────────────────────────────────

function WhatModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <p className="modal-text">
          This story was generated once, for you. The plot was fixed. What changed was the
          threshold — the sensory and situational surround — built from what you gave us.
          The form was designed to be invisible. What you felt was the point.
        </p>
        <button className="modal-close" onClick={onClose}>
          close
        </button>
      </div>
    </div>
  )
}

// ─── StoryView ────────────────────────────────────────────────────────────────

function StoryView({
  personalText,
  newsText,
  done,
  onReset,
  onWhatIsThis,
}: {
  personalText: string
  newsText: string
  done: boolean
  onReset: () => void
  onWhatIsThis: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distFromBottom < 120) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [personalText, newsText])

  return (
    <div className="story-screen screen-light" ref={scrollRef}>
      <div className="story-grid">

        {/* Left: the record */}
        <div className="story-col">
          <div className="col-header">
            <span className="col-label">the record</span>
            <p className="col-desc">The same event, rendered as news. Facts without a reader.</p>
          </div>
          <p className="news-text">
            {newsText}
            {!done && newsText.length > 0 && <span className="cursor" />}
          </p>
        </div>

        <div className="story-divider" />

        {/* Right: yours */}
        <div className="story-col">
          <div className="col-header">
            <span className="col-label">yours</span>
            <p className="col-desc">Generated with your context. The facts are fixed. What changes is everything you brought.</p>
          </div>
          <p className="story-text">
            {personalText}
            {!done && <span className="cursor" />}
          </p>
        </div>

        {/* Ending — spans both columns */}
        {done && (
          <div className="ending-block">
            <p className="ending-line">That was the only version.</p>
            <div className="ending-actions">
              <button className="ending-btn" onClick={onReset}>Read another</button>
              <button className="ending-btn" onClick={onWhatIsThis}>What was this?</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function SubtextApp() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [transitionStep, setTransitionStep] = useState<TransitionStep>('blank')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({})
  const [detected, setDetected] = useState<DetectedCtx | null>(null)
  const [personalText, setPersonalText] = useState('')
  const [newsText, setNewsText] = useState('')
  const [storyDone, setStoryDone] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (phase === 'intake') detectCtx().then(setDetected)
  }, [phase])

  useEffect(() => {
    if (phase === 'story') {
      document.documentElement.classList.add('story-active')
    } else {
      document.documentElement.classList.remove('story-active')
    }
  }, [phase])

  function handleStorySelect(story: Story) {
    setSelectedStory(story)
    setPhase('intake')
  }

  function handleSelect(id: string, val: string) {
    const updated = { ...answers, [id]: val } as Partial<IntakeAnswers>
    setAnswers(updated)
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1)
    } else {
      runTransition(updated as IntakeAnswers)
    }
  }

  async function runTransition(finalAnswers: IntakeAnswers) {
    setPhase('transition')
    setTransitionStep('blank')
    await wait(700)
    setTransitionStep('moment')
    await wait(2200)
    setTransitionStep('familiar')
    await wait(2200)
    setPhase('story')
    streamStory(finalAnswers)
  }

  async function streamStory(finalAnswers: IntakeAnswers) {
    const ctx = detected ?? { time: formatTime(new Date()), place: Intl.DateTimeFormat().resolvedOptions().timeZone }
    const intake = {
      time: ctx.time,
      place: ctx.place,
      light: finalAnswers.light,
      location: finalAnswers.location,
      tomorrow: finalAnswers.tomorrow,
      alone: finalAnswers.alone,
      storyId: selectedStory?.id ?? 'table',
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake }),
      })
      if (!res.body) { setStoryDone(true); return }

      const reader = res.body.getReader()
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
          let parsed: { type: string; text?: string }
          try { parsed = JSON.parse(raw) } catch { continue }

          if (parsed.type === 'done') {
            setTimeout(() => setStoryDone(true), 1500)
            return
          }
          if (parsed.type === 'personal' && parsed.text) {
            setPersonalText((prev) => prev + parsed.text)
          }
          if (parsed.type === 'news' && parsed.text) {
            setNewsText((prev) => prev + parsed.text)
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err)
      setTimeout(() => setStoryDone(true), 500)
    }
  }

  function reset() {
    setPhase('landing')
    setTransitionStep('blank')
    setSelectedStory(null)
    setQIndex(0)
    setAnswers({})
    setDetected(null)
    setPersonalText('')
    setNewsText('')
    setStoryDone(false)
    setShowModal(false)
  }

  return (
    <>
      {phase === 'landing' && <Landing onBegin={() => setPhase('select')} />}
      {phase === 'select' && <StorySelect onSelect={handleStorySelect} />}
      {phase === 'intake' && (
        <IntakeQuestion
          key={qIndex}
          question={QUESTIONS[qIndex]}
          onSelect={handleSelect}
        />
      )}
      {phase === 'transition' && <TransitionScreen step={transitionStep} />}
      {phase === 'story' && (
        <StoryView
          personalText={personalText}
          newsText={newsText}
          done={storyDone}
          onReset={reset}
          onWhatIsThis={() => setShowModal(true)}
        />
      )}
      {showModal && <WhatModal onClose={() => setShowModal(false)} />}
    </>
  )
}
