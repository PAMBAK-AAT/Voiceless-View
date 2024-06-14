
const Listing = require("../models/listing");
const Review = require("../models/review.js");
//  For Mapping
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Home page
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

// New Form page
module.exports.newForm = (req, res) => {
    res.render("listings/new.ejs");
}

// Create new Listing
module.exports.createNewForm = async (req , res , next) => {
  
    // if(!req.body.listing){
    //   throw  new ExpressError( 400  , "Enter valid data !");
    // }

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1, // It tells how many possible longitude & latitude we can get at any particular location
    })
    .send()


    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url , "..." , filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url , filename };

    newListing.geometry = response.body.features[0].geometry; // To save coordinates of our location

    let savedListing = await newListing.save();
    console.log(savedListing); // Thus here we saved our location in our database...

    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");
  
}

// Show new listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews" , populate: {path: "author"} } ).populate("owner");

    if(!listing){
      req.flash("error" , "Your Listing does not exist!");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

// Edit the listing...
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error" , "Your listing does not exist!");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_200,h_200");
    res.render("listings/edit.ejs", { listing , originalImageUrl});
}

// Update Listing...

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  if (!req.body.listing) { 
      throw new ExpressError(400, "Enter valid data!");
  }

  // Find the listing to be updated
  let listing = await Listing.findById(id);

  // If a new image is uploaded, update the image field
  if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
  }

  // Update other fields of the listing
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.country = req.body.listing.country;
  listing.location = req.body.listing.location;

  // Save the updated listing
  await listing.save();

  req.flash("success", "Previous Listing Updated!");
  res.redirect(`/listings/${id}`);
}

// Destroy Listing...
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , " Listing deleted!");
    res.redirect("/listings");
}