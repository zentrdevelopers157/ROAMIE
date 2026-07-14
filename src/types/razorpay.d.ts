/* ===== Razorpay Checkout Types ===== */

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  image?: string
  order_id?: string
  handler?: (response: RazorpayPaymentResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
    backdrop_color?: string
  }
  modal?: {
    backdropclose?: boolean
    escape?: boolean
    handleback?: boolean
    confirm_close?: boolean
    ondismiss?: () => void
    animation?: boolean
  }
  readonly subscription_id?: string
  readonly recurring?: boolean
  customer_id?: string
  callback_url?: string
  redirect?: boolean
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface Razorpay {
  new (options: RazorpayOptions): RazorpayInstance
}

interface RazorpayInstance {
  open: () => void
  close: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

interface Window {
  Razorpay?: Razorpay
}
