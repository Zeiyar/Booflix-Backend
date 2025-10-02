import { ListObjectsV2Command } from "@aws-sdk/client-s3";

app.get("/episodes",async(req,res)=>{
    try{
        const prefix = "Shows/DragonBall/S01/";
        const cmd = new ListObjectsV2Command({
            Bucket: process.env.B2_BUCKET,
            Prefix: prefix,
        })
        const data = await S3.send(cmd);

        const files = data.Content.map(file=>file.key);
        res.json({ files });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to list files" });
    }
})