const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH = process.env.JWT_REFRESH_SECRET;

const router = express.Router();

router.post("/register",async(req,res)=>{
    try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email déjà utilisé" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login",async(req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if (!user) 
            return res.status(400).json({ msg: "Email introuvable" });

        const isMatch = await bcrypt.compare(password,user.password); 
        if (!isMatch) return res.status(400).json({ msg: "Mot de passe incorrect" });

        const accesstoken = jwt.sign({ id: user._id , tokenVersion: user.tokenVersion }, JWT_SECRET, { expiresIn: "15m" });
        const refreshtoken = jwt.sign({ id: user._id , tokenVersion: user.tokenVersion }, JWT_REFRESH, { expiresIn: "7d" });

        res
        .cookie("refreshToken", refreshtoken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" })
        .json({ accesstoken,user: {id: user._id, email: user.email}});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/refresh",async(req,res)=>{
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({msg : "pas de refresh token"});

    try{
        const verified = jwt.verify(token, JWT_REFRESH);
        const newAccessToken = jwt.sign({id : verified.id}, JWT_SECRET, {expiresIn: "15m"});
        res.json({accesstoken: newAccessToken});
    }
    catch(err){
        res.status(403).json({ msg: "Refresh token invalide" });
    }
});

router.put("/change-password",async(req,res)=>{
  const {oldPassword,newPassword} = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token manquant" });

  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur introuvable" });

    const isMatch = await bcrypt.compare(oldPassword,user.password);
    if(!isMatch) return res.status(400).json({ msg: "Ancien mot de passe incorrect" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword,salt);

    user.password = hashedPassword;

    user.tokenVersion += 1;
    await user.save();

    res.clearCookie("refreshToken");

    res.status(200).json({message : "Mot de passe changé avec succès veuillez vous reconnectez"});  
  }catch(err){
    return res.status(403).json({ msg: "Token invalide" });
}
});

router.post("/logout",(req,res)=>{
  res.clearCookie("refreshToken");
  return res.json({ msg: "Déconnecté avec succès" });
})

module.exports = router;