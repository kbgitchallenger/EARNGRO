import { createClient } from '@/lib/supabase/server'

function fmtAmount(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN')
}

const PLAN_LABELS: Record<string, string> = {
  grow: 'Grow Plan',
  accelerate: 'Accelerate Plan',
  grow_recharge: 'Credit Recharge',
  accelerate_recharge: 'Credit Recharge',
}

const METHOD_LABELS: Record<string, string> = {
  upi: 'UPI', card: 'Card', netbanking: 'Netbanking', wallet: 'Wallet',
}

export default async function PaymentHistory({ userId }: { userId: string }) {
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Payment history</div>

      {(!payments || payments.length === 0) && (
        <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>
          No payments yet — your first upgrade or recharge will show up here.
        </div>
      )}

      {payments?.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: i < payments.length - 1 ? '1px solid var(--border-l)' : 'none',
            gap: 12, flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
              {PLAN_LABELS[p.plan_or_pack_key] ?? p.plan_or_pack_key}
              {p.status === 'failed' && (
                <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, color: 'var(--red)', background: 'var(--red-l)', padding: '2px 8px', borderRadius: 99 }}>
                  Failed
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {p.payment_method && ` · ${METHOD_LABELS[p.payment_method] ?? p.payment_method}`}
              {' · '}
              <span style={{ fontFamily: 'monospace', fontSize: 10.5 }}>{p.razorpay_payment_id}</span>
            </div>
            {p.status === 'failed' && p.failure_reason && (
              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{p.failure_reason}</div>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: p.status === 'failed' ? 'var(--muted-l)' : 'var(--ink)', fontFamily: 'var(--serif)' }}>
            {fmtAmount(p.amount_paise)}
          </div>
        </div>
      ))}
    </div>
  )
}