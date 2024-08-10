const express = require("express");
const router = express.Router({ mergeParams: true }); 
// By setting mergeParams to true, we ensure that any parameters from the parent route (defined in app.js) 
// are accessible in this router, such as the listing ID.

const wrapAsync = require("../utils/wrapAsync.js"); // Utility to wrap async functions for error handling
const Listing = require("../models/listing.js"); // Import the Listing model
const Review = require("../models/review.js"); // Import the Review model
const ExpressError = require("../utils/ExpressError.js"); // Custom error handling class
const { listingSchema, reviewSchema } = require("../schema.js"); // Import validation schemas for listings and reviews

// Package to handle multipart/form-data (for file uploads)
const multer = require('multer');
const { storage } = require("../cloudConfig.js"); // Import cloud storage configuration for file uploads
// const upload = multer( {dest: 'uploads/'}); // This would save files locally in an 'uploads' folder
const upload = multer({ storage }); // Now multer saves our files in the configured cloud storage

// Middleware for checking if the user is logged in, is the owner, saving redirect URL, and validating listings
const { isLoggedin, isOwner, saveRedirectUrl, validateListing } = require("../middleware.js");

// Import controllers for listings
const listingController = require("../Controllers/listing.js");

// Define routes for handling listing-related requests

// For the root route "/listings" (handled as "/")
router.route("/")
  .get(wrapAsync(listingController.index)) 
  // GET request to show all listings
  .post(isLoggedin, 
    upload.single('listing[image]'), // Multer processes the uploaded image and sends it in req.file
    validateListing, // Validate the listing data
    wrapAsync(listingController.createNewForm)
  ); // POST request to create a new listing

// Route for showing the form to create a new listing
router.get("/new", isLoggedin, listingController.newForm);

// For the "/listings/:id" route
router.route("/:id")
  .get(isLoggedin, wrapAsync(listingController.showListing)) 
  // GET request to show a specific listing by ID
  .put(
    isLoggedin, 
    isOwner, 
    upload.single('listing[image]'), // Multer processes the uploaded image and sends it in req.file
    validateListing, // Validate the listing data
    wrapAsync(listingController.updateListing)
  ) // PUT request to update a specific listing by ID
  .delete(isLoggedin, isOwner, wrapAsync(listingController.deleteListing)); 
  // DELETE request to remove a specific listing by ID

// Route for showing the form to edit a specific listing by ID
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router; // Export the router to be used in the main app
