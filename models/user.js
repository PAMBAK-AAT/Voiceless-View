
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema( {
    email : {
        type : String , 
        required : true,
    },
})

userSchema.plugin(passportLocalMongoose); // Now It will add username , do hashing , do salting 
                                        // and also authentication by default..

module.exports = mongoose.model("User" , userSchema);
