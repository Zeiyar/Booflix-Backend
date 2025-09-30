const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const authRoutes = require("./Routes/Auth");

// Cookies
const app = express();
app.use(cookieParser());
app.use(cors({ origin: "https://booflix.netlify.app", credentials: true }));
app.use(express.json());

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(process.env.PORT, () => console.log(`Serveur sur port ${process.env.PORT}`));
  })
  .catch((err) => console.error(err));
