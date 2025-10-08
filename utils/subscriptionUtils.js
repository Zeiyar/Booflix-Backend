function ipLimitForPlan(plan) {
  switch (plan) {
    case "Basic": return 1;
    case "Plus": return 3;
    case "Premium": return 6;
    default: return 0; // Free => 0 (pas d'accès payant)
  }
}

module.exports = {ipLimitForPlan};