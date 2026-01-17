const mongoose = require("mongoose");

/**
 * 🔢 Fine calculation utility
 * ₹10 per day after due date
 */
// const calculateFineAmount = (dueDate) => {
//   const today = new Date();
//   const due = new Date(dueDate);

//   if (today <= due) return 0;

//   const daysLate = Math.ceil(
//     (today - due) / (1000 * 60 * 60 * 24)
//   );

//   return daysLate * 10;
// };

const fineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },

    dueDate: {
      type: Date,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },

    paymentId: {
      type: String,
      default: null
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

/**
 * 🔥 AUTO CALCULATE FINE BEFORE SAVE
 */
fineSchema.pre("validate", function (next) {
  if (!this.amount && this.dueDate) {
    this.amount = calculateFineAmount(this.dueDate);
  }
  next();
});

/**
 * 🔁 INSTANCE METHOD (Optional usage)
 */
fineSchema.methods.recalculateFine = function () {
  this.amount = calculateFineAmount(this.dueDate);
  return this.amount;
};

module.exports = mongoose.model("Fine", fineSchema);
