const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    courseCode: {
        type: String,
        required: [true, 'Course Code is required'],
        trim: true,
        uppercase: true
    },
    moduleName: {
        type: String,
        required: [true, 'Module Name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    fileType: {
        type: String,
        required: true,
        enum: ['PDF', 'DOCX', 'DOC', 'PPT', 'PPTX', 'OTHER'], // Accommodate common academic formats
        default: 'OTHER'
    },
    fileSize: {
        type: Number, // In bytes
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now until Auth is fully integrated, or if anonymous uploads are allowed (usually not, but safer to start loose)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', ResourceSchema);
