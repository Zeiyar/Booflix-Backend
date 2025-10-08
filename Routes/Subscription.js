// routes/subscription.js
const express = require("express");
const Stripe = require("stripe");
const User = require("../Models/user");
const auth = require("../middleware/auth");
const { ipLimitForPlan } = require("../utils/subscriptionUtils");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Route: créer une session Stripe Checkout (client redirigé chez Stripe)
 * Body: { plan: "Basic" }
 */
router.post("/create-checkout-session", auth, async (req, res) => {
  try {
    const { plan } = req.body;
    // Map plan to Stripe price IDs (définis-les sur ton compte Stripe)
    const priceIdByPlan = {
      Basic: process.env.STRIPE_PRICE_BASIC,
      Plus: process.env.STRIPE_PRICE_PLUS,
      Premium: process.env.STRIPE_PRICE_PREMIUM,
    };
    const priceId = priceIdByPlan[plan];
    if (!priceId) return res.status(400).json({ msg: "Plan inconnu" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // ou "subscription" si tu veux abonnement récurrent
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: req.userId, plan },
      success_url: `${process.env.FRONTEND_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscribe/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur création session" });
  }
});

/**
 * Webhook Stripe : à configurer dans ton dashboard Stripe
 * Ici on écoute l'événement de paiement réussi pour marquer l'utilisateur comme abonné.
 */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature error", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).end();

      user.subscription.plan = plan;
      user.subscription.createdAt = new Date();
      // Optionnel: ajouter l'IP si session contient IP info (sinon on ajoute à la première connexion)
      await user.save();
      console.log(`User ${user.email} upgraded to ${plan}`);
    } catch (err) {
      console.error(err);
    }
  }

  res.json({ received: true });
});

/**
 * Endpoint mock pour dev : simule un paiement réussi (NE PAS déployer en prod)
 * Body: { plan: "Basic" }
 */
router.post("/mock-success", auth, async (req, res) => {
  const { plan } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
    user.subscription.plan = plan;
    user.subscription.createdAt = new Date();
    await user.save();
    res.json({ msg: "Mock payment enregistré", subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * GET subscription info
 */
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("email subscription");
  res.json(user.subscription || {});
});

module.exports = router;
