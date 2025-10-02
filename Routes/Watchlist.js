const express = require("express");
const router = express.Router();
const Watchlist = require("../Models/watchlist");

router.post("/",async(req,res)=>{
    try{
    const { userId, file, progress, poster, title} = req.body;
    
    await Watchlist.findOneAndUpdate(
        { userId,file },
        { progress,poster,title, updatedAt: new Date() },
        { upsert: true, new : true},
    );

    res.json(item);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

router.get("/:userId",async(req,res)=>{
    try{
        const list = await Watchlist.find({ userId: req.params.userId });
        res.json(list);
    } catch(err){
        res.status(500).json({error: err.message});
    } 
});

module.exports = router;