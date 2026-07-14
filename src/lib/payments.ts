/* ===== Payment Service — Razorpay Integration ===== */

export const PRO_PLAN = {
  name: 'ROAMIE Pro Monthly',
  description: 'Unlimited AI trips, offline maps, priority support',
  amount: 29900, // ₹299 in paise
  currency: 'INR',
  interval: 'month' as const,
}

export const PRO_PLAN_DISPLAY = {
  amount: '₹299',
  interval: '/month',
}

/* ===== Load Razorpay Checkout Script ===== */

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/* ===== Get Razorpay Key ID ===== */

function getRazorpayKeyId(): string | null {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID
  return key && key !== 'your-razorpay-key-id' ? key : null
}

/* ===== Open Razorpay Checkout ===== */

export interface CheckoutResult {
  success: boolean
  paymentId?: string
  error?: string
}

/**
 * Opens the Razorpay payment checkout popup.
 * Falls back to a simulated flow if the key is not configured.
 */
export async function openProCheckout(options: {
  name: string
  email?: string
  onSuccess: () => void
  onError?: (error: string) => void
}): Promise<CheckoutResult> {
  const keyId = getRazorpayKeyId()

  if (!keyId) {
    return simulateCheckout(options)
  }

  const scriptLoaded = await loadRazorpayScript()
  if (!scriptLoaded || !window.Razorpay) {
    return simulateCheckout(options)
  }

  return new Promise((resolve) => {
    const rzpOptions: RazorpayOptions = {
      key: keyId,
      amount: PRO_PLAN.amount,
      currency: PRO_PLAN.currency,
      name: 'ROAMIE',
      description: PRO_PLAN.description,
      image: '/roamie-icon.svg',
      prefill: {
        name: options.name,
        email: options.email || '',
      },
      theme: {
        color: '#00D4C4',
      },
      modal: {
        backdropclose: false,
        escape: false,
        confirm_close: true,
        ondismiss: () => {
          resolve({ success: false, error: 'Checkout cancelled' })
        },
      },
      handler: (response) => {
        options.onSuccess()
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
        })
      },
    }

    try {
      const RazorpayCtor = window.Razorpay!
      const rzp = new RazorpayCtor(rzpOptions)
      rzp.open()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open checkout'
      resolve({ success: false, error: message })
    }
  })
}

/* ===== Simulated Checkout (fallback when Razorpay key is not configured) ===== */

function simulateCheckout(options: {
  name: string
  onSuccess: () => void
  onError?: (error: string) => void
}): Promise<CheckoutResult> {
  return new Promise((resolve) => {
    // Show a confirmation dialog as a simulation
    const confirmed = window.confirm(
      `🪙 ROAMIE Pro Demo\n\n` +
      `${PRO_PLAN_DISPLAY.amount}${PRO_PLAN_DISPLAY.interval}\n` +
      `${PRO_PLAN.description}\n\n` +
      `No real payment will be charged.\n` +
      `Click OK to activate Pro for this session.`
    )

    if (confirmed) {
      // Simulate a short processing delay
      setTimeout(() => {
        options.onSuccess()
        resolve({ success: true, paymentId: 'sim_' + Date.now().toString(36) })
      }, 800)
    } else {
      resolve({ success: false, error: 'User cancelled' })
    }
  })
}
