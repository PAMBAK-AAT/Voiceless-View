const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Now before inserting  , we will access all the listings object & then we add a owner field
  // Ensure each listing object has a geometry.type field
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '66601db9ab21fcccf49dae56',
    geometry: {
      type: (obj.geometry && obj.geometry.type) || "Point", // default to "Point" if type is not provided
      coordinates: (obj.geometry && obj.geometry.coordinates) || [0, 0] // default coordinates
    }
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();