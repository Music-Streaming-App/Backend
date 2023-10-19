const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/User");
//sessioin in passport authenticate is used to maintain the session of user in our website
router.post("/create", passport.authenticate("jwt", {session: false}), async (req, res) => {
    // req.user gets the user because of passport.authenticate
    const {name, thumbnail, track}=req.body;
    if (!name || !thumbnail || !track){
        return res.status(301).json({err:" Insufficient details to create song!! "});
    }

    const artist = req.user._id;
    const songDetails ={name,thumbnail, track, artist};
    const createdSong= await Song.create(songDetails);

    return res.status(200).json(createdSong);

});

router.get("/get/mysongs", passport.authenticate("jwt", {session: false}), async(req, res) => {
    //we need to get all the songs where artist id ==currentUser._id
    const songs = await Song.find({artist : req.user._id}).populate("artist");
    return res.status(200).json({data : songs});

});

//get route to get all the songs any artist has published
//I will send the artist id and I want to see all the songs the artist has published

router.get("/get/artist/:artistId", passport.authenticate("jwt", {session : false}), async(req, res) => {
    const {artistId} = req.params;
    //we can check if the artist exists or not
    const artist = await User.findOne({_id: artistId});
    if (!artist){
        return res.status(301).json({err : "Artist does not exist !!"});
    }

    const songs = await Song.find({artist : artistId});
    return res.status(200).json({data : songs});
});

//Get route to get single song by name
router.get("/get/songname/:songName", passport.authenticate("jwt", {session : false}), async(req, res) =>{
    const {songName}= req.params;

    //add pattern matching capabilities by using mongo query or elastic search 
    const songs = await Song.find({name : songName}).populate("artist");
    return res.status(200).json({data : songs});
});

module.exports=router;