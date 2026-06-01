'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'parsing'; versionId: string }
  | { status: 'complete'; versionId: string }
  | { status: 'error'; message: string }

const MAX_SIZE_MB = 5

export default function CVUploadZone({ userId }: { userId: string }) {
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const [dragOver, setDragOver] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFile = useCallback(async (file: File) => {
    const accepted = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!accepted.includes(file.type)) {
      setState({ status: 'error', message: 'Please upload a PDF or DOCX file.' })
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setState({ status: 'error', message: `File must be under ${MAX_SIZE_MB}MB.` })
      return
    }

    setState({ status: 'uploading', progress: 10 })

    try {
      // Step 1 — Upload to Supabase Storage
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`

      const { data: storageData, error: storageError } = await supabase.storage
        .from('resumes')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (storageError) throw new Error(storageError.message)

      setState({ status: 'uploading', progress: 40 })

      // Step 2 — Signed URL (bucket is private, public URLs 400)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('resumes')
        .createSignedUrl(storageData.path, 3600) // 1 hour

      if (signedError || !signedData?.signedUrl) {
        throw new Error('Could not generate file access URL')
      }

      setState({ status: 'uploading', progress: 60 })

      // Step 3 — Register version + parse job
      const uploadRes = await fetch('/api/cv/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: signedData.signedUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error ?? 'Upload registration failed')
      }

      const { versionId, jobId } = await uploadRes.json()
      setState({ status: 'uploading', progress: 80 })

      // Step 4 — Trigger parse (fire and forget — runs async)
      fetch('/api/cv/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          jobId,
          fileUrl: signedData.signedUrl,
          mimeType: file.type,
        }),
      })

      setState({ status: 'parsing', versionId })

      // Step 5 — Poll by versionId (not jobId)
      await pollForCompletion(versionId)

    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Upload failed. Please try again.',
      })
    }
  }, [userId, supabase])

  async function pollForCompletion(versionId: string) {
    const maxAttempts = 30   // 30 x 3s = 90s max
    const intervalMs  = 3000

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
      try {
        const res = await fetch(`/api/cv/status/${versionId}`)
        if (!res.ok) continue
        const data = await res.json()

        if (data.status === 'complete') {
          setState({ status: 'complete', versionId })
          setTimeout(() => router.push(`/cv/analysis/${versionId}`), 1200)
          return
        }
        if (data.status === 'failed') {
          setState({ status: 'error', message: data.error ?? 'Parsing failed. Please try again.' })
          return
        }
        // queued / parsing / normalizing — keep polling
      } catch {
        // network blip — keep polling
      }
    }
    setState({ status: 'error', message: 'Analysis is taking longer than usual. Check back in a moment.' })
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const isIdle   = state.status === 'idle'
  const isActive = state.status === 'uploading' || state.status === 'parsing'

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--teal)' : isActive ? 'var(--teal-mid)' : 'var(--border)'}`,
          borderRadius: 'var(--r-xl)', background: dragOver ? 'var(--teal-xl)' : isActive ? 'var(--teal-xl)' : 'var(--paper)',
          padding: '48px 32px', textAlign: 'center', transition: 'all 0.2s',
          cursor: isActive ? 'default' : 'pointer', marginBottom: 16,
        }}
        onClick={() => { if (!isActive) document.getElementById('cv-file-input')?.click() }}
      >
        <input id="cv-file-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={onInputChange} disabled={isActive} />

        {isIdle && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Drop your resume here</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>PDF or DOCX · Max {MAX_SIZE_MB}MB · Your data stays private</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--teal)', color: '#fff', fontSize: 14, fontWeight: 600, padding: '11px 24px', borderRadius: 99, boxShadow: '0 4px 14px rgba(14,122,90,0.22)' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Choose file
            </div>
          </>
        )}

        {state.status === 'uploading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⬆️</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Uploading…</div>
            <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--teal)', width: `${state.progress}%`, borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
          </>
        )}

        {state.status === 'parsing' && (
          <>
            <div style={{ width: 52, height: 52, border: '3px solid var(--teal-l)', borderTop: '3px solid var(--teal)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Analysing your resume…</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>AI is reading your experience, extracting skills,<br />and calculating your market score.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 20, maxWidth: 320, margin: '20px auto 0' }}>
              {['Extracting text content', 'Normalising with AI', 'Scoring market alignment', 'Calculating ATS compatibility'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--teal-d)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
                  {step}
                </div>
              ))}
            </div>
          </>
        )}

        {state.status === 'complete' && (
          <>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--teal)', marginBottom: 8 }}>Resume analysed</div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Redirecting to your results…</p>
          </>
        )}
      </div>

      {state.status === 'error' && (
        <div style={{ background: '#FDF1F1', border: '1px solid #FECACA', borderRadius: 'var(--r-md)', padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>Upload failed</div>
            <div style={{ fontSize: 13, color: 'var(--red)' }}>{state.message}</div>
            <button onClick={() => setState({ status: 'idle' })} style={{ marginTop: 8, fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Try again</button>
          </div>
        </div>
      )}

      {isIdle && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ icon: '📄', label: 'PDF supported' }, { icon: '📝', label: 'DOCX supported' }, { icon: '🔒', label: 'Private & secure' }, { icon: '🤖', label: 'AI-powered analysis' }].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '5px 12px' }}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}