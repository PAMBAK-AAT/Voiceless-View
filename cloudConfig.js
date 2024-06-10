

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// here we pass our configuration details , Here we join our backend to our cloudinary account...

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

// By this we tell in which folder of our cloudinary account we save our folder

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormat: ["pdf","png","jpg","jpeg"],
    },
});

module.exports = {
    cloudinary,
    storage,
}


                                    /// Summary...
// Load Required Libraries: You load Cloudinary and a special Multer storage engine that works with Cloudinary.

// Configure Cloudinary: You set up your Cloudinary account details so it knows which account to use.

// Set Up Storage: You create a new storage configuration that tells Multer to store uploaded files
// in a specific folder in your Cloudinary account and only allows certain file types.

// This setup lets you handle file uploads in your Node.js application, storing them directly in Cloudinary,
// which is a cloud storage service. This is useful for web applications that need to manage user-uploaded images,
// videos, or other files.
            
                            
                            
                            
                            
                            
                            