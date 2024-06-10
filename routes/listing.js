
const express = require("express");
const router =  express.Router( {mergeParams : true} ); // By this we merge or add any id parameter of parent route 
  //in app.js to it's child route in review.js
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const  {listingSchema , reviewSchema }  = require("../schema.js");

/// Package to convert multipart/form-data into url encoded form...
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
// const upload = multer( {dest: 'uploads/'}); // It extract the file and save it in the folder name--> 'uploads'
const upload = multer( { storage }); // But now multer save our file in the cloud storage

// Middleware for checking isLogged in or not
const { isLoggedin, isOwner , saveRedirectUrl , validateListing } = require("../middleware.js");

/// For Controllers...
const listingController = require("../Controllers/listing.js");


                /// Here we convert our(  /listings -> / )

                /// More complex way to write our routes...

router.route("/")
  .get(  wrapAsync (listingController.index))
  .post( isLoggedin ,
     upload.single('listing[image]') ,  // Here multer process our image data and send it in the req.file...
     validateListing ,
     wrapAsync(listingController.createNewForm)
    );
  
//New Route
router.get("/new", isLoggedin , listingController.newForm);

router.route("/:id")
  .get( isLoggedin , wrapAsync(listingController.showListing))
  .put( 
    isLoggedin ,
    isOwner ,
    upload.single('listing[image]') ,  // Here multer process our image data and send it in the req.file...
    validateListing,
    wrapAsync(listingController.updateListing))
  .delete( isLoggedin , isOwner , wrapAsync(listingController.deleteListing));
  
//Edit Route
router.get("/:id/edit", isLoggedin , isOwner , wrapAsync(listingController.renderEditForm));

module.exports = router;

/////////////////////////////////   Alternative Approach...

//     //Index Route
// router.get("/",  wrapAsync (listingController.index));
  
//   //New Route
// router.get("/new", isLoggedin , listingController.newForm);
  
//   //Show Route
// router.get("/:id", isLoggedin , wrapAsync(listingController.showListing));
  
//   //Create Route
// router.post("/", isLoggedin , validateListing , wrapAsync(listingController.createNewForm));
  
//   //Edit Route
// router.get("/:id/edit", isLoggedin , isOwner , wrapAsync(listingController.renderEditForm));
  
//   //Update Route
// router.put("/:id",isLoggedin , isOwner , wrapAsync(listingController.updateListing));
  
//   //Delete Route
// router.delete("/:id", isLoggedin , isOwner , wrapAsync(listingController.deleteListing));

// module.exports = router;