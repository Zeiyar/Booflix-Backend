const User = require("../Models/user");

module.exports = (allowedPlans = []) => {
    return async(req,res,next) => {
        try{
            const user = await User.findById(req.userId);
            if (!user) return res.status(401).json({message: "utilisateur introuvable"});

            const plan = user.subscription?.plan || "free";

            if (!allowedPlans.includes(plan)) {
                return res.status(403).json({
                    message: `Accès refusé — abonnement requis (${allowedPlans.join(" ou ")})`
                });
            }
            next()
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Erreur vérification abonnement" });
    }
}}