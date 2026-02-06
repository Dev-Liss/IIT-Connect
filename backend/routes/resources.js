const express = require('express');
const router = express.Router();
const multer = require('multer');
const Resource = require('../models/Resource');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// POST /upload: Upload a file and save resource details
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { title, courseCode, moduleName, description, uploadedBy } = req.body;

        // fileType determination logic if not explicitly sent, or trust extension
        const fileExtension = req.file.originalname.split('.').pop().toUpperCase();
        let fileType = 'OTHER';
        if (['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX'].includes(fileExtension)) {
            fileType = fileExtension;
        }

        const newResource = new Resource({
            title,
            courseCode,
            moduleName,
            description,
            fileUrl: req.file.path, // Cloudinary URL
            fileType: fileType,
            fileSize: req.file.size,
            uploadedBy: uploadedBy || null // Handle optional user for now
        });

        await newResource.save();

        res.status(201).json({
            success: true,
            message: 'Resource uploaded successfully',
            data: newResource
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during upload', error: error.message });
    }
});

// GET /all: Fetch all resources, newest first
router.get('/all', async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching resources', error: error.message });
    }
});

// GET /search: Search by title or courseCode
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        // Regex for partial match, case insensitive
        const searchRegex = new RegExp(query, 'i');

        const resources = await Resource.find({
            $or: [
                { title: searchRegex },
                { courseCode: searchRegex },
                { moduleName: searchRegex } // Included moduleName as it's useful
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during search', error: error.message });
    }
});

module.exports = router;
