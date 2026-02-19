import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { X, CreditCard, Loader2 } from 'lucide-react'
import { useCreateCheckout } from '../../hooks/useApi.ts'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (paymentId: string) => void
  applicationId: string
  slotTitle: string
  amount: number
}

function CheckoutForm({ onSuccess, paymentId, onClose }: { onSuccess: (id: string) => void; paymentId: string; onClose: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed. Please try again.')
      setProcessing(false)
    } else {
      onSuccess(paymentId)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={!stripe || processing} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : 'Pay Now'}
        </button>
      </div>
    </form>
  )
}

export function PaymentModal({ open, onClose, onSuccess, applicationId, slotTitle, amount }: PaymentModalProps) {
  const checkout = useCreateCheckout()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const initCheckout = async () => {
    try {
      setCheckoutError(null)
      const result = await checkout.mutateAsync({ application_id: applicationId })
      setClientSecret(result.client_secret)
      setPaymentId(result.payment_id)
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to initialize payment')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900">Complete Payment</h2>
              <p className="text-xs text-stone-500">{slotTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-stone-50 rounded-xl p-4 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Placement Fee</span>
              <span className="font-semibold text-stone-900">${amount.toFixed(2)}</span>
            </div>
          </div>

          {!stripePromise && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              Payment processing is not configured yet. Please contact support.
            </div>
          )}

          {!clientSecret && !checkoutError && stripePromise && (
            <button onClick={initCheckout} disabled={checkout.isPending} className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {checkout.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Preparing...</> : `Pay $${amount.toFixed(2)}`}
            </button>
          )}

          {checkoutError && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-3">
              {checkoutError}
              <button onClick={initCheckout} className="ml-2 underline">Retry</button>
            </div>
          )}

          {clientSecret && stripePromise && paymentId && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { borderRadius: '12px', colorPrimary: '#3b82f6' } } }}>
              <CheckoutForm onSuccess={onSuccess} paymentId={paymentId} onClose={onClose} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
