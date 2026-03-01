import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion })
}

// Funding goals — sequential milestones
const GOALS = [
  { id: 1, amount: 200, label: 'Real-Time Research', description: 'Powers CLIFF\'s ability to search for the latest policy changes, agency contacts, and waitlist updates for your family.' },
  { id: 2, amount: 350, label: 'AI Navigator', description: 'Keeps CLIFF\'s 24/7 conversational guide running so families can get answers anytime.' },
  { id: 3, amount: 500, label: 'Always On', description: 'Server and infrastructure that keeps CLIFF available around the clock.' },
  { id: 4, amount: 600, label: 'Proactive Alerts', description: 'Email notifications, deadline reminders, and milestone warnings that reach families before it\'s too late.' },
  { id: 5, amount: 750, label: 'Full Month of CLIFF', description: 'Everything it takes to run CLIFF for one month, serving every Georgia family who needs it.' },
]

export async function GET() {
  try {
    const stripe = getStripe()

    // Get all successful payments tagged as cliff donations
    let totalRaised = 0
    let donorCount = 0

    // Fetch completed checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    })

    for (const session of sessions.data) {
      if (session.metadata?.source === 'cliff-donate') {
        totalRaised += (session.amount_total || 0) / 100
        donorCount++
      }
    }

    // Also check active subscriptions for recurring revenue
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'active',
    })

    for (const sub of subscriptions.data) {
      // Count monthly subscriptions as their cumulative paid amount
      const invoices = await stripe.invoices.list({
        subscription: sub.id,
        status: 'paid',
        limit: 100,
      })
      for (const invoice of invoices.data) {
        if (invoice.metadata?.source === 'cliff-donate' || sub.metadata?.source === 'cliff-donate') {
          totalRaised += (invoice.amount_paid || 0) / 100
        }
      }
    }

    // Determine current goal
    let cumulativeTarget = 0
    let currentGoal = GOALS[GOALS.length - 1]
    let previousGoalsTotal = 0
    const completedGoals: typeof GOALS = []

    for (const goal of GOALS) {
      cumulativeTarget += goal.amount
      if (totalRaised < cumulativeTarget) {
        currentGoal = goal
        break
      } else {
        completedGoals.push(goal)
        previousGoalsTotal = cumulativeTarget
      }
    }

    // If all goals completed, show the last one as complete
    if (totalRaised >= GOALS.reduce((sum, g) => sum + g.amount, 0)) {
      return NextResponse.json({
        total_raised: Math.round(totalRaised * 100) / 100,
        donor_count: donorCount,
        current_goal: null,
        all_goals_complete: true,
        completed_goals: GOALS.map(g => g.id),
        goals: GOALS,
      })
    }

    const progressInCurrentGoal = totalRaised - previousGoalsTotal
    const percentOfCurrentGoal = Math.min(100, Math.round((progressInCurrentGoal / currentGoal.amount) * 100))

    return NextResponse.json({
      total_raised: Math.round(totalRaised * 100) / 100,
      donor_count: donorCount,
      current_goal: {
        ...currentGoal,
        raised_toward_goal: Math.round(progressInCurrentGoal * 100) / 100,
        percent: percentOfCurrentGoal,
      },
      all_goals_complete: false,
      completed_goals: completedGoals.map(g => g.id),
      goals: GOALS,
    })
  } catch (err) {
    console.error('Donation progress error:', err)
    // Return zeros on error so the page still renders
    return NextResponse.json({
      total_raised: 0,
      donor_count: 0,
      current_goal: {
        id: 1,
        amount: 200,
        label: 'Real-Time Research',
        description: 'Powers CLIFF\'s ability to search for the latest policy changes, agency contacts, and waitlist updates for your family.',
        raised_toward_goal: 0,
        percent: 0,
      },
      all_goals_complete: false,
      completed_goals: [],
      goals: [],
    })
  }
}
