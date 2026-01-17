const mongoose = require("mongoose");
const Borrowal = require("../models/Borrowal");
const Book = require("../models/Book");

// 🔥 Utility: Calculate fine based on due date
const calculateFine = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const daysLate = today > due ? Math.ceil((today - due) / (1000 * 60 * 60 * 24)) : 0;
  return daysLate * 10; // ₹10 per day
};

/**
 * 📌 GET SINGLE BORROWAL
 */
const getBorrowal = async (req, res) => {
  try {
    const borrowal = await Borrowal.findById(req.params.id)
      .populate("memberId", "name email")
      .populate("bookId", "name");

    if (!borrowal)
      return res.status(404).json({ success: false, message: "Borrowal not found" });

    res.status(200).json({
      success: true,
      borrowal: {
        ...borrowal.toObject(),
        member: borrowal.memberId,
        book: borrowal.bookId,
        fineAmount: calculateFine(borrowal.dueDate)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
};

/**
 * 📌 GET ALL BORROWALS
 */
const getAllBorrowal = async (req, res) => {
  try {
    const borrowal = await Borrowal.find()
      .populate("memberId", "name email")
      .populate("bookId", "name");

    const formatted = borrowal.map((b) => ({
      ...b.toObject(),
      member: b.memberId,
      book: b.bookId,
      fineAmount: calculateFine(b.dueDate)
    }));

    res.status(200).json({ success: true, borrowalList: formatted });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
};

/**
 * 📌 ADD BORROWAL
 */
const addBorrowal = async (req, res) => {
  try {
    const newBorrowal = await Borrowal.create({
      ...req.body,
      memberId: mongoose.Types.ObjectId(req.body.memberId),
      bookId: mongoose.Types.ObjectId(req.body.bookId)
    });

    // Mark book unavailable
    await Book.findByIdAndUpdate(newBorrowal.bookId, { isAvailable: false });

    const populatedBorrowal = await Borrowal.findById(newBorrowal._id)
      .populate("memberId", "name email")
      .populate("bookId", "name");

    res.status(200).json({
      success: true,
      newBorrowal: {
        ...populatedBorrowal.toObject(),
        member: populatedBorrowal.memberId,
        book: populatedBorrowal.bookId,
        fineAmount: calculateFine(populatedBorrowal.dueDate)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
};

/**
 * 📌 UPDATE BORROWAL
 */
const updateBorrowal = async (req, res) => {
  try {
    const updatedBorrowal = await Borrowal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("memberId", "name email")
      .populate("bookId", "name");

    res.status(200).json({
      success: true,
      updatedBorrowal: {
        ...updatedBorrowal.toObject(),
        member: updatedBorrowal.memberId,
        book: updatedBorrowal.bookId,
        fineAmount: calculateFine(updatedBorrowal.dueDate)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
};

/**
 * 📌 DELETE BORROWAL
 */
const deleteBorrowal = async (req, res) => {
  try {
    const borrowal = await Borrowal.findByIdAndDelete(req.params.id);
    if (!borrowal)
      return res.status(404).json({ success: false, message: "Borrowal not found" });

    // Mark book available again
    await Book.findByIdAndUpdate(borrowal.bookId, { isAvailable: true });

    res.status(200).json({ success: true, deletedBorrowal: borrowal });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
};

/**
 * 💰 PAY FINE OFFLINE + GENERATE RECEIPT
 */
const payFineOffline = async (req, res) => {
  try {
    const receiptNumber = `RCPT-${Date.now()}`;
    const updatedBorrowal = await Borrowal.findByIdAndUpdate(
      req.params.id,
      {
        finePaid: true,
        paymentMode: "OFFLINE",
        receiptNumber,
        paidAt: new Date()
      },
      { new: true }
    )
      .populate("memberId", "name email")
      .populate("bookId", "name");

    res.status(200).json({
      success: true,
      borrowal: {
        ...updatedBorrowal.toObject(),
        member: updatedBorrowal.memberId,
        book: updatedBorrowal.bookId,
        fineAmount: calculateFine(updatedBorrowal.dueDate)
      },
      message: "Fine paid successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Payment failed", error });
  }
};

module.exports = {
  getBorrowal,
  getAllBorrowal,
  addBorrowal,
  updateBorrowal,
  deleteBorrowal,
  payFineOffline,
  calculateFine
};
