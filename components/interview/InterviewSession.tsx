'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { INTERVIEWER_PERSONAS } from '@/lib/interview/personas'

interface Turn {
  id: string
  turn_index: number
  question: string
  user_answer: string | null
  sub_scores: { structure: number; specificity: number; confidence: number; relevance: number } | null
  feedback: string | null
  source: string
}

interface Props {
  session: {
    id: string
    mode: string
    role: string
    industry: string
    persona: string
    target_dimension: string
    status: string
  }
  turns: Turn[]
}

type MessageType =
  | { type: 'interviewer_question'; text: string; turnIndex: number }
  | { type: 'user_answer'; text: string; turnIndex: number }
  | { type: 'interviewer_feedback'; scores: Turn['sub_scores']; feedback: string; turnIndex: number }
  | { type: 'interviewer_typing' }
  | { type: 'session_ending' }

const SCORE_COLOR = (s: number) =>
  s >= 70 ? '#0e7a5a' : s >= 50 ? '#e8922a' : '#dc2626'

const SCORE_LABEL = (s: number) =>
  s >= 80 ? 'Strong' : s >= 60 ? 'Good' : s >= 40 ? 'Developing' : 'Needs work'

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function InterviewSession({ session, turns: initialTurns }: Props) {
  const router = useRouter()
  const persona = INTERVIEWER_PERSONAS.find(p => p.id === session.persona) ?? INTERVIEWER_PERSONAS[0]

  const [messages, setMessages] = useState<MessageType[]>([])
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [waitingForNext, setWaitingForNext] = useState(false)
  const [sessionEnding, setSessionEnding] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)
  const [canType, setCanType] = useState(false)
  const [turnScores, setTurnScores] = useState<Record<number, number>>({}) // turnIndex -> avg score, for timeline
  const [elapsedSec, setElapsedSec] = useState(0)
  const [insufficientCredits, setInsufficientCredits] = useState<{ required: number; balance: number } | null>(null)
  const totalTurns = 5

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<MessageType[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  messagesRef.current = messages

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (canType && !submitting) inputRef.current?.focus()
  }, [canType, submitting])

  // Timer — counts up while the current question is awaiting an answer.
  // Soft/visual only: never auto-submits or penalises, just gives the user
  // a sense of real-interview pacing pressure.
  useEffect(() => {
    if (canType && !submitting && !sessionEnding) {
      setElapsedSec(0)
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [canType, submitting, sessionEnding])

  // Build initial messages from existing turns on load
  useEffect(() => {
    if (initialTurns.length === 0) return

    const built: MessageType[] = []
    const scores: Record<number, number> = {}
    for (const t of initialTurns) {
      built.push({ type: 'interviewer_question', text: t.question, turnIndex: t.turn_index })
      if (t.user_answer) {
        built.push({ type: 'user_answer', text: t.user_answer, turnIndex: t.turn_index })
        if (t.sub_scores && t.feedback) {
          built.push({ type: 'interviewer_feedback', scores: t.sub_scores, feedback: t.feedback, turnIndex: t.turn_index })
          scores[t.turn_index] = Math.round((t.sub_scores.structure + t.sub_scores.specificity + t.sub_scores.confidence + t.sub_scores.relevance) / 4)
        }
      }
    }
    setMessages(built)
    setTurnScores(scores)
    setAnsweredCount(initialTurns.filter(t => t.user_answer).length)

    const lastTurn = initialTurns[initialTurns.length - 1]
    if (!lastTurn.user_answer) setCanType(true)
  }, [])

  useEffect(() => {
    if (initialTurns.length === 1 && !initialTurns[0].user_answer) {
      showTypingThen(initialTurns[0].question, 0)
    }
  }, [])

  function addMessage(msg: MessageType) {
    setMessages(prev => [...prev, msg])
  }

  function removeTypingIndicator() {
    setMessages(prev => prev.filter(m => m.type !== 'interviewer_typing'))
  }

  function showTypingThen(question: string, turnIndex: number, delay = 600) {
    setCanType(false)
    setTimeout(() => {
      addMessage({ type: 'interviewer_typing' })
      setTimeout(() => {
        removeTypingIndicator()
        addMessage({ type: 'interviewer_question', text: question, turnIndex })
        setTimeout(() => setCanType(true), 300)
      }, 1400)
    }, delay)
  }

  async function submitAnswer() {
    if (!answer.trim() || submitting || waitingForNext) return
    const trimmed = answer.trim()
    setAnswer('')
    setSubmitting(true)
    setCanType(false)
    setError('')
    setInsufficientCredits(null)

    const currentTurnIndex = answeredCount
    addMessage({ type: 'user_answer', text: trimmed, turnIndex: currentTurnIndex })

    try {
      const res = await fetch(`/api/interview/session/${session.id}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: trimmed }),
      })

      if (res.status === 402) {
        const body = await res.json().catch(() => ({}))
        // Don't redirect away silently — the user's answer was already shown
        // in the chat optimistically but was never scored or saved server-side
        // (deductCredits fails before the turn is processed). Remove that
        // unsent bubble, restore the text so nothing is lost, and surface the
        // block in-context so the user knows exactly what happened and how
        // to get back to this exact point after topping up.
        setMessages(prev => prev.filter(m => !(m.type === 'user_answer' && m.turnIndex === currentTurnIndex)))
        setAnswer(trimmed)
        setInsufficientCredits({ required: body.required ?? 0, balance: body.balance ?? 0 })
        setSubmitting(false)
        setCanType(true)
        return
      }
      if (!res.ok) throw new Error('Submission failed')

      const data = await res.json()
      const newAnsweredCount = currentTurnIndex + 1
      setAnsweredCount(newAnsweredCount)

      if (data.scores) {
        const avg = Math.round((data.scores.structure + data.scores.specificity + data.scores.confidence + data.scores.relevance) / 4)
        setTurnScores(prev => ({ ...prev, [currentTurnIndex]: avg }))
      }

      setTimeout(() => {
        addMessage({ type: 'interviewer_typing' })
        setTimeout(() => {
          removeTypingIndicator()
          addMessage({
            type: 'interviewer_feedback',
            scores: data.scores,
            feedback: data.feedback,
            turnIndex: currentTurnIndex,
          })

          if (data.sessionShouldEnd || newAnsweredCount >= totalTurns) {
            setTimeout(() => {
              addMessage({ type: 'session_ending' })
              setSessionEnding(true)
              setTimeout(() => completeSession(), 2000)
            }, 1000)
          } else if (data.nextQuestion) {
            setTimeout(() => {
              showTypingThen(data.nextQuestion, newAnsweredCount, 200)
            }, 1200)
          }
        }, 1600)
      }, 400)

    } catch {
      setError('Something went wrong — please try again.')
      setCanType(true)
    } finally {
      setSubmitting(false)
      setWaitingForNext(false)
    }
  }

  async function completeSession() {
  console.log('STEP A - completeSession() called')

  setCompleting(true)

  try {
    const res = await fetch(`/api/interview/session/${session.id}/complete`, {
      method: 'POST',
    })

    console.log('STEP B - Response Status:', res.status)

    const body = await res.json().catch(() => null)

    console.log('STEP C - Response Body:', body)

    if (res.ok) {
      console.log('STEP D - Redirecting...')
      router.push(`/interview/${session.id}`)
      router.refresh()
    } else {
      console.error('STEP E - Report generation failed')
      setError(body?.error ?? 'Report generation failed')
      setCompleting(false)
    }
  } catch (err) {
    console.error('STEP F - Fetch Failed', err)
    setError('Failed to generate report.')
    setCompleting(false)
  }
}

  if (completing) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>📊</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          Generating your report…
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {persona.name} is reviewing all your answers and writing your improved example.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  const timerColor = elapsedSec < 60 ? 'var(--muted)' : elapsedSec < 120 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', maxWidth: 740, margin: '0 auto' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'var(--paper)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${persona.color}20`, border: `2px solid ${persona.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {persona.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{persona.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, display: 'inline-block' }} />
            {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)} interview · {session.role}
          </div>
        </div>

        {/* Timer — visible only while a question is awaiting an answer */}
        {canType && !submitting && !sessionEnding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            <span aria-hidden style={{ fontSize: 13 }}>⏱</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: timerColor }}>{fmtTime(elapsedSec)}</span>
          </div>
        )}
      </div>

      {/* ── QUESTION TIMELINE ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 20px', background: 'var(--paper)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {Array.from({ length: totalTurns }, (_, i) => {
          const isDone = i < answeredCount
          const isCurrent = i === answeredCount && !sessionEnding
          const score = turnScores[i]
          const stepColor = isDone && score != null ? SCORE_COLOR(score) : isCurrent ? persona.color : 'var(--border)'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < totalTurns - 1 ? 1 : undefined }}>
              <div
                title={isDone && score != null ? `Q${i + 1}: ${score}/100` : isCurrent ? `Q${i + 1}: in progress` : `Q${i + 1}`}
                style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: isDone ? stepColor : isCurrent ? `${persona.color}18` : 'var(--paper-2)',
                  border: `2px solid ${stepColor}`,
                  color: isDone ? '#fff' : isCurrent ? persona.color : 'var(--muted)',
                  animation: isCurrent ? 'pulseRing 1.8s ease-in-out infinite' : 'none',
                }}
              >
                {isDone ? (score != null ? '✓' : i + 1) : i + 1}
              </div>
              {i < totalTurns - 1 && (
                <div style={{ flex: 1, height: 2, background: i < answeredCount - (isCurrent ? 0 : 0) ? (i < answeredCount ? stepColor : 'var(--border)') : 'var(--border)', margin: '0 2px' }} />
              )}
            </div>
          )
        })}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {answeredCount}/{totalTurns}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 14px' }}>
            {persona.name} · {session.mode} interview · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>

        {messages.map((msg, i) => {
          if (msg.type === 'interviewer_typing') {
            return (
              <div key={`typing_${i}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${persona.color}20`, border: `1.5px solid ${persona.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {persona.emoji}
                </div>
                <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)', animation: `typingDot 1.3s ease-in-out ${d * 0.18}s infinite` }} />
                  ))}
                </div>
              </div>
            )
          }

          if (msg.type === 'interviewer_question') {
            return (
              <div key={`q_${i}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'msgIn 0.3s ease' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${persona.color}20`, border: `1.5px solid ${persona.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>
                  {persona.emoji}
                </div>
                <div style={{ maxWidth: '78%' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 }}>
                    {persona.name.split(' ')[0]}
                  </div>
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, fontFamily: 'var(--serif)', fontWeight: 500 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            )
          }

          if (msg.type === 'user_answer') {
            return (
              <div key={`a_${i}`} style={{ display: 'flex', justifyContent: 'flex-end', animation: 'msgIn 0.2s ease' }}>
                <div style={{ maxWidth: '78%' }}>
                  <div style={{ background: persona.color, borderRadius: '18px 18px 4px 18px', padding: '13px 17px', fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            )
          }

          if (msg.type === 'interviewer_feedback') {
            const scores = msg.scores
            const avg = scores ? Math.round((scores.structure + scores.specificity + scores.confidence + scores.relevance) / 4) : null
            return (
              <div key={`f_${i}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'msgIn 0.3s ease' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${persona.color}20`, border: `1.5px solid ${persona.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>
                  {persona.emoji}
                </div>
                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ background: `${persona.color}10`, border: `1px solid ${persona.color}30`, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    💬 {msg.feedback}
                  </div>
                  {scores && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[
                        { l: 'Structure',   v: scores.structure },
                        { l: 'Specificity', v: scores.specificity },
                        { l: 'Confidence',  v: scores.confidence },
                        { l: 'Relevance',   v: scores.relevance },
                      ].map(d => (
                        <div key={d.l} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--paper)', border: `1px solid ${SCORE_COLOR(d.v)}40`, borderRadius: 99, padding: '3px 10px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: SCORE_COLOR(d.v) }}>{d.v}</span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{d.l}</span>
                        </div>
                      ))}
                      {avg !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: SCORE_COLOR(avg), borderRadius: 99, padding: '3px 10px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{avg}/100 {SCORE_LABEL(avg)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          if (msg.type === 'session_ending') {
            return (
              <div key={`end_${i}`} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--teal-d)', background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 99, padding: '6px 18px', fontWeight: 500 }}>
                  ✓ Interview complete — generating your report…
                </div>
              </div>
            )
          }

          return null
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT AREA ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px 20px', background: 'var(--paper)', flexShrink: 0 }}>
        {insufficientCredits && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--amber-l)', border: '1px solid var(--amber-mid)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 10, flexWrap: 'wrap' }}>
            <span aria-hidden style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                Not enough credits to continue
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                This question needs {insufficientCredits.required} credits — you have {insufficientCredits.balance}. Your answer below is saved, ready to send once you top up.
              </div>
            </div>
            <a
              href="/settings/billing"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', background: 'var(--teal)', padding: '8px 16px', borderRadius: 99, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Add credits →
            </a>
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8, padding: '6px 12px', background: 'var(--red-l)', borderRadius: 'var(--r-md)' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submitAnswer()
              }
            }}
            disabled={!canType || submitting || sessionEnding}
            placeholder={
              sessionEnding ? 'Interview complete…'
              : !canType ? `${persona.name.split(' ')[0]} is typing…`
              : session.mode === 'negotiation' ? 'Respond to the offer presented…'
              : 'Type your answer… (Enter to send, Shift+Enter for new line)'
            }
            rows={3}
            style={{
              flex: 1, padding: '12px 16px', border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-lg)', fontSize: 13, fontFamily: 'var(--sans)',
              color: 'var(--ink)', background: canType && !sessionEnding ? 'var(--paper)' : 'var(--paper-2)',
              outline: 'none', resize: 'none', lineHeight: 1.6, transition: 'border-color 0.15s',
              borderColor: canType && answer ? persona.color : 'var(--border)',
            }}
          />
          <button
            onClick={submitAnswer}
            disabled={!canType || !answer.trim() || submitting || sessionEnding}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: canType && answer.trim() && !submitting ? persona.color : 'var(--border)',
              color: '#fff', cursor: canType && answer.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', fontSize: 18,
            }}
          >
            {submitting ? (
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : '↑'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 ${persona.color}30; }
          50% { box-shadow: 0 0 0 5px ${persona.color}00; }
        }
      `}</style>
    </div>
  )
}