const Stripe = require("stripe");
const User = require("../Models/user");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log("✅ Webhook reçu (test mode)");

  let event = req.body; // ⬅️ pas de constructEvent ici

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    try {
      console.log("🔍 Mise à jour de l'utilisateur :", userId, plan);
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ Utilisateur non trouvé");
        return res.status(404).end();
      }

      // Si jamais "subscription" n'existe pas encore
      if (!user.subscription) user.subscription = {};

      user.subscription.plan = plan;
      user.subscription.createdAt = new Date();
      user.subscription.status = "active";
      await user.save();

      console.log(`✅ ${user.email} mis à jour avec le plan ${plan}`);
    } catch (err) {
      console.error("Erreur mise à jour abonnement :", err);
    }
  }

  res.json({ received: true });
};
