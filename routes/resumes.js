const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { parsePDF, parseDOCX, parseTextFile } = require('../utils/fileParser');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
(async () => {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
})();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create resume (upload file or paste text)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Resume title is required' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Either resume content or file must be provided' });
    }

    let resumeContent = content;
    let filePath = null;
    let fileType = 'text';
    let originalFileName = null;

    if (req.file) {
      filePath = req.file.path;
      originalFileName = req.file.originalname;
      const ext = path.extname(req.file.originalname).toLowerCase();

      if (ext === '.pdf') {
        resumeContent = await parsePDF(filePath);
        fileType = 'pdf';
      } else if (ext === '.docx' || ext === '.doc') {
        resumeContent = await parseDOCX(filePath);
        fileType = 'docx';
      } else if (ext === '.txt') {
        resumeContent = await parseTextFile(filePath);
        fileType = 'text';
      }
    }

    if (!resumeContent || resumeContent.trim().length === 0) {
      return res.status(400).json({ message: 'Resume content is empty' });
    }

    const resume = new Resume({
      userId: req.user._id,
      title,
      content: resumeContent,
      filePath,
      fileType,
      originalFileName
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume created successfully',
      resume: {
        id: resume._id,
        title: resume.title,
        fileType: resume.fileType,
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Handle file upload
router.post('/upload', auth, upload.single('file'), (req, res, next) => {
  // This route is just for file upload handling
  // The actual resume creation should be done in the POST / route
  next();
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let content = '';

    if (ext === '.pdf') {
      content = await parsePDF(req.file.path);
    } else if (ext === '.docx' || ext === '.doc') {
      content = await parseDOCX(req.file.path);
    } else if (ext === '.txt') {
      content = await parseTextFile(req.file.path);
    }

    res.json({
      message: 'File uploaded and parsed successfully',
      content,
      fileName: req.file.originalname,
      filePath: req.file.path
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all resumes for user
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('title fileType createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single resume
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete resume
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file if exists
    if (resume.filePath) {
      try {
        await fs.unlink(resume.filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await Resume.deleteOne({ _id: resume._id });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

