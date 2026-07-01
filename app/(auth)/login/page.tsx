//app/(auth)/login/page.tsx
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--paper)'
      }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid var(--teal-l)',
          borderTop: '3px solid var(--teal)',
          borderRadius: '50%',
          animation: 'spin 0.85s linear infinite'
        }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}