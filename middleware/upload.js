const multer = require("multer");
const sharp = require("sharp");

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB maximum original image
    },

    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed."));
        }
    }
});


async function processImage(req, res, next) {
    try {

        if (!req.file) {
            return next();
        }

        const processedImage = await sharp(req.file.buffer)
            .resize({
                width: 1200,
                height: 1200,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({
                quality: 75
            })
            .toBuffer();

        // Replace original buffer with compressed WebP buffer
        req.file.buffer = processedImage;

        next();

    } catch (error) {
        next(error);
    }
}


module.exports = {
    upload,
    processImage
};