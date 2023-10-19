const mongoose = require("mongoose");
// how to create a model
//Step 1 : requirements
//Step 2 : create a mongoose schema -- structure of a User model
//Step 3 : create a model

const Song = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    thumbnail: {
        type : String,
        required : true,
    },
    track : {
        type : String,
        required : true,
    },
    // artist is also a user in spotify, we will be using the Mongoose object id to get the artist information
    artist : {
        type : mongoose.Types.ObjectId,
        ref: "User",
    },
});

const SongModel = mongoose.model("Song", Song);

module.exports=SongModel;