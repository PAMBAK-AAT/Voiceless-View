

const User = require("../models/user.js");

module.exports.renderSignUpForm = (req , res) => {
    res.render("users/signup.ejs")
};

module.exports.signUp = async (req , res) => {

    try{
        
        let{ username , email , password } = req.body;
        const newUser = new User({username , email});
        const registeredUser = await User.register( newUser , password );

        // Now we want when we sign up then automatically we should have log in...
        console.log(registeredUser);

        req.login( registeredUser , (err) => {
            if(err){
                return next(err);
            }
            req.flash("success" , "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    }
    catch(err){
        req.flash("error" , err.message);
        res.redirect("/signup");
    }

}

module.exports.renderLoginForm = (req , res) => {
    res.render("users/login.ejs");
}


module.exports.login = async(req , res) => {
    req.flash("success" , "Welcome to WanderLust! , logged in");
    let redurl = res.locals.redirectUrl || "/listings";
    res.redirect(redurl);
}

module.exports.logout = (req , res , next) => {
    req.logout( (err) => {
        if(err){
            return next(err);
        }
        req.flash("success" , "You log-out successfully...");
        res.redirect("/listings");
    })
}
