const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");

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

        const isMatch = await bcrypt.compare(user.password,password); 
        if (!isMatch) return res.status(400).json({ msg: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token,user: {id: user_id, email: user.email}});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = router;