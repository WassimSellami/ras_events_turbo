const express = require('express')
const router = express.Router()
const query = require('../utils/db.js')
const sendEmail = require('../utils/email.js')
const jwt = require('jsonwebtoken')


const authorization = (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY
    const token = req.cookies.token
    if (!token) {
      return res.sendStatus(403)
    }
    try {
      const data = jwt.verify(token, jwtSecretKey)
      req.id = data.id
      req.name = data.first_name + " " + data.last_name
      console.log(data)
      return next()
    } catch {
      return res.sendStatus(403);
    }
  };


// Login in post method generating JWT and returning it with additionnal user data
router.post('/login', async (req, res, next) => {
    let message="default message"
    let sql = "SELECT * FROM user where email = ?";
    let reqEmail = req.body.email
    let reqPassword = req.body.password
    try {
        var existingUser = await query(sql, [reqEmail])
    } catch {
        message = "Please verify your credentials !"
        return res.render("login", {message: message})
        // const error = new Error("Error! Something went wrong.");
        // return next(error);
    }
    if (existingUser.length==0){
        message = "Please verify your credentials !"
        return res.render("login", {message: message})
        // const error = Error("Wrong details please check at once");
        // return next(error);
    }
    if(existingUser[0].password != reqPassword){
        message = "Please verify your credentials !"
        return res.render("login", {message: message})

        // const error = Error("Wrong details please check at once");
        // return next(error);
    }
    let token;
    let user = existingUser[0];
    try {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        userData = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            time: Date()
        };
        // Creating jwt token
        token = jwt.sign(userData, jwtSecretKey);
    } catch (err) {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }
    sendEmail("User Login", user.first_name+" "+user.last_name);
    return res.
    cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }).status(200)
    .render("home", {user_id: userData.first_name})
})

// // Getting protected info by token
// router.get('/profile', authorization,(req, res) =>{        
//             let data = {
//                 "id":req.id,
//             }
//             return res.status(200).json({
//                 confirmation: "success",
//                 data: data,
//                 message: "You are authorized"
//             })
// })

// Logout: removing cookie.
router.get("/logout", authorization,  (req, res) => {
    sendEmail("User Logout", req.name);
    return res
      .clearCookie("token")
      .status(200)
      .send({ "message": "Successfully logged out !"});
  });


// module.exports = authorization
module.exports = router