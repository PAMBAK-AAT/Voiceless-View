
// To save our credentials
if(process.env.NODE_ENV != "production"){ // It means we will not send our .env file in our production stage ...
  require("dotenv").config();
}
// console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/REVIEW.JS");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

  /// For authentication and password...
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
      /// Now to deploy our databse on cloud..
const dbUrl = process.env.ATLASDB_URL;



main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate );
app.use(express.static(path.join(__dirname , "/public")));
//__dirname is a Node.js variable that gives the absolute path of the directory containing the currently executing file,


const store = MongoStore.create( {
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error" , () => {
  console.log("Error in Mongo Session Store" , err);
})

const sessionOptions = { // Now our session info. will store on our atlas database.

  store: store,
  secret : process.env.SECRET,
  resave: false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true, // Defence from cross-crypting attacks 
  }
}

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy( User.authenticate() ));

// To remove or add the info.  of user when a session is created or terminated...
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

app.use( (req , res , next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

/// Logic to create a fake user...
app.get("/demouser" , async (req , res) => {
  let fakeUser = new User({
    email: "pam@gmail.com",
    username: "pam",
  });

  let registeredUser = await User.register( fakeUser , "@1234@");
  res.send(registeredUser);

});

app.get("/" , (req , res) => {
  res.redirect("/listings");
})
      ///  Arrange listings request
      app.use("/listings" , listingRouter); // it means jitne bhii req. hamare server ke paas aaeigii with /listings , we do it's mapping in listings file that is present in routes folder...
      app.use("/listings/:id/reviews" , reviewRouter);
      app.use("/" , userRouter);
        

        /// if our user send request to our server to any route that is not exist then this middleware will handle the error...
app.all("*" , (req , res , next) => {
  next( new ExpressError( 404 , "Page not found "));
})

        /// Error handling middleware
app.use( (err , req , res , next) => {
  let { statusCode=500 , message="Something went wrong !" } = err;
  // res.status(statusCode).send(message);
  res.render("listings/error.ejs" , { err });
})

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});