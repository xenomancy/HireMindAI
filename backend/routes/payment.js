const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Initialize Stripe (uses a mock key if not provided to prevent crashes)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_sandbox');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const host = req.headers.origin || 'http://localhost:5173';

    // Sandbox Mock Fallback / Placeholder Alert (If Stripe is not configured)
    const isPlaceholder = !process.env.STRIPE_SECRET_KEY || 
                          process.env.STRIPE_SECRET_KEY === 'sk_test_mock_key_for_sandbox' || 
                          process.env.STRIPE_SECRET_KEY.includes('PASTE_YOUR_STRIPE_TEST_SECRET_KEY_HERE');

    if (isPlaceholder) {
      console.log("Stripe Secret Key is not configured. Blocking real gateway checkout redirect...");
      return res.status(400).json({
        success: false,
        message: 'Stripe Secret Key is not set in backend/.env. Please paste your sk_test_... key in backend/.env to open the real gateway, or click "Developer Sandbox Instant Toggle" below to simulate it!'
      });
    }

    // Real Stripe Checkout Session Creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'HireMind AI Premium Plan',
              description: 'Unlock unlimited ATS uploads, mock interviews, and roadmap generations forever.',
            },
            unit_amount: 1999, // $19.99 USD
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: user._id.toString(),
      customer_email: user.email,
      success_url: `${host}/dashboard?payment=success`,
      cancel_url: `${host}/dashboard?payment=cancel`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
});

// @desc    Stripe Webhook Handler
// @route   POST /api/payment/webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && sig && req.rawBody) {
      // Real Webhook verification using raw request body
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      // Development fallback: accept req.body directly
      console.log("Stripe Webhook Secret not set. Skipping signature check (dev-mode).");
      event = req.body;
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.plan = 'premium';
          await user.save();
          console.log(`Webhook Success: Upgraded user ${user.email} (${userId}) to premium.`);
        } else {
          console.error(`Webhook Error: User not found for ID ${userId}`);
        }
      } catch (err) {
        console.error(`Webhook Error updating user database: ${err.message}`);
        return res.status(500).send('Database update failed');
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
