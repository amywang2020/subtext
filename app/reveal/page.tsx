'use client'

import { useEffect, useState } from 'react'
import { FAKE_SUBMISSIONS } from '@/lib/fakeData'

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

export default function RevealPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('story-active')
    return () => document.documentElement.classList.remove('story-active')
  }, [])

  async function load() {
    if (demoMode) { setSubmissions(FAKE_SUBMISSIONS); return }
    const res = await fetch('/api/eval')
    const data = await res.json()
    setSubmissions(data)
  }

  useEffect(() => { load() }, [])

  function toggleDemo() {
    const next = !demoMode
    setDemoMode(next)
    setSelected([])
    setResetStep(0)
    if (next) {
      setSubmissions(FAKE_SUBMISSIONS)
    } else {
      fetch('/api/eval').then(r => r.json()).then(setSubmissions).catch(() => setSubmissions([]))
    }
  }

  const total = submissions.length
  const yes = submissions.filter(s => s.rating === 'yes').length
  const somewhat = submissions.filter(s => s.rating === 'somewhat').length
  const notReally = submissions.filter(s => s.rating === 'not really').length

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 2 ? [...prev, id] : prev
    )
  }

  const compareItems = selected.map(id => submissions.find(s => s.id === id)!).filter(Boolean)

  if (compareMode && compareItems.length === 2) {
    return (
      <div className="reveal-compare">
        <button className="reveal-back" onClick={() => setCompareMode(false)}>← back</button>
        <div className="compare-grid">
          {compareItems.map(s => (
            <div key={s.id} className="compare-col">
              <p className="compare-reader-word">{s.readerWord || '—'}</p>
              <div className="compare-intake">
                <p><span className="compare-intake-label">book</span>{s.intake.book}</p>
                <p><span className="compare-intake-label">heard</span>{s.intake.listened}</p>
                <p><span className="compare-intake-label">presence</span>{s.intake.presence}</p>
                <p><span className="compare-intake-label">phone</span>{s.intake.phone}</p>
              </div>
              {(s.intake.pace || s.intake.hesitation) && (
                <p className="compare-pace">
                  answered {s.intake.pace}{s.intake.hesitation ? ` · ${s.intake.hesitation}` : ''}
                </p>
              )}
              {s.profile && (
                <div className="compare-profile">
                  <p className="compare-profile-label">what it inferred</p>
                  {s.profile.register && <p><span>register</span>{s.profile.register}</p>}
                  {s.profile.preoccupation && <p><span>underneath</span>{s.profile.preoccupation}</p>}
                  {s.profile.sofia && <p><span>sofía</span>{s.profile.sofia}</p>}
                </div>
              )}
              <p className="compare-rating">
                {s.rating}{s.note ? <> &mdash; <em>&ldquo;{s.note}&rdquo;</em></> : null}
              </p>
              <p className="compare-story">{s.personalText}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="reveal-page">
      <div className="reveal-header">
        <p className="reveal-title">subtext</p>
        <div className="reveal-aggregate">
          {total === 0
            ? <p className="reveal-aggregate-text">waiting for responses...</p>
            : (
              <p className="reveal-aggregate-text">
                {yes + somewhat} of {total} felt recognized
                <span className="reveal-breakdown"> ({yes} yes · {somewhat} somewhat · {notReally} not really)</span>
              </p>
            )
          }
        </div>
        <div className="reveal-controls">
          <button className="reveal-action-btn" onClick={load}>refresh</button>
          {selected.length === 2 && (
            <button className="reveal-action-btn reveal-compare-btn" onClick={() => setCompareMode(true)}>
              compare selected
            </button>
          )}
          <button
            className={`reveal-action-btn reveal-demo-btn${demoMode ? ' reveal-demo-on' : ''}`}
            onClick={toggleDemo}
          >
            {demoMode ? '● demo data (on)' : 'demo data'}
          </button>
          {!demoMode && resetStep === 0 && (
            <button className="reveal-action-btn reveal-reset-btn" onClick={() => setResetStep(1)}>
              clear results
            </button>
          )}
          {resetStep === 1 && (
            <span className="reveal-reset-confirm">
              are you sure?{' '}
              <button className="reveal-reset-yes" onClick={() => setResetStep(2)}>yes, clear all</button>
              {' '}
              <button className="reveal-reset-no" onClick={() => setResetStep(0)}>cancel</button>
            </span>
          )}
          {resetStep === 2 && (
            <span className="reveal-reset-confirm">
              this is permanent.{' '}
              <button className="reveal-reset-yes" onClick={async () => {
                await fetch('/api/eval', { method: 'DELETE' })
                setSubmissions([])
                setSelected([])
                setResetStep(0)
              }}>delete everything</button>
              {' '}
              <button className="reveal-reset-no" onClick={() => setResetStep(0)}>cancel</button>
            </span>
          )}
        </div>
      </div>

      <div className="reveal-grid">
        {submissions.length === 0 && (
          <p className="reveal-empty">no responses yet.</p>
        )}
        {submissions.map(s => (
          <div
            key={s.id}
            className={`reveal-card${selected.includes(s.id) ? ' reveal-card-selected' : ''}`}
            onClick={() => toggleSelect(s.id)}
          >
            <div className="reveal-card-header">
              <p className="reveal-card-word">{s.readerWord || '—'}</p>
              <p className="reveal-card-rating">{s.rating}</p>
            </div>
            <div className="reveal-card-intake">
              <p><span className="reveal-intake-label">book</span>{s.intake.book}</p>
              <p><span className="reveal-intake-label">heard</span>{s.intake.listened}</p>
              <p><span className="reveal-intake-label">presence</span>{s.intake.presence}</p>
              <p><span className="reveal-intake-label">phone</span>{s.intake.phone}</p>
            </div>
            {(s.intake.pace || s.intake.hesitation) && (
              <p className="reveal-card-pace">
                answered {s.intake.pace}{s.intake.hesitation ? ` · ${s.intake.hesitation}` : ''}
              </p>
            )}
            {s.profile?.register && (
              <p className="reveal-card-profile">↳ inferred: {s.profile.register}</p>
            )}
            {s.note && <p className="reveal-card-note">&ldquo;{s.note}&rdquo;</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
