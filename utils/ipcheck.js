const User = require("../Models/user");
const { ipLimitForPlan } = require("./subscriptionUtils");

async function addIpForUser(userId, ip) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const limit = ipLimitForPlan(user.subscription.plan);
    if (!limit) return false;

    if (user.subscription.ipList.includes(ip)) return true;

    if (user.subscription.ipList.length >= limit) return false;
    
    user.subscription.ipList.push(ip);
    await user.save();
    return true;
}

module.exports = {addIpForUser};