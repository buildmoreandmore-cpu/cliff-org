import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const { amount, type } = await request.json() as {
      amount: number
      type: 'one-time' | 'monthly'
    }

    if (!amount || amount < 1 || amount > 10000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'https://meetcliff.org'

    if (type === 'monthly') {
      // Create a price on the fly for the recurring donation
      const product = await stripe.products.create({
        name: `CLIFF Monthly Donation — $${amount}/mo`,
        metadata: { type: 'cliff-donation' },
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount * 100,
        currency: 'usd',
        recurring: { interval: 'month' },
      })

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: `${origin}/donate?success=true`,
        cancel_url: `${origin}/donate?canceled=true`,
        metadata: { source: 'cliff-donate', type: 'monthly' },
      })

      return NextResponse.json({ url: session.url })
    } else {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `CLIFF One-Time Donation — $${amount}`,
              description: 'Supporting Georgia families navigating disability benefits',
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }],
        success_url: `${origin}/donate?success=true`,
        cancel_url: `${origin}/donate?canceled=true`,
        metadata: { source: 'cliff-donate', type: 'one-time' },
      })

      return NextResponse.json({ url: session.url })
    }
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
