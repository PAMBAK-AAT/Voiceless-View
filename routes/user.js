
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../Controllers/user.js");

                /// FOR SIGN-UP FORM...

router.route("/signup")
    .get( userController.renderSignUpForm)
    .post( wrapAsync(userController.signUp));


                /// FOR LOGIN FORM...

router.route("/login")
    .get( userController.renderLoginForm)
    .post( 
        // To save current url , so that after login we can come on same path
        saveRedirectUrl,
        passport.authenticate ( "local" , { failureRedirect: "/login" , failureFlash: true}) ,
        userController.login
    )

/// FOR LOG-OUT
router.get("/logout" , userController.logout);

module.exports = router;

/////////////////////   Alternative Method...



// router.get("/signup" , userController.renderSignUpForm);

// router.post("/signup" , wrapAsync(userController.signUp));

//                         /// FOR LOGIN FORM...

// router.get("/login" , userController.renderLoginForm);

// /// passport.authenticate ( "local" , { failureRedirect: "/login" , failureFlash: true})  -->
// /// It's a middleware that authenticate the user before giving any response...

// router.post(
//     "/login" , 
//     // To save current url , so that after login we can come on same path
//     saveRedirectUrl,
//     passport.authenticate ( "local" , { failureRedirect: "/login" , failureFlash: true}) ,
//     userController.login
// )

//                 /// FOR LOG-OUT
// router.get("/logout" , userController.logout);


// module.exports = router;