const express=require("express");
const router=express.Router();
const User=require("../models/User");
const bcrypt = require("bcrypt");
const {getToken}= require("../utils/helpers");

router.post("/register", async (req, res)=>{
    //this code is run when register API is called as POST request
    // my req.body will be of the format {email, password, firstName, lastName, username} -- req contains the information required for 
    // that request.
    // Step 1 : save the content of req.body in a variable
    const {email, password, firstName, lastName, userName} = req.body;

    //Step 2 : check whether the user details already exists or not? if yes we throw an error -- findOne method to check the particular email id

    const user = await User.findOne({email: email});

    if (user){

        // we could also return res.json() but this takes default status code as 200, which usually tells that api call ran successfully
        // all the error codes in 400 series determines that something is wrong
        return res.status(403).json({error : "A user with this email id already exists"});
    }

    // if this is a valid request ; create a new user in the DB ; we do not store passwords in plain text
    //we conver plain text password to hash which is very difficult to hack
    //the hash value is based on 2 parameters
    // the catch is if we keep those 2 parameters same , the plain text will always result in same hash

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserData = {email, password : hashedPassword, firstName, lastName, userName};
    const newUser = await User.create(newUserData);

    // Step 4 : we want to create a Token to return to the user
    const token = await getToken(email, newUser);

    //Step 5 : return the result to the user
    const userToReturn = {...newUser.toJSON(), token};
    delete userToReturn.password; // it is a security measure to delete the password from the json file before sending it back to user

    return res.status(200).json(userToReturn);

});

router.post("/login", async (req, res)=> {
    //Step 1 : Get the email and password from req.body
    const {email, password}= req.body;

    //Step 2 : check whether the email exists. If not then invalid credentials
    const user= await User.findOne({email : email});
    if (!user){
        return res.status(403).json({err: "Invalid Credentials!!"});
    }
    //Step 3 : check whether the password is correct. If not then invalid credentials
    //this is tricky. Why ? Because we saved the password in hash format , but we cannot convert it back to the text format
    //bcrypt.compare enabled us to compare one password in plain text to a  hashed  password securely.
    const isPasswordValid = bcrypt.compare(password, user.password); //boolean value

    if(!isPasswordValid) {
        return res.status(403).json({err:"Invalid Credentials!!"});
    }

    //Step 4 : if the credentials are correct. then we will return the token to the user.

    const token=await getToken(user.email, user);
     
    const userToReturn = {...user.toJSON(), token};
    delete userToReturn.password; // it is a security measure to delete the password from the json file before sending it back to user

    return res.status(200).json(userToReturn);

});

module.exports= router;