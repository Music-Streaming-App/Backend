const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/User");
const Playlist = require("../models/Playlist");

//Router 1 : Create a playlist
router.post("/create", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const currentUser=req.user;
    const {name, thumbnail, songs}= req.body;
    if (!name || !thumbnail || !songs){
        return res.status(301).json({err: "Insufficient data !!"});
    }

    const playlistData= {name, thumbnail, songs, owner: currentUser._id, collaborators : [],};

    const playlist = await Playlist.create(playlistData);

    return res.status(200).json(playlist);
});

//Router 2 : get the playlist by ID
//we will get the playlist ID as router parameter and we will return the playlist having that ID
//if we are using /get/:playlistId (focus on ":"), then this playlistId is a variable to which we can assign any value
//e.g if we put anything like playlist/get/abasnsc this api will be called

router.get("/get/playlist/:playlistId", passport.authenticate("jwt", {session: false}), async (req, res) => {
    // this concept is called req.params 
    const playlistId = req.params.playlistId;

    const playlist= await Playlist.findOne({_id : playlistId}).populate({
        path: "songs",
        populate : {
            path:"artist"
        },
    });
    if (!playlist){
        return res.status(301).json({err : "Invalid ID !!"});
    }

    return res.status(200).json(playlist);
});

//Get all playlist made by me
router.get("/get/me", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const artistId = req.user._id;
    const playlist = await Playlist.find({owner : artistId}).populate('owner');

    return res.status(200).json({data : playlist});
});

//Router 3 : get all playlist made by an artist
router.get("/get/artist/:artistId", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const artistId = req.params.artistId;
    const artist = await User.findOne({_id : artistId});
    if (!artist){
        return res.status(304).json({err : "Invalid Artist ID !!"});
    }

    const playlist = await Playlist.find({owner : artistId});

    return res.status(200).json({data : playlist});
});


//Router 4 : add a song to a playlist

router.post("/add/song", passport.authenticate("jwt", {session : false}), async (req, res) => {
    const currentUser=req.user;
    const {playlistId, songId}= req.body;

    //check if the user owns the playlist or is a collaborator
    const playlist = await Playlist.findOne({_id : playlistId});
    if (!playlist){
        return res.status(304).json({err : "Playlist does not exist!!!"});
    }
    // we cannot compare two objects directly using == or != sign because those are reference based objects and == or != sign will compare
    // the memory address of two objects
    if (!playlist.owner.equals(currentUser._id) && !playlist.collaborators.includes(currentUser._id)){
        return res.status(400).json({err : "Not allowed !!"});
    }

    //check if song id is the valid song id 

    const song= await Song.findOne({_id:songId});
    if (!song){
        return res.status(304).json({err: "Song does not exist !!"});
    }

    //now we can simply add the song to the playlist

    playlist.songs.push(songId);
    await playlist.save();

    return res.status(200).json(playlist);

});



module.exports=router;