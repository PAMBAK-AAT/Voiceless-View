const Listing = require("./models/listing"); // Import the Listing model
const Review = require("./models/review.js"); // Import the Review model
const ExpressError = require("./utils/ExpressError.js"); // Import custom error handling class
const { listingSchema, reviewSchema } = require("./schema.js"); // Import validation schemas for listings and reviews

// Middleware to check if the user is logged in
module.exports.isLoggedin = (req, res, next) => {
    // If the user is not authenticated
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Save the URL the user was trying to access
        req.flash("error", "You must be logged in!"); // Set an error message
        return res.redirect("/login"); // Redirect the user to the login page
    }
    // If the user is authenticated, make user info available in res.locals
    res.locals.currUser = req.user; 
    next(); // Proceed to the next middleware or route handler
}

// Middleware to save the redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // Store the redirect URL in res.locals
    }
    next(); // Proceed to the next middleware or route handler
}

// Middleware to check if the logged-in user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params; // Get the listing ID from the request parameters
    let listing = await Listing.findById(id); // Find the listing by ID
    if (!listing) {
        req.flash("error", "Listing not found!"); // Set an error message if the listing is not found
        return res.redirect("/listings"); // Redirect to the listings page
    }
    // If the current user is not the owner of the listing
    if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You can't do any changes!"); // Set an error message
        return res.redirect(`/listings/${id}`); // Redirect to the specific listing page
    }
    next(); // Proceed to the next middleware or route handler
}

// Middleware to check if the logged-in user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params; // Get the listing and review IDs from the request parameters
    let review = await Review.findById(reviewId); // Find the review by ID
    if (!review) {
        req.flash("error", "Review not found!"); // Set an error message if the review is not found
        return res.redirect("/listings"); // Redirect to the listings page
    }
    // If the current user is not the author of the review
    if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You can't do any changes!"); // Set an error message
        return res.redirect(`/listings/${id}`); // Redirect to the specific listing page
    }
    next(); // Proceed to the next middleware or route handler
}

// Middleware to validate the listing data using Joi schema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // Validate the request body against the listing schema
  
    if (error) {
        // If there are validation errors, format the error messages
        let errMsg = error.details.map((ele) => ele.message).join(",");
        next(new ExpressError(400, errMsg)); // Pass the error to the custom error handler
    } else {
        next(); // If no errors, proceed to the next middleware or route handler
    }
}

// Middleware to validate the review data using Joi schema
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // Validate the request body against the review schema
  
    if (error) {
        // If there are validation errors, format the error messages
        let errMsg = error.details.map((ele) => ele.message).join(",");
        next(new ExpressError(400, errMsg)); // Pass the error to the custom error handler
    } else {
        next(); // If no errors, proceed to the next middleware or route handler
    }
}
