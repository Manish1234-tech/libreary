const mongoose = require('mongoose')

const calculateFine = (dueDate) => {
  if (!dueDate) return 0;

  const today = new Date();
  const due = new Date(dueDate);

  if (today <= due) return 0;

  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const finePerDay = 10; // change if needed
  return diffDays * finePerDay;
};

module.exports = { calculateFine };
