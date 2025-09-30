const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Pas de token, accès refusé" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token invalide" });
  }
}

module.exports = auth;
