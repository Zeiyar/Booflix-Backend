const express = require("express");
const router = express.Router();
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3") ;

const s3 = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  forcePathStyle: true,
});

router.get("/", async (req, res) => {
  try {
    const prefix = "Shows/DragonBall/S01/";
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.B2_BUCKET,
      Prefix: prefix,
    });

    const data = await s3.send(cmd);
    const files = data.Contents.map(file => file.Key); // note : Contents avec S majuscule et Key
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list files" });
  }
});

module.exports = router;