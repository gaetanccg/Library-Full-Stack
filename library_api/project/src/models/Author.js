const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  biography: {
    type: String,
    maxlength: [1000, 'La biographie ne peut pas dépasser 1000 caractères'],
    trim: true
  },
  birthDate: {
    type: Date
  },
  deathDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value || !this.birthDate) return true;
        return value > this.birthDate;
      },
      message: 'La date de décès doit être postérieure à la date de naissance'
    }
  },
  nationality: {
    type: String,
    trim: true
  },
  literaryPrizes: [{
    name: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },
    category: String
  }],
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

authorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

authorSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const endDate = this.deathDate || new Date();
  return Math.floor((endDate - this.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
});

authorSchema.methods.addPrize = function(prizeName, year, category) {
  this.literaryPrizes.push({ name: prizeName, year, category });
  return this.save();
};

authorSchema.statics.findByNationality = function(nationality) {
  return this.find({ nationality: new RegExp(nationality, 'i') });
};

authorSchema.statics.getPrizeWinners = function() {
  return this.find({ 'literaryPrizes.0': { $exists: true } });
};

authorSchema.index({ firstName: 1, lastName: 1 });
authorSchema.index({ nationality: 1 });

module.exports = mongoose.model('Author', authorSchema);
