// To save our credentials
if (process.env.NODE_ENV != "production") {
  // If the environment is not production, load environment variables from the .env file
  require("dotenv").config();
}
// console.log(process.env.SECRET);

const express = require("express"); // Import Express framework
const app = express(); // Create an Express application
const mongoose = require("mongoose"); // Import Mongoose for MongoDB interaction
const path = require("path"); // Import path module for handling file paths
const methodOverride = require("method-override"); // Import method-override to support PUT/DELETE in forms
const ejsMate = require("ejs-mate"); // Import ejs-mate for enhanced EJS templates
const ExpressError = require("./utils/ExpressError.js"); // Import custom error handling class

const listingRouter = require("./routes/listing.js"); // Import listing routes
const reviewRouter = require("./routes/review.js"); // Import review routes
const userRouter = require("./routes/user.js"); // Import user routes

const session = require("express-session"); // Import express-session for session management
const MongoStore = require('connect-mongo'); // Import connect-mongo to store sessions in MongoDB
const flash = require("connect-flash"); // Import connect-flash for flash messages

// For authentication and password management
const passport = require("passport"); // Import Passport for authentication
const LocalStrategy = require("passport-local"); // Import Passport's local strategy for username/password authentication
const User = require("./models/user.js"); // Import User model

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// Now to deploy our database on cloud
const dbUrl = process.env.ATLASDB_URL; // Use MongoDB Atlas URL from environment variables

// Connect to the MongoDB database
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl); // Connect to MongoDB using the provided URL
}

app.set("view engine", "ejs"); // Set EJS as the template engine
app.set("views", path.join(__dirname, "views")); // Set the views directory for EJS templates
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies with URL-encoded payloads
app.use(methodOverride("_method")); // Override HTTP methods using a query parameter (_method)
app.engine("ejs", ejsMate); // Use ejs-mate as the engine for rendering EJS templates
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files from the public directory

//__dirname is a Node.js variable that gives the absolute path of the directory containing the currently executing file

// Configure session storage in MongoDB
const store = MongoStore.create({
  mongoUrl: dbUrl, // Use the MongoDB URL for session storage
  crypto: {
    secret: process.env.SECRET, // Use a secret key for session encryption
  },
  touchAfter: 24 * 3600, // Update session only once every 24 hours
});

// Handle errors in session store
store.on("error", () => {
  console.log("Error in Mongo Session Store", err);
});

// Session configuration options
const sessionOptions = { 
  store: store, // Use the MongoDB store for session data
  secret: process.env.SECRET, // Secret key for signing the session ID cookie
  resave: false, // Do not resave session if it hasn't been modified
  saveUninitialized: true, // Save new sessions that are uninitialized
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Set cookie expiration to 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000, // Set maximum age of the cookie to 7 days
    httpOnly: true, // Protect the cookie from being accessed by client-side scripts
  }
}

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions)); // Use the session middleware with the defined options
app.use(flash()); // Use the flash middleware for displaying flash messages

app.use(passport.initialize()); // Initialize Passport for authentication
app.use(passport.session()); // Use Passport session management

passport.use(new LocalStrategy(User.authenticate())); // Use Passport's local strategy with the User model's authentication method

// Serialize and deserialize user information for session management
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set flash messages and current user in response locals
app.use((req, res, next) => {
  res.locals.success = req.flash("success"); // Pass success messages to the response
  res.locals.error = req.flash("error"); // Pass error messages to the response
  res.locals.currUser = req.user; // Pass the current logged-in user to the response
  next(); // Proceed to the next middleware or route handler
})

// Route to create a fake user (for demonstration/testing purposes)
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "pam@gmail.com",
    username: "pam",
  });

  let registeredUser = await User.register(fakeUser, "@1234@"); // Register the fake user with a password
  res.send(registeredUser); // Send the registered user's details as a response
});

// Redirect root URL to /listings
app.get("/", (req, res) => {
  res.redirect("/listings");
})

// Route handling middleware for listings, reviews, and users
app.use("/listings", listingRouter); // All routes starting with /listings are handled by listingRouter
app.use("/listings/:id/reviews", reviewRouter); // All routes starting with /listings/:id/reviews are handled by reviewRouter
app.use("/", userRouter); // All routes starting with / are handled by userRouter

// Middleware to handle requests to non-existent routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found")); // Pass a 404 error to the error handler
})

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err; // Set default error status and message
  // res.status(statusCode).send(message);
  res.render("listings/error.ejs", { err }); // Render an error page with the error details
})

app.listen(8080, () => {
  console.log("server is listening to port 8080"); // Start the server on port 8080
});
