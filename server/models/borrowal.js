const mongoose = require("mongoose");

const borrowalSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  borrowedDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["Issued", "Returned"], default: "Issued" },
  fineAmount: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  paymentMode: { type: String, enum: ["OFFLINE"], default: "OFFLINE" },
  receiptNumber: { type: String, default: null },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Borrowal", borrowalSchema);
