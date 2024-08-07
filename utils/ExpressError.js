



class ExpressError extends Error {
    constructor(statusCode, message) {
        super(); // Call the parent class (Error) constructor
        this.statusCode = statusCode; // Set the status code for the error
        this.message = message; // Set the error message
    }
}

module.exports = ExpressError;