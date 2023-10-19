const mongoose = require("mongoose");
// how to create a model
//Step 1 : requirements
//Step 2 : create a mongoose schema -- structure of a User model
//Step 3 : create a model

const Playlist = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    thumbnail: {
        type : String,
        required : true,
    },
    // artist is also a user in spotify, we will be using the Mongoose object id to get the artist information
    owner : {
        type : mongoose.Types.ObjectId,
        ref: "User",
    },
    //1. Playlist mein songs kaunse hai
    //2. Playlist ke collaborators
    songs : [
        {
            type: mongoose.Types.ObjectId,
            ref: "Song",
        },
    ],
    collaborators : [
        {
            type: mongoose.Types.ObjectId,
            ref:"User",
        },
    ],
});

const PlaylistModel = mongoose.model("Playlist", Playlist);

module.exports=PlaylistModel;