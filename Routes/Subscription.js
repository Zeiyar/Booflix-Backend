const express = require("express");
const Stripe = require("stripe");
const User = require("../Models/user");
const auth = require("../Middleware/AuthMiddleware");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", auth, async (req, res) => {
  try {
    const { plan } = req.body;

    const priceIdByPlan = {
      Basic: process.env.STRIPE_PRICE_BASIC,
      Styled: process.env.STRIPE_PRICE_STYLED,
      Premium: process.env.STRIPE_PRICE_PREMIUM,
    };
    const priceId = priceIdByPlan[plan];
    if (!priceId) return res.status(400).json({ msg: "Plan inconnu" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: req.userId, plan },
      success_url: `${process.env.FRONTEND_URL}params?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}params?cancel=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur création session" });
  }
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("subscription");
  res.json(user.subscription || {});
});

router.delete("/unsubscibe",auth,async(req,res)=>{
  try{
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    if (user.subscription?.stripeSubscriptionId) {
      await stripe.subscriptions.del(user.subscription.stripeSubscriptionId);
    }

    user.subscription = {
      plan: "Free",
      status: "inactive",
      createdAt: new Date(),
      ipList: []
    };

    await user.save();
    res.json({ msg: "Désabonnement effectué", subscription: user.subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur lors du désabonnement" });
  }
});

module.exports = router;