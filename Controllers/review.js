
const Listing = require("../models/listing");
const Review = require("../models/review");



module.exports.createReview = async (req , res) => {
    let listing = await Listing.findById(req.params.id);
    if(!listing){
      res.status(400).send("Listing not exist");
    }
  
    let newReview = new Review(req.body.review); // Here review object kaa comment and rating store in newReview...
    newReview.author = req.user._id;
    console.log(newReview);
    await newReview.save();
  
    listing.reviews.push(newReview); // Here reviews -> it is the array of listings
    await listing.save();

    req.flash("success" , "New Review Created!");
  
    res.redirect(`/listings/${listing._id}`);
  
}

module.exports.destroyReview = async (req , res) => {
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate( id , { $pull : {reviews : reviewId } }); // reviews array mein se jo bhii reviewid se match karegaa use pill karenge
    await Review.findByIdAndDelete(reviewId);

    req.flash("success" , "Previous Review Deleted!");

    res.redirect(`/listings/${id}`);
}