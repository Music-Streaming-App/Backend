// npm init : package.json -- This is the node project.
// npm i express -- expressJs package install hogaya -- project came to know that we are using express
// we finally use express

const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport=require("passport");
const User = require("./models/User");
const authRoutes=require("./routes/auth");
const songRoutes=require("./routes/song");
const playlistRoutes = require("./routes/playlist")
require("dotenv").config();
const app = express();
const port=8000;
const cors = require("cors");

app.use(cors(0));
app.use(express.json()); // this is to tell express whatever value we are getting in req convert it to json


// connect mongodb to the node app
//mongoose.connect() has two arguments : 1. Which db to connect to (db url) 2. Connection options

mongoose.connect(
    "mongodb+srv://admin:"+
        process.env.MONGO_PASSWORD+
        "@cluster0.pyvfpn0.mongodb.net/?retryWrites=true&w=majority", 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then((x)=>{
    console.log("Connected to Mongodb");
})
.catch((err)=>{
    console.log("Error while connecting to Mongodb");
});


//setting up passport , which helps in authentication -- jwt (jason web token) is an encrypted way of sending data on internet

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload.identifier}, function(err, user) {
        //done (err, does the user exist)
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));


//will create API of GET type -- which will return "Hello World" on "/"

app.get("/", (req, res) => {
    // req contains all data for the request
    // res contains all data for the response

    res.send("Hello World");
});

app.use("/auth", authRoutes);

app.use("/song", songRoutes);

app.use("/playlist", playlistRoutes);

//Now we want to tell express that our server will run on local host : 8000
app.listen(port, ()=>{
    console.log("App is running on the port : " + port);
});




