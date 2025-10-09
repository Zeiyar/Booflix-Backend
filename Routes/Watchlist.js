const express = require("express");
const router = express.Router();
const Watchlist = require("../Models/watchlist");

router.post("/",async(req,res)=>{
    try{
    const { userId, file, progress, poster, title} = req.body;

    const item = await Watchlist.findOneAndUpdate(
        { userId, title},
        { progress,poster,file, updatedAt: new Date() },
        { upsert: true, new : true},
    );

    res.json(item);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

router.get("/:userId",async(req,res)=>{
    try{
        const list = await Watchlist.find({ userId: req.params.userId }).sort({updatedAt: -1});
        res.json(list);
    } catch(err){
        res.status(500).json({error: err.message});
    } 
});

router.delete("/:userId/:id",async(req,res)=>{
    try{
        const {id} = req.params

        const deleted = await Watchlist.findByIdAndDelete(id);

        if (!deleted){
            return res.status(404).json({message: "episode non trouvé"});
        }
        res.status(200).json({message: "delete successfully",deleted});
    }
    catch(err){
        res.status(500).json({error: err.message});
    } 
})

module.exports = router;