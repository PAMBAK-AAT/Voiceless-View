

const Joi = require("joi");

/// By these schema we validate  our form such that whenever any request 
/// come then it should have a listing object with tittle , description, price etc ,

const listingSchema = Joi.object({ 
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0),
        image: Joi.string().allow("",null),
    }).required(),
})


const reviewSchema = Joi.object( {
    review : Joi.object( {
        rating: Joi.number().min(1).max(5).required(),
        comment : Joi.string().required(),
    }).required(),
    
})

module.exports = {
    listingSchema,
    reviewSchema
}