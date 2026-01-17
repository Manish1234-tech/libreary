const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  genreId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
   category: {
      type: String,
      enum: [
        "Science",
        "Fiction",
        "Mathematics",
        "History",
        "Technology",
        "Biography",
        "Literature",
        "Other"
      ],
      required: true,
      default: "Other"
    },
    

  isAvailable: {
    type: Boolean,
    required: true
  },
  summary: {
    type: String,
    required: false
  },
   issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    issuedAt: {
      type: Date,
      default: null
    },
    
  

  photoUrl: {
    type: String,
    required: false
  }
  
}, 
 { timestamps: true });

module.exports = mongoose.model('Book', bookSchema)
