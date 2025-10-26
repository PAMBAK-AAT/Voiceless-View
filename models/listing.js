
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require("./review.js"); // Add this line

// Define the Listing schema
const ListingSchema = new mongoose.Schema({

    title: { type: String, required: true },
    description: { type: String },
    image: {
        url:String,
        filename: String,
    },
    location: { type: String },
    country: { type: String },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref : "Review", // This is Model name
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});


/// This is a post middleware that runs when we delete a listing and it helps to delete all reviews associated with this listing in review model
ListingSchema.post("findOneAndDelete" , async(listing) => { // listing -> the listing that we deleted
    if(listing){
        await Review.deleteMany({_id : { $in : listing.reviews}});
    }

})
// Create and export the Listing model
const Listing = mongoose.model('Listing', ListingSchema);

module.exports = Listing;
