'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'landing' | 'intake' | 'transition' | 'story' | 'select'
type TransitionStep = 'blank' | 'moment' | 'familiar' | 'fixed' | 'brought'

interface IntakeAnswers {
  book: string
  listened: string
  presence: string
  phone: string
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

const TABLE_STORY = STORIES.find(s => s.id === 'table')!

// ─── Reader words ─────────────────────────────────────────────────────────────

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

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS: Array<{
  id: string
  prompt: string
  options?: string[]
  placeholder?: string
  quickOption?: string
}> = [
  {
    id: 'book',
    prompt: 'What\'s the last book you read?',
    placeholder: '',
    quickOption: 'I can\'t remember',
  },
  {
    id: 'listened',
    prompt: 'What\'s the last thing you listened to?',
    placeholder: '',
  },
  {
    id: 'presence',
    prompt: 'Right now, are you mostly here or mostly somewhere else?',
    options: ['mostly here', 'split', 'mostly somewhere else'],
  },
  {
    id: 'phone',
    prompt: 'Is your phone face-up or face-down right now?',
    options: ['face-up', 'face-down', 'I don\'t have it with me'],
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

// Turn per-question answer times into a behavioral signal. In a co-located
// room, this is one of the few things that actually varies per reader.
function summarizeHesitation(hes: Record<string, number>): { pace: string; hesitation: string } {
  const entries = Object.entries(hes)
  if (entries.length === 0) return { pace: 'at an even pace', hesitation: '' }
  const times = entries.map(([, t]) => t).sort((a, b) => a - b)
  const median = times[Math.floor(times.length / 2)]
  const pace = median > 7 ? 'slowly, with deliberation'
    : median < 2.5 ? 'quickly, almost without thinking'
    : 'at an even pace'
  const [longId, longSec] = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
  const phrase: Record<string, string> = {
    phone: 'they hesitated before saying where their phone was',
    presence: 'they paused before deciding whether they were here or somewhere else',
    listened: 'they paused over what they had last listened to',
    book: 'they hesitated about the last book they read',
  }
  const hesitation = longSec > median * 1.8 && longSec > 4 ? (phrase[longId] ?? '') : ''
  return { pace, hesitation }
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

function StorySelect({ onSelect, excludeId }: { onSelect: (story: Story) => void; excludeId?: string }) {
  const stories = excludeId ? STORIES.filter(s => s.id !== excludeId) : STORIES
  return (
    <div className="screen screen-dark">
      <div className="select-inner">
        <p className="select-eyebrow">{stories.length} scenes</p>
        <ul className="select-list">
          {stories.map((story) => (
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
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!question.options) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [question.options])

  function handleOptionClick(val: string) {
    if (selected !== null) return
    setSelected(val)
    setTimeout(() => onSelect(question.id, val), 180)
  }

  function handleTextSubmit() {
    const val = text.trim()
    if (!val) return
    onSelect(question.id, val)
  }

  return (
    <div className="intake-screen">
      <div className="intake-inner">
        <p className="intake-prompt">{question.prompt}</p>
        {question.options ? (
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
        ) : (
          <>
            <div className="intake-text-wrap">
              <input
                ref={inputRef}
                className="intake-text-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder={question.placeholder ?? ''}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <button
                className={`intake-text-submit${text.trim() ? ' visible' : ''}`}
                onClick={handleTextSubmit}
              >
                →
              </button>
            </div>
            {question.quickOption && (
              <button
                className="intake-quick"
                onClick={() => onSelect(question.id, question.quickOption!)}
              >
                {question.quickOption}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── TransitionScreen ─────────────────────────────────────────────────────────

const TRANSITION_LINES: Partial<Record<TransitionStep, string>> = {
  moment:   'One moment.',
  familiar: 'This may feel familiar.',
  fixed:    'The story is fixed.',
  brought:  'What changes is what you brought.',
}

function TransitionScreen({ step }: { step: TransitionStep }) {
  const text = TRANSITION_LINES[step]
  if (!text) return <div className="screen screen-dark" />
  return (
    <div className="screen screen-dark">
      <p className="transition-text" key={step}>{text}</p>
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

// ─── EvalQuestion ────────────────────────────────────────────────────────────

function EvalQuestion() {
  const [open, setOpen] = useState(false)
  return (
    <div className="eval-question-wrap">
      <p className="eval-question">
        did this find you?{' '}
        <button className="eval-what-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'close' : 'what does this mean?'}
        </button>
      </p>
      {open && (
        <p className="eval-what-text">
          You answered four questions. This story was built from them — not to describe you,
          but to arrive at your specific moment. We&rsquo;re asking how little it takes to produce
          that sensation.
        </p>
      )}
    </div>
  )
}

// ─── StoryView ────────────────────────────────────────────────────────────────

function StoryView({
  personalText,
  newsText,
  done,
  recordRevealed,
  showEval,
  evalRating,
  evalNote,
  evalSubmitted,
  readerWord,
  onRate,
  onNoteChange,
  onEvalSubmit,
  onReadAnother,
  onWhatIsThis,
}: {
  personalText: string
  newsText: string
  done: boolean
  recordRevealed: boolean
  showEval: boolean
  evalRating: string
  evalNote: string
  evalSubmitted: boolean
  readerWord: string
  onRate: (r: string) => void
  onNoteChange: (n: string) => void
  onEvalSubmit: () => void
  onReadAnother: () => void
  onWhatIsThis: () => void
}) {
  return (
    <div className="story-screen">
      <div className={`story-panes${recordRevealed ? ' with-record' : ''}`}>

        {/* Yours — streams from the top of its own scroll pane, no auto-follow */}
        <div className="story-pane story-pane-yours">
          <div className="col-header">
            <span className="col-label">yours</span>
            <p className="col-desc">Generated with your context. The facts are fixed. What changes is everything you brought.</p>
          </div>
          <p className="story-text">
            {personalText}
            {!done && <span className="cursor" />}
          </p>

          {/* Ending / eval lives at the foot of the yours pane */}
          {recordRevealed && (
            <div className="ending-block">
              {showEval && !evalSubmitted && (
                <>
                  <EvalQuestion />
                  <div className="eval-options">
                    {(['yes', 'somewhat', 'not really'] as const).map(r => (
                      <button
                        key={r}
                        className={`eval-option${evalRating === r ? ' eval-selected' : ''}`}
                        onClick={() => onRate(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {evalRating && (
                    <div className="eval-text-wrap">
                      <input
                        className="eval-text-input"
                        type="text"
                        placeholder="in a few words — what made you say that?"
                        value={evalNote}
                        onChange={e => onNoteChange(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onEvalSubmit()}
                        autoFocus
                        autoComplete="off"
                      />
                      <button
                        className={`eval-submit-btn${evalNote.trim() ? '' : ' eval-submit-disabled'}`}
                        onClick={onEvalSubmit}
                      >→</button>
                    </div>
                  )}
                </>
              )}
              {showEval && evalSubmitted && (
                <>
                  <p className="eval-thanks">thank you.</p>
                  <div className="ending-actions">
                    <button className="ending-btn" onClick={onReadAnother}>read another</button>
                    <button className="ending-btn" onClick={onWhatIsThis}>what was this?</button>
                  </div>
                </>
              )}
              {!showEval && (
                <div className="ending-actions">
                  <button className="ending-btn" onClick={onReadAnother}>read another</button>
                  <button className="ending-btn" onClick={onWhatIsThis}>what was this?</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* The record — its own scroll pane, always mounted; pushes in from the
            right and fades gently when revealed, then stays anchored/visible */}
        <div className="story-pane story-pane-record" aria-hidden={!recordRevealed}>
          <div className="col-header">
            <span className="col-label">the record</span>
            <p className="col-desc">The same event, rendered as news. Facts without a reader.</p>
          </div>
          <p className="news-text">{newsText}</p>
        </div>

      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function SubtextApp() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [transitionStep, setTransitionStep] = useState<TransitionStep>('blank')
  const [selectedStory, setSelectedStory] = useState<Story>(TABLE_STORY)
  const [readMode, setReadMode] = useState<'primary' | 'secondary'>('primary')
  const personalReadyRef = useRef(false)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({})
  const [capturedIntake, setCapturedIntake] = useState<Record<string, string> | null>(null)
  const [personalText, setPersonalText] = useState('')
  const [newsText, setNewsText] = useState('')
  const [storyDone, setStoryDone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [evalRating, setEvalRating] = useState('')
  const [evalNote, setEvalNote] = useState('')
  const [evalSubmitted, setEvalSubmitted] = useState(false)
  const [readerWord, setReaderWord] = useState('')
  const [recordRevealed, setRecordRevealed] = useState(false)
  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const questionStartRef = useRef<number>(0)
  const hesitationsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const stored = localStorage.getItem('subtext_reader_word')
    if (stored) { setReaderWord(stored); return }
    fetch('/api/word')
      .then(r => r.json())
      .then(({ word }: { word: string }) => {
        localStorage.setItem('subtext_reader_word', word)
        setReaderWord(word)
      })
      .catch(() => {
        const word = READER_WORDS[Math.floor(Math.random() * READER_WORDS.length)]
        localStorage.setItem('subtext_reader_word', word)
        setReaderWord(word)
      })
  }, [])

  useEffect(() => {
    if (phase === 'story') {
      document.documentElement.classList.add('story-active')
    } else {
      document.documentElement.classList.remove('story-active')
    }
  }, [phase])

  // Reset the per-question timer whenever a new intake question appears.
  useEffect(() => {
    if (phase === 'intake') questionStartRef.current = Date.now()
  }, [phase, qIndex])

  function handleSelect(id: string, val: string) {
    const elapsed = (Date.now() - (questionStartRef.current || Date.now())) / 1000
    hesitationsRef.current[id] = elapsed
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
    personalReadyRef.current = false
    setRecordRevealed(false)
    setProfile(null)

    streamStory(finalAnswers)

    setTransitionStep('blank')
    await wait(700)
    setTransitionStep('moment')
    await wait(2200)
    setTransitionStep('blank')
    await wait(500)
    setTransitionStep('familiar')
    await wait(2400)
    setTransitionStep('blank')
    await wait(500)
    setTransitionStep('fixed')
    await wait(2000)
    setTransitionStep('brought')
    await wait(2500)

    while (!personalReadyRef.current) {
      await wait(100)
    }

    setPhase('story')
  }

  async function streamStory(finalAnswers: IntakeAnswers) {
    const { pace, hesitation } = summarizeHesitation(hesitationsRef.current)
    const intake = {
      time: formatTime(new Date()),
      book: finalAnswers.book,
      listened: finalAnswers.listened,
      presence: finalAnswers.presence,
      phone: finalAnswers.phone,
      pace,
      hesitation,
      storyId: selectedStory.id,
    }
    setCapturedIntake(intake)

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
          let parsed: { type: string; text?: string; profile?: Record<string, string> }
          try { parsed = JSON.parse(raw) } catch { continue }

          if (parsed.type === 'profile' && parsed.profile) {
            setProfile(parsed.profile)
          }
          if (parsed.type === 'done') {
            setTimeout(() => setStoryDone(true), 5000)
            // Fallback: ensure the record reveals even if the typewriter path
            // never ran (empty/short personal text).
            setTimeout(() => setRecordRevealed(true), 6000)
            return
          }
          if (parsed.type === 'personal' && parsed.text) {
            const chunk = parsed.text as string
            personalReadyRef.current = true
            if (chunk.length > 150) {
              const tokens = chunk.split(/(\s+)/)
              let i = 0
              const reveal = () => {
                if (i >= tokens.length) {
                  // Story finished typing → reveal "the record" as a second beat.
                  setTimeout(() => setRecordRevealed(true), 5000)
                  return
                }
                const batch = tokens.slice(i, i + 4).join('')
                setPersonalText(prev => prev + batch)
                i += 4
                setTimeout(reveal, 22)
              }
              reveal()
            } else {
              setPersonalText(prev => prev + chunk)
              setTimeout(() => setRecordRevealed(true), 5000)
            }
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

  async function handleEvalSubmit() {
    if (!evalNote.trim()) return  // note is required
    try {
      await fetch('/api/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake: capturedIntake,
          personalText,
          rating: evalRating,
          note: evalNote,
          readerWord,
          profile,
        }),
      })
    } catch { /* silent fail — demo continues regardless */ }
    setEvalSubmitted(true)
  }

  function handleReadAnother() {
    setPhase('select')
    setReadMode('secondary')
    personalReadyRef.current = false
    setRecordRevealed(false)
    hesitationsRef.current = {}
    setQIndex(0)
    setAnswers({})
    setCapturedIntake(null)
    setPersonalText('')
    setNewsText('')
    setStoryDone(false)
    setSelectedStory(TABLE_STORY)
  }

  return (
    <>
      {readerWord && (
        <span className={`reader-word${phase === 'story' ? ' reader-word-light' : ''}`}>
          {readerWord}
        </span>
      )}
      {phase === 'landing' && <Landing onBegin={() => setPhase('intake')} />}
      {phase === 'select' && (
        <StorySelect
          excludeId="table"
          onSelect={(story) => {
            setSelectedStory(story)
            setRecordRevealed(false)
            hesitationsRef.current = {}
            setQIndex(0)
            setAnswers({})
            setPersonalText('')
            setNewsText('')
            setStoryDone(false)
            setPhase('intake')
          }}
        />
      )}
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
          recordRevealed={recordRevealed}
          showEval={readMode === 'primary'}
          evalRating={evalRating}
          evalNote={evalNote}
          evalSubmitted={evalSubmitted}
          readerWord={readerWord}
          onRate={setEvalRating}
          onNoteChange={setEvalNote}
          onEvalSubmit={handleEvalSubmit}
          onReadAnother={handleReadAnother}
          onWhatIsThis={() => setShowModal(true)}
        />
      )}
      {showModal && <WhatModal onClose={() => setShowModal(false)} />}
    </>
  )
}
