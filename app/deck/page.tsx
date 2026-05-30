'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { FAKE_SUBMISSIONS } from '@/lib/fakeData'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Submission {
  id: string
  timestamp: string
  intake: Record<string, string>
  personalText: string
  rating: string
  note: string
  readerWord: string
  profile?: Record<string, string>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function excerpt(text: string, words: number): string {
  const parts = (text ?? '').trim().split(/\s+/)
  if (parts.length <= words) return text.trim()
  return parts.slice(0, words).join(' ') + '…'
}

// Deterministic contrasting pair, cycled by `seed`. Prefers two submissions
// whose presence/phone answers differ, so the side-by-side actually contrasts.
function pickPair(subs: Submission[], seed: number): [Submission, Submission] | null {
  if (subs.length < 2) return null
  const n = subs.length
  const a = subs[seed % n]
  // walk forward from a midpoint offset until we find a different presence/phone
  for (let step = 0; step < n; step++) {
    const j = (seed + Math.floor(n / 2) + step) % n
    if (j === seed % n) continue
    const b = subs[j]
    if (b.intake?.presence !== a.intake?.presence || b.intake?.phone !== a.intake?.phone) {
      return [a, b]
    }
  }
  // fallback: just the next one
  return [a, subs[(seed + 1) % n]]
}

const INTAKE_ROWS: Array<[string, string]> = [
  ['book', 'last book'],
  ['listened', 'last heard'],
  ['presence', 'attention'],
  ['phone', 'phone'],
]

// ─── Slide primitives ───────────────────────────────────────────────────────

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="deck-eyebrow">{children}</p>
}

