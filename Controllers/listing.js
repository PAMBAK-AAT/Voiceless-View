const Listing = require("../models/listing"); // Import the Listing model
const Review = require("../models/review.js"); // Import the Review model

// For Mapping using Mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.TOKEN; // Access the Mapbox token from environment variables
const geocodingClient = mbxGeocoding({ accessToken: mapToken }); // Initialize the Mapbox geocoding client

// Controller for the home page that displays all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({}); // Fetch all listings from the database
    res.render("listings/index.ejs", { allListings }); // Render the listings page with all listings data
}

// Controller to render the form for creating a new listing
module.exports.newForm = (req, res) => {
    res.render("listings/new.ejs"); // Render the form for creating a new listing
}

// Controller to create a new listing
module.exports.createNewForm = async (req, res, next) => {
  
    // Geocode the location provided by the user
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location, // The location provided by the user
        limit: 1, // Limit the results to 1
    }).send();

    let url = req.file.path; // Get the URL of the uploaded image
    let filename = req.file.filename; // Get the filename of the uploaded image
    console.log(url, "...", filename);

    const newListing = new Listing(req.body.listing); // Create a new listing with the provided data
    newListing.owner = req.user._id; // Set the owner of the listing to the current user
    newListing.image = { url, filename }; // Set the image for the listing

    newListing.geometry = response.body.features[0].geometry; // Save the geocoded coordinates in the listing

    let savedListing = await newListing.save(); // Save the new listing to the database
    console.log(savedListing); // Log the saved listing

    req.flash("success", "New Listing Created!"); // Flash a success message
    res.redirect("/listings"); // Redirect to the listings page
}

// Controller to show a specific listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    // The reviews field is populated with full Review documents instead of just ObjectId references.
    // Within each Review, the author field is populated with the corresponding User document.
    // The owner field is populated with the full User document.
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } }) // Populate the reviews and their authors
        .populate("owner"); // Populate the owner of the listing

    if (!listing) {
        req.flash("error", "Your Listing does not exist!"); // Flash an error message if the listing does not exist
        return res.redirect("/listings"); // Redirect to the listings page
    }
    res.render("listings/show.ejs", { listing }); // Render the show page with the listing data
}

// Controller to render the form for editing a listing
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id); // Find the listing to be edited

    if (!listing) {
        req.flash("error", "Your listing does not exist!"); // Flash an error message if the listing does not exist
        return res.redirect("/listings"); // Redirect to the listings page
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200,h_200"); // Adjust image size for the edit form
    res.render("listings/edit.ejs", { listing, originalImageUrl }); // Render the edit form with the listing data and image
}

// Controller to update a listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    if (!req.body.listing) { 
        throw new ExpressError(400, "Enter valid data!"); // Throw an error if the listing data is invalid
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
    listing.country = req.body.listing.country;
    listing.location = req.body.listing.location;

    // Save the updated listing
    await listing.save();

    req.flash("success", "Previous Listing Updated!"); // Flash a success message
    res.redirect(`/listings/${id}`); // Redirect to the updated listing's page
}

// Controller to delete a listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id); // Find and delete the listing by ID
    console.log(deletedListing);
    req.flash("success", "Listing deleted!"); // Flash a success message
    res.redirect("/listings"); // Redirect to the listings page
}
