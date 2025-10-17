const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Le livre est requis']
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'emprunteur est requis']
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['en cours', 'retourné', 'en retard'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'en cours'
  },
  fineAmount: {
    type: Number,
    default: 0,
    min: [0, 'Le montant de l\'amende ne peut pas être négatif']
  },
  renewalCount: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de renouvellements ne peut pas être négatif'],
    max: [2, 'Maximum 2 renouvellements autorisés']
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

loanSchema.virtual('daysOverdue').get(function() {
  if (this.status !== 'en retard') return 0;
  const today = new Date();
  const overdueDays = Math.floor((today - this.expectedReturnDate) / (1000 * 60 * 60 * 24));
  return overdueDays > 0 ? overdueDays : 0;
});

loanSchema.virtual('canRenew').get(function() {
  return this.renewalCount < 2 && this.status === 'en cours';
});

loanSchema.methods.calculateFine = function() {
  const FINE_PER_DAY = 0.50;
  if (this.status === 'retourné' && this.actualReturnDate > this.expectedReturnDate) {
    const daysLate = Math.floor((this.actualReturnDate - this.expectedReturnDate) / (1000 * 60 * 60 * 24));
    this.fineAmount = daysLate * FINE_PER_DAY;
  } else if (this.status === 'en retard') {
    const today = new Date();
    const daysLate = Math.floor((today - this.expectedReturnDate) / (1000 * 60 * 60 * 24));
    this.fineAmount = daysLate > 0 ? daysLate * FINE_PER_DAY : 0;
  }
  return this.fineAmount;
};

loanSchema.methods.renewLoan = async function() {
  if (this.renewalCount >= 2) {
    throw new Error('Nombre maximum de renouvellements atteint');
  }
  if (this.status !== 'en cours') {
    throw new Error('Seuls les emprunts en cours peuvent être renouvelés');
  }

  this.renewalCount += 1;
  const RENEWAL_DAYS = 14;
  this.expectedReturnDate = new Date(this.expectedReturnDate.getTime() + RENEWAL_DAYS * 24 * 60 * 60 * 1000);

  return this.save();
};

loanSchema.methods.returnBook = async function() {
  if (this.status === 'retourné') {
    throw new Error('Ce livre a déjà été retourné');
  }

  this.actualReturnDate = new Date();
  this.status = 'retourné';

  if (this.actualReturnDate > this.expectedReturnDate) {
    this.calculateFine();
  }

  return this.save();
};

loanSchema.statics.findOverdue = function() {
  const today = new Date();
  return this.find({
    status: 'en cours',
    expectedReturnDate: { $lt: today }
  }).populate('book borrower');
};

loanSchema.statics.findByUser = function(userId) {
  return this.find({ borrower: userId }).populate('book').sort({ borrowDate: -1 });
};

loanSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    borrower: userId,
    status: { $in: ['en cours', 'en retard'] }
  }).populate('book');
};

loanSchema.statics.findByBook = function(bookId) {
  return this.find({ book: bookId }).populate('borrower').sort({ borrowDate: -1 });
};

loanSchema.pre('save', function(next) {
  if (this.status === 'en cours') {
    const today = new Date();
    if (this.expectedReturnDate < today) {
      this.status = 'en retard';
      this.calculateFine();
    }
  }
  next();
});

loanSchema.post('save', async function(doc, next) {
  if (doc.status === 'en retard' && doc.fineAmount > 0) {
    const User = mongoose.model('User');
    const user = await User.findById(doc.borrower);
    if (user) {
      const currentFine = doc.fineAmount - (doc._previousFineAmount || 0);
      if (currentFine > 0) {
        await user.addFine(currentFine);
      }
    }
  }
  next();
});

loanSchema.index({ borrower: 1 });
loanSchema.index({ book: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ expectedReturnDate: 1 });
loanSchema.index({ borrowDate: -1 });

module.exports = mongoose.model('Loan', loanSchema);
