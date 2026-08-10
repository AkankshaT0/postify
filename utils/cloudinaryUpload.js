const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "postify",
                resource_type: "image"
            },

            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }
        );

        uploadStream.end(buffer);
    });
}

module.exports = uploadToCloudinary;