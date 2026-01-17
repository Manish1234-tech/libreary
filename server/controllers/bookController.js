const Book = require("../models/Book");
const mongoose = require('mongoose')


const getBook = async (req, res) => {
  const bookId = req.params.id;

  Book.findById(bookId, (err, book) => {
    if (err) {
      return res.status(400).json({success: false, err});
    }

    return res.status(200).json({
      success: true,
      book
    });
  });
}

const getAllBooks = async (req, res) => {
  Book.aggregate([{
    $lookup: {
      from: "authors",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    },
  },
    {
      $unwind: "$author"
    },
    {
      $lookup: {
        from: "genres",
        localField: "genreId",
        foreignField: "_id",
        as: "genre"
      },

    },
    {
      $unwind: "$genre"
    },]).exec((err, books) => {
    if (err) {
      return res.status(400).json({success: false, err});
    }

    return res.status(200).json({
      success: true,
      booksList: books
    });
  });
}

const addBook = async (req, res) => {
  const newBook = {
    ...req.body,
    genreId: mongoose.Types.ObjectId(req.body.genreId),
    authorId: mongoose.Types.ObjectId(req.body.authorId)
  }
  console.log(newBook)
  Book.create(newBook, (err, book) => {
    if (err) {
      return res.status(400).json({success: false, err});
    }

    return res.status(200).json({
      success: true,
      newBook: book
    });
  })
}

const updateBook = async (req, res) => {
  const bookId = req.params.id
  const updatedBook = req.body

  Book.findByIdAndUpdate(bookId, updatedBook, (err, book) => {
    if (err) {
      return res.status(400).json({success: false, err});
    }

    return res.status(200).json({
      success: true,
      updatedBook: book
    });
  })
}

const deleteBook = async (req, res) => {
  const bookId = req.params.id

  Book.findByIdAndDelete(bookId, (err, book) => {
    if (err) {
      return res.status(400).json({success: false, err});
    }

    return res.status(200).json({
      success: true,
      deletedBook: book
    });
  })
}
const getBooksByCategory = async (req, res) => {
  const books = await Book.find({ category: req.params.category })
    .populate("author genre");

  res.json({ books });
};

 const getBooksByStatus = async (req, res) => {
  const isAvailable = req.params.status === "available";

  const books = await Book.find({ isAvailable })
    .populate("author genre");

  res.json({ books });
};


module.exports = {
  getBook,
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  getBooksByCategory,
  getBooksByStatus
}
