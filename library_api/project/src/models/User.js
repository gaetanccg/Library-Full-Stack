const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email invalide'
    }
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['étudiant', 'professeur', 'bibliothécaire', 'admin'],
      message: '{VALUE} n\'est pas un rôle valide'
    },
    default: 'étudiant'
  },
  status: {
    type: String,
    enum: {
      values: ['actif', 'suspendu', 'supprimé'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'actif'
  },
  borrowHistory: [{
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan'
    },
    borrowDate: Date,
    returnDate: Date
  }],
  currentFines: {
    type: Number,
    default: 0,
    min: [0, 'Les amendes ne peuvent pas être négatives']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  refreshToken: {
    type: String,
    select: false
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

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('canBorrow').get(function() {
  return this.status === 'actif' && this.currentFines === 0;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addFine = function(amount) {
  this.currentFines += amount;
  return this.save();
};

userSchema.methods.payFine = function(amount) {
  if (amount > this.currentFines) {
    throw new Error('Le montant dépasse les amendes dues');
  }
  this.currentFines -= amount;
  return this.save();
};

userSchema.methods.addToBorrowHistory = function(loanId, borrowDate, returnDate = null) {
  this.borrowHistory.push({
    loan: loanId,
    borrowDate,
    returnDate
  });
  return this.save();
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, status: 'actif' });
};

userSchema.statics.findWithFines = function() {
  return this.find({ currentFines: { $gt: 0 }, status: 'actif' });
};

userSchema.statics.findActive = function() {
  return this.find({ status: 'actif' });
};

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ currentFines: 1 });

module.exports = mongoose.model('User', userSchema);
