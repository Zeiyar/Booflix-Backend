const Stripe = require("stripe");
const User = require("../Models/user");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log("✅ Webhook reçu");
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Erreur signature Stripe :", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).end();
      if (!user.subscription) {
        user.subscription = {
        plan: "Free",
        status: "inactive",
        createdAt: new Date(),
        ipList: [],
      };}
      user.subscription.plan = plan;
      user.subscription.createdAt = new Date();
      user.subscription.status = "active";
      user.subscription.stripeSubscriptionId = session.subscription;
      await user.save();

      console.log(`✅ Utilisateur ${user.email} abonné au plan ${plan}`);
    } catch (err) {
      console.error("Erreur mise à jour abonnement :", err);
    }
  }
  res.json({ received: true });
};
