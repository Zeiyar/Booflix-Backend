const express = require("express");
const dotenv = require("dotenv");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./Routes/Auth");
const episodes = require("./Routes/Episode");
const watchlist = require("./Routes/Watchlist");

dotenv.config();
const app = express();

// Cookies
app.use(cookieParser());
app.use(cors({ origin: "https://booflix.netlify.app", credentials: true }));
app.use(express.json());

const s3 = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  forcePathStyle: true,
});

app.get("/signed-url",async(req,res)=>{
  const fileKey = req.query.file;
  if (!fileKey) return res.status(400).json({error: "file param required"});

  try {
    const cmd = new GetObjectCommand({ Bucket: process.env.B2_BUCKET, Key: fileKey});
    const url = await getSignedUrl(s3, cmd, {expiresIn:3600});
    res.json({url});
  }
  catch(err){
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
})

// Routes
app.use("/api/auth", authRoutes);
app.use("/episodes", episodes);
app.use("/watchlist", watchlist);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(process.env.PORT, () => console.log(`Serveur sur port ${process.env.PORT}`));
  })
  .catch((err) => console.error(err));
