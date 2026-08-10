const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB original limit
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

        const filename = `${Date.now()}.webp`;
        const outputPath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize({
                width: 1200,
                height: 1200,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({
                quality: 75
            })
            .toFile(outputPath);

        req.file.filename = filename;

        next();

    } catch (error) {
        next(error);
    }
}

module.exports = {
    upload,
    processImage
};