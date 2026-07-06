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
  const totalTurns = 5

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<MessageType[]>([])

  // Keep ref in sync
  messagesRef.current = messages

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when typing is allowed
  useEffect(() => {
    if (canType && !submitting) inputRef.current?.focus()
  }, [canType, submitting])

  // Build initial messages from existing turns on load
  useEffect(() => {
    if (initialTurns.length === 0) return

    const built: MessageType[] = []
    for (const t of initialTurns) {
      built.push({ type: 'interviewer_question', text: t.question, turnIndex: t.turn_index })
      if (t.user_answer) {
        built.push({ type: 'user_answer', text: t.user_answer, turnIndex: t.turn_index })
        if (t.sub_scores && t.feedback) {
          built.push({ type: 'interviewer_feedback', scores: t.sub_scores, feedback: t.feedback, turnIndex: t.turn_index })
        }
      }
    }
    setMessages(built)
    setAnsweredCount(initialTurns.filter(t => t.user_answer).length)

    // Only allow typing if the last turn has no answer yet
    const lastTurn = initialTurns[initialTurns.length - 1]
    if (!lastTurn.user_answer) setCanType(true)
  }, [])

  // Show first question on fresh session (no initial turns with answers)
  useEffect(() => {
    if (initialTurns.length === 1 && !initialTurns[0].user_answer) {
      // Fresh session — animate the first question appearing
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

    // Show user message immediately
    const currentTurnIndex = answeredCount
    addMessage({ type: 'user_answer', text: trimmed, turnIndex: currentTurnIndex })

    try {
      const res = await fetch(`/api/interview/session/${session.id}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: trimmed }),
      })

      if (res.status === 402) {
        router.push('/settings/billing')
        return
      }
      if (!res.ok) throw new Error('Submission failed')

      const data = await res.json()
      const newAnsweredCount = currentTurnIndex + 1
      setAnsweredCount(newAnsweredCount)

      // Show typing indicator then feedback
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
            // Show next question after feedback settles
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
    setCompleting(true)
    try {
      const res = await fetch(`/api/interview/session/${session.id}/complete`, {
        method: 'POST',
      })
      if (res.ok) {
        router.push(`/interview/${session.id}`)
        router.refresh()
      }
    } catch {
      setError('Failed to generate report. Please refresh and try again.')
      setCompleting(false)
    }
  }

  // Generating report screen
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
        {/* Progress pills */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {Array.from({ length: totalTurns }, (_, i) => (
            <div key={i} style={{ width: 28, height: 4, borderRadius: 99, background: i < answeredCount ? persona.color : 'var(--border)', transition: 'background 0.4s' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
          {answeredCount}/{totalTurns}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Opening context bubble */}
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
                  {/* Feedback text */}
                  <div style={{ background: `${persona.color}10`, border: `1px solid ${persona.color}30`, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    💬 {msg.feedback}
                  </div>
                  {/* Score chips */}
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
      `}</style>
    </div>
  )
}