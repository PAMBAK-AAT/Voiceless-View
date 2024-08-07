


const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const  {listingSchema , reviewSchema }  = require("./schema.js");


module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    // Assuming req.user contains the logged-in user's information
    res.locals.currUser = req.user;
    next();
}

                                    /// Summary--> Logged in
// The isLoggedin middleware function ensures that a user is authenticated before allowing them to proceed to the requested route. If the user is not authenticated:

// It saves the URL they were trying to access in the session.
// It sets an error flash message.
// It redirects them to the login page.
// If the user is authenticated:

// It makes the user's information available in the response locals (e.g., for use in templates).
// It calls next() to pass control to the next middleware function or route handler.


module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You can't do any changes!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id , reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect("/listings");
    }
    if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You can't do any changes!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


/// Middleware function for Schema validation...  /// Schema validation by joi...
module.exports.validateListing = (req ,res , next ) => {
    let {error} = listingSchema.validate(req.body);
  
    if(error){
      // If extra details are coming with our error..
      let errMsg = error.details.map( (ele) => ele.message).join(",");
      next (new ExpressError ( 400 , errMsg) );
    }
    else next();
  
}


module.exports.validateReview = (req ,res , next ) => {
    let {error} = reviewSchema.validate(req.body); // By reviewSchema we validate our req.body;
  
    if(error){
      // If extra details are coming with our error..
      let errMsg = error.details.map( (ele) => ele.message).join(",");
      next (new ExpressError ( 400 , errMsg) );
    }
    else next();
  
}
