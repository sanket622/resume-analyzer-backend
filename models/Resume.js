const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Resume content is required']
  },
  filePath: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'text'],
    default: 'text'
  },
  originalFileName: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);

