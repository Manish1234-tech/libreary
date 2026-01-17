// Import required modules
const express = require("express")
const router = express.Router();

// Import functions from controller
const {
    getBook,
    getAllBooks,
    addBook,
    updateBook,
    deleteBook,
    getBooksByCategory,
    getBooksByStatus
} = require('../controllers/bookController')

router.get("/getAll", (req, res) => getAllBooks(req,res))   

router.get("/get/:id", (req, res) => getBook(req, res))

router.post("/add", (req, res) => addBook(req, res))

router.put("/update/:id", (req, res) => updateBook(req, res))

router.delete("/delete/:id", (req, res) => deleteBook(req, res))

router.get("/category/:category", (req, res) => getBooksByCategory(req, res))

router.get("/status/:status", (req, res) => getBooksByStatus(req, res))

module.exports = router;
