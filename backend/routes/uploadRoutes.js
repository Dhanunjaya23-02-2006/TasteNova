const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup multer storage
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'tastenova', // Optional - change to your desired folder name
            allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
        },
    });
} else {
    // Fallback to local storage if Cloudinary is not configured
    storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        }
    });
}

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|pdf/; // Added pdf for documents
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images and PDFs only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    let fileUrl = req.file.path;
    
    // If it's local storage, format the path correctly
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    res.send({
        message: 'File Uploaded',
        url: fileUrl
    });
});

module.exports = router;
