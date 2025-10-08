const User = require("../Models/user");

module.exports = async function (req, res, next) {
    try {
        const userId = req.userId;
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
        const user = await User.findById(userId).select("subscription");
        if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

        const { ipList } = user.subscription || {};
        if (!ipList || ipList.length === 0) return next();

        if (!ipList.includes(ip)) {
            return res.status(403).json({ msg: "Adresse IP non autorisée pour ce compte" });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Erreur serveur" });
    }
}