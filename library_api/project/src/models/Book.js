const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: [true, 'L\'ISBN est requis'],
        unique: true,
        validate: {
            validator: function(v) {
                return /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
            },
            message: 'Format ISBN invalide'
        }
    },
    title: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    authors: [{
        type: String,
        trim: true
    }],
    categories: [{
        type: String,
        enum: {
            values: ['Roman', 'Science', 'Informatique', 'Histoire', 'Philosophie', 'Art', 'Biographie', 'Poésie', 'Théâtre', 'Jeunesse', 'Bande Dessinée', 'Sciences Humaines', 'Droit', 'Économie', 'Autre'],
            message: '{VALUE} n\'est pas une catégorie valide'
        }
    }],
    totalCopies: {
        type: Number,
        required: true,
        min: [0, 'Le nombre d\'exemplaires ne peut pas être négatif'],
        default: 1
    },
    availableCopies: {
        type: Number,
        required: true,
        min: [0, 'Le nombre d\'exemplaires disponibles ne peut pas être négatif'],
        default: 1,
        validate: {
            validator: function(value) {
                return value <= this.totalCopies;
            },
            message: 'Le nombre d\'exemplaires disponibles ne peut pas dépasser le total'
        }
    },
    publicationDate: {
        type: Date
    },
    publisher: {
        type: String,
        trim: true
    },
    pages: {
        type: Number,
        min: [1, 'Le nombre de pages doit être au moins 1']
    },
    language: {
        type: String,
        default: 'Français',
        trim: true
    },
    summary: {
        type: String,
        maxlength: [2000, 'Le résumé ne peut pas dépasser 2000 caractères'],
        trim: true
    },
    coverImage: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
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

bookSchema.index({ title: 'text', summary: 'text' }, { default_language: 'french' });
bookSchema.index({ categories: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ availableCopies: 1 });

bookSchema.virtual('isAvailable').get(function() {
    return this.availableCopies > 0;
});

bookSchema.virtual('borrowRate').get(function() {
    if (this.totalCopies === 0) return 0;
    return ((this.totalCopies - this.availableCopies) / this.totalCopies * 100).toFixed(2);
});

bookSchema.methods.borrowCopy = async function() {
    if (this.availableCopies <= 0) {
        throw new Error('Aucun exemplaire disponible');
    }
    this.availableCopies -= 1;
    return this.save();
};

bookSchema.methods.returnCopy = async function() {
    if (this.availableCopies >= this.totalCopies) {
        throw new Error('Tous les exemplaires sont déjà disponibles');
    }
    this.availableCopies += 1;
    return this.save();
};

bookSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
};

bookSchema.statics.searchBooks = function(query) {
    return this.find(
        {
            $text: { $search: query },
            isDeleted: false
        },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

bookSchema.statics.findAvailable = function() {
    return this.find({ availableCopies: { $gt: 0 }, isDeleted: false });
};

bookSchema.statics.findByCategory = function(category) {
    return this.find({ categories: category, isDeleted: false });
};

bookSchema.pre('save', function(next) {
    if (this.isModified('totalCopies') && this.availableCopies > this.totalCopies) {
        this.availableCopies = this.totalCopies;
    }
    next();
});

module.exports = mongoose.model('Book', bookSchema);
