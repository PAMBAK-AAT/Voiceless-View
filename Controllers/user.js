const User = require("../models/user.js"); // Import the User model

// Controller to render the signup form
module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs"); // Render the signup form
};

// Controller to handle user signup
module.exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email }); // Create a new User instance with the provided username and email
        const registeredUser = await User.register(newUser, password); // Register the user with the provided password

        // Automatically log in the user after successful signup
        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // Handle any login errors
            }
            req.flash("success", "Welcome to Wanderlust!"); // Flash a success message
            res.redirect("/listings"); // Redirect to the listings page
        });
    } catch (err) {
        req.flash("error", err.message); // Flash an error message if signup fails
        res.redirect("/signup"); // Redirect back to the signup form
    }
}

// Controller to render the login form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs"); // Render the login form
}

// Controller to handle user login
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to WanderLust! You are logged in."); // Flash a success message
    let redurl = res.locals.redirectUrl || "/listings"; // Redirect to the URL stored in res.locals.redirectUrl or the listings page
    res.redirect(redurl); // Redirect to the desired page
}

// Controller to handle user logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Handle any logout errors
        }
        req.flash("success", "You have successfully logged out."); // Flash a success message
        res.redirect("/listings"); // Redirect to the listings page
    });
}