function PairCol({ s }: { s: Submission }) {
  return (
    <div className="deck-pair-col">
      <p className="deck-pair-word">{s.readerWord || '—'}</p>
      <div className="deck-pair-intake">
        {INTAKE_ROWS.map(([key, label]) => (
          <p key={key}>
            <span className="deck-pair-label">{label}</span>
            {s.intake?.[key] ?? '—'}
          </p>
        ))}
      </div>
      {(s.intake?.pace || s.intake?.hesitation) && (
        <p className="deck-pair-pace">
          answered {s.intake.pace}{s.intake.hesitation ? ` · ${s.intake.hesitation}` : ''}
        </p>
      )}
      {s.profile && (
        <div className="deck-pair-profile">
          <p className="deck-pair-profile-label">↳ what it inferred</p>
          {s.profile.register && <p><span className="deck-pair-plabel">register</span>{s.profile.register}</p>}
          {s.profile.preoccupation && <p><span className="deck-pair-plabel">underneath</span>{s.profile.preoccupation}</p>}
          {s.profile.sofia && <p><span className="deck-pair-plabel">sofía</span>{s.profile.sofia}</p>}
        </div>
      )}
      <p className="deck-pair-story">{excerpt(s.personalText, 55)}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeckPage() {
  const [i, setI] = useState(0)
  const [subs, setSubs] = useState<Submission[]>([])
  const [pairSeed, setPairSeed] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    // ?demo=1 → rehearse with fake data instead of the live store
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo')) {
      setSubs(FAKE_SUBMISSIONS)
      setLoaded(true)
      return
    }
    try {
      const res = await fetch('/api/eval')
      const data = await res.json()
      if (Array.isArray(data)) setSubs(data)
    } catch { /* keep whatever we had */ }
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Derived live data ──
  const total = subs.length
  const yes = subs.filter(s => s.rating === 'yes').length
  const somewhat = subs.filter(s => s.rating === 'somewhat').length
  const notReally = subs.filter(s => s.rating === 'not really').length
  const recognized = yes + somewhat
  const notes = subs.filter(s => s.note && s.note.trim().length > 0)
  const pair = pickPair(subs, pairSeed)

  // ── Slides ──
  const slides: ReactNode[] = [
    // 1 — title
    <div className="deck-slide deck-center" key="title">
      <Eyebrow>the reveal</Eyebrow>
      <h1 className="deck-title">this is how little it takes</h1>
      <p className="deck-sub">subtext · busgen 116</p>
    </div>,

    // 2 — recap
    <div className="deck-slide deck-center" key="recap">
      <Eyebrow>what just happened</Eyebrow>
      <p className="deck-lead">You all read the same story.</p>
      <p className="deck-body">
        Four questions. One fixed plot. A different version for every person in this room.
      </p>
    </div>,

    // 3 — LIVE aggregate
    <div className="deck-slide deck-center" key="aggregate">
      <Eyebrow>what you reported</Eyebrow>
      {total === 0 ? (
        <p className="deck-body deck-dim">
          {loaded ? 'no responses yet — press R to refresh' : 'loading…'}
        </p>
      ) : (
        <>
          <p className="deck-huge">{recognized}<span className="deck-huge-of"> of {total}</span></p>
          <p className="deck-body">felt the story recognized them.</p>
          <p className="deck-breakdown">
            {yes} yes · {somewhat} somewhat · {notReally} not really
          </p>
        </>
      )}
    </div>,

    // 4 — LIVE notes
    <div className="deck-slide" key="notes">
      <Eyebrow>what it got right — in their words</Eyebrow>
      {notes.length === 0 ? (
        <p className="deck-body deck-dim">{loaded ? 'no notes yet — press R to refresh' : 'loading…'}</p>
      ) : (
        <div className="deck-notes">
          {notes.slice(0, 16).map(s => (
            <p className="deck-note" key={s.id}>
              <span className="deck-note-word">{s.readerWord || '—'}</span>
              <span className="deck-note-text">“{s.note}”</span>
            </p>
          ))}
        </div>
      )}
    </div>,

    // 5 — the fixed skeleton
    <div className="deck-slide deck-center" key="skeleton">
      <Eyebrow>what never changed</Eyebrow>
      <p className="deck-skeleton">
        A gathering. Sofía&rsquo;s phone is face-up on the table. Gossip, a divorce, spring break.
        Someone mentions the cartel situation in Mexico. Sofía looks up — her grandmother lives there.
        She has waited all day to hear back.
      </p>
      <p className="deck-skeleton-close">
        “Somewhere, her grandmother&rsquo;s phone rings into whatever room it&rsquo;s in.”
      </p>
      <p className="deck-sub">identical plot, identical last line, for every reader.</p>
    </div>,

    // 6 — the prompt scaffold (the key reveal)
    <div className="deck-slide" key="scaffold">
      <Eyebrow>the prompt</Eyebrow>
      <pre className="deck-scaffold">
        <span className="sc-fixed">THE FIXED SITUATION (the plot does not change):{'\n'}</span>
        <span className="sc-fixed">  a gathering · phone face-up · the cartel turn · the grandmother{'\n\n'}</span>
        <span className="sc-news">STRUCTURAL CONTEXT (do not name it; let it weight the texture):{'\n'}</span>
        <span className="sc-news">  {'{ cartel violence · travel advisories · families split across the border }'}{'\n\n'}</span>
        <span className="sc-fixed">THE READER — inferred from four answers you barely noticed giving:{'\n'}</span>
        <span className="sc-fixed">  register:   </span><span className="sc-var">{'{ brittle, held together }'}</span>{'\n'}
        <span className="sc-fixed">  tempo:      </span><span className="sc-var">{'{ clipped — short declaratives }'}</span>{'\n'}
        <span className="sc-fixed">  diction:    </span><span className="sc-var">{'{ spare, plain }'}</span>{'\n'}
        <span className="sc-fixed">  underneath: </span><span className="sc-var">{'{ a grief kept under competence }'}</span>{'\n'}
        <span className="sc-fixed">  Sofía:      </span><span className="sc-var">{'{ a stillness that costs her }'}</span>{'\n\n'}
        <span className="sc-fixed">INSTRUCTIONS:{'\n'}</span>
        <span className="sc-fixed">  apply the inferred weather as craft — never state it.{'\n'}</span>
        <span className="sc-fixed">  do not relocate the story. stop before the final line.</span>
      </pre>
      <div className="deck-legend">
        <span><i className="dot dot-fixed" /> fixed structure</span>
        <span><i className="dot dot-var" /> what it inferred about you</span>
        <span><i className="dot dot-news" /> the news layer</span>
      </div>
    </div>,

    // 7 — the pipeline
    <div className="deck-slide deck-center" key="pipeline">
      <Eyebrow>the whole system</Eyebrow>
      <div className="deck-pipe">
        <span className="pipe-node">4 answers</span>
        <span className="pipe-arrow">→</span>
        <span className="pipe-node pipe-node-infer">inferred profile</span>
        <span className="pipe-arrow">→</span>
        <span className="pipe-node">scaffold</span>
        <span className="pipe-arrow">→</span>
        <span className="pipe-node">a model</span>
        <span className="pipe-arrow">→</span>
        <span className="pipe-node pipe-node-end">your story</span>
      </div>
      <p className="deck-sub">four answers become a psychological profile, then a story. the same shape as the feed that already has you.</p>
    </div>,

    // 8 — LIVE side by side
    <div className="deck-slide" key="pair">
      <Eyebrow>same skeleton, different skin</Eyebrow>
      {!pair ? (
        <p className="deck-body deck-dim">
          {loaded ? 'need at least two responses — press R to refresh' : 'loading…'}
        </p>
      ) : (
        <>
          <div className="deck-pair">
            <PairCol s={pair[0]} />
            <div className="deck-pair-divider" />
            <PairCol s={pair[1]} />
          </div>
          <p className="deck-hint-inline">press F to shuffle the pair</p>
        </>
      )}
    </div>,

    // 9 — the two layers
    <div className="deck-slide deck-center" key="layers">
      <Eyebrow>how you entered the story</Eyebrow>
      <div className="deck-layers">
        <div className="deck-layer">
          <p className="deck-layer-h">what you carried in</p>
          <p className="deck-layer-b">the last book you read · the last thing you heard — read for sensibility and mood, never named in the story.</p>
        </div>
        <div className="deck-layer">
          <p className="deck-layer-h">what you were doing</p>
          <p className="deck-layer-b">where your attention is · where your phone is · how long you hesitated — used to calibrate Sofía&rsquo;s fear. Never named.</p>
        </div>
      </div>
      <p className="deck-sub">you recognized yourself without knowing you&rsquo;d been asked.</p>
    </div>,

    // 10 — the turn
    <div className="deck-slide deck-center" key="turn">
      <p className="deck-lead">This is the benign version.</p>
      <p className="deck-body">
        We told you we were collecting data. We showed you the four questions. Everything was transparent.
      </p>
      <p className="deck-title-sm">Now consider the version you can&rsquo;t see.</p>
    </div>,

    // 11 — the invisible version
    <div className="deck-slide deck-center" key="invisible">
      <Eyebrow>the version that doesn&rsquo;t ask</Eyebrow>
      <p className="deck-body">
        It already has your location, your search history, your purchase patterns, your typing cadence,
        your mood inferred from your last twenty queries.
      </p>
      <p className="deck-body deck-spaced">
        Same pipeline: <span className="deck-em">minimal data → inference → personalized content → behavioral shift.</span>
      </p>
      <p className="deck-sub">it doesn&rsquo;t generate a story. it generates a feed, an ad, a recommendation, an appeal.</p>
    </div>,

    // 12 — Precedent: Aron
    <div className="deck-slide deck-center" key="aron">
      <Eyebrow>this isn&rsquo;t new — Aron et al., 1997</Eyebrow>
      <p className="deck-lead">36 questions, asked between two strangers, reliably manufactured intimacy — closeness on a schedule.</p>
      <p className="deck-sub">connection has always been engineerable from the right prompts. they used 36 questions and 45 minutes on two people. we used four, in five minutes, on a whole room.</p>
    </div>,

    // 13 — Finding 1
    <div className="deck-slide deck-center" key="f1">
      <Eyebrow>Matz et al. 2024</Eyebrow>
      <p className="deck-lead">A single psychological prompt is enough for LLM-personalized messages to significantly outperform generic ones.</p>
      <p className="deck-sub">we used four small questions, then inferred a profile from them. the commercial stack has thousands of data points.</p>
    </div>,

    // 14 — Finding 2
    <div className="deck-slide deck-center" key="f2">
      <Eyebrow>Kosinski et al. 2013</Eyebrow>
      <p className="deck-lead">10 Facebook Likes predict your personality better than a coworker. 150 beat a friend. 300 beat a spouse.</p>
      <p className="deck-sub">we asked four questions and inferred the rest. your real digital footprint is orders of magnitude larger.</p>
    </div>,

    // 15 — Finding 3
    <div className="deck-slide deck-center" key="f3">
      <Eyebrow>De Freitas et al. 2025</Eyebrow>
      <p className="deck-lead">AI companion apps already deploy emotionally manipulative tactics in 43% of user farewells — guilt, FOMO, metaphorical restraint.</p>
      <p className="deck-body">Up to 14× more engagement — until the tactic becomes visible. Then trust collapses.</p>
      <p className="deck-sub">this demo just ran that arc. it worked before the reveal. it is a different object now.</p>
    </div>,

    // 16 — the thesis
    <div className="deck-slide deck-center" key="thesis">
      <p className="deck-title-sm">
        The distance between personalization-as-comfort and personalization-as-manipulation
        is a single design decision:
      </p>
      <p className="deck-lead deck-thesis">show the architecture, or hide it.</p>
    </div>,

    // 17 — the closing question
    <div className="deck-slide deck-center" key="closing">
      <p className="deck-body">
        If four questions and a fiction can do this in five minutes, with full transparency —
      </p>
      <p className="deck-lead">
        what is the version that runs continuously, invisibly, across every feed you touch?
      </p>
      <p className="deck-body deck-spaced">
        And what would it mean to build systems that show you the architecture instead of hiding it?
      </p>
    </div>,

    // 18 — final beat
    <div className="deck-slide deck-center" key="final">
      <p className="deck-title-sm">We showed you.</p>
      <p className="deck-lead">The systems you live inside do not.</p>
      <p className="deck-sub deck-final-mark">subtext</p>
    </div>,
  ]

  const last = slides.length - 1
  const go = useCallback((d: number) => {
    setI(p => Math.max(0, Math.min(last, p + d)))
  }, [last])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault(); go(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault(); go(-1)
      } else if (e.key === 'r' || e.key === 'R') {
        load()
      } else if (e.key === 'f' || e.key === 'F') {
        setPairSeed(s => s + 1)
      } else if (e.key === 'Home') {
        setI(0)
      } else if (e.key === 'End') {
        setI(last)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, load, last])

  return (
    <div className="deck">
      <div className="deck-stage" key={i}>
        {slides[i]}
      </div>

      <div className="deck-chrome">
        <button className="deck-arrow" onClick={() => go(-1)} aria-label="previous" disabled={i === 0}>←</button>
        <span className="deck-counter">{i + 1} / {slides.length}</span>
        <button className="deck-arrow" onClick={() => go(1)} aria-label="next" disabled={i === last}>→</button>
      </div>

      {i === 0 && (
        <p className="deck-keyhint">→ advance · r refresh data · f shuffle pair</p>
      )}
    </div>
  )
}
