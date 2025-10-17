const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management API',
      version: '1.0.0',
      description: 'API REST complète pour la gestion d\'une bibliothèque avec Node.js, Express et MongoDB',
      contact: {
        name: 'API Support'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur'
            },
            role: {
              type: 'string',
              enum: ['étudiant', 'professeur', 'bibliothécaire', 'admin'],
              default: 'étudiant',
              description: 'Rôle de l\'utilisateur'
            },
            accountStatus: {
              type: 'string',
              enum: ['actif', 'suspendu', 'supprimé'],
              default: 'actif',
              description: 'Statut du compte'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string', default: 'France' }
              }
            },
            currentBorrowedBooks: {
              type: 'number',
              default: 0,
              description: 'Nombre de livres actuellement empruntés'
            },
            totalFines: {
              type: 'number',
              default: 0,
              description: 'Total des amendes'
            },
            paidFines: {
              type: 'number',
              default: 0,
              description: 'Amendes payées'
            }
          }
        },
        Book: {
          type: 'object',
          required: ['isbn', 'title', 'totalCopies', 'availableCopies'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du livre'
            },
            isbn: {
              type: 'string',
              description: 'Numéro ISBN du livre'
            },
            title: {
              type: 'string',
              description: 'Titre du livre'
            },
            subtitle: {
              type: 'string',
              description: 'Sous-titre du livre'
            },
            authors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Liste des auteurs'
            },
            categories: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['Roman', 'Science', 'Informatique', 'Histoire', 'Philosophie', 'Art', 'Biographie', 'Poésie', 'Théâtre', 'Jeunesse', 'Bande Dessinée', 'Sciences Humaines', 'Droit', 'Économie', 'Autre']
              },
              description: 'Catégories du livre'
            },
            totalCopies: {
              type: 'number',
              minimum: 0,
              description: 'Nombre total d\'exemplaires'
            },
            availableCopies: {
              type: 'number',
              minimum: 0,
              description: 'Nombre d\'exemplaires disponibles'
            },
            publicationDate: {
              type: 'string',
              format: 'date',
              description: 'Date de publication'
            },
            publisher: {
              type: 'string',
              description: 'Éditeur'
            },
            pages: {
              type: 'number',
              minimum: 1,
              description: 'Nombre de pages'
            },
            language: {
              type: 'string',
              default: 'Français',
              description: 'Langue du livre'
            },
            summary: {
              type: 'string',
              maxLength: 2000,
              description: 'Résumé du livre'
            },
            coverImage: {
              type: 'string',
              description: 'URL de l\'image de couverture'
            }
          }
        },
        Loan: {
          type: 'object',
          required: ['user', 'book'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'emprunt'
            },
            user: {
              type: 'string',
              description: 'ID de l\'utilisateur'
            },
            book: {
              type: 'string',
              description: 'ID du livre'
            },
            borrowDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'emprunt'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de retour prévue'
            },
            returnDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de retour effective'
            },
            status: {
              type: 'string',
              enum: ['actif', 'retourné', 'perdu'],
              default: 'actif',
              description: 'Statut de l\'emprunt'
            },
            renewCount: {
              type: 'number',
              default: 0,
              description: 'Nombre de renouvellements'
            },
            fine: {
              type: 'number',
              default: 0,
              description: 'Montant de l\'amende'
            },
            isPaid: {
              type: 'boolean',
              default: false,
              description: 'Amende payée ou non'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Message de succès'
            },
            data: {
              type: 'object',
              description: 'Données retournées'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token d\'authentification manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès interdit - permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification'
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs'
      },
      {
        name: 'Books',
        description: 'Gestion des livres'
      },
      {
        name: 'Loans',
        description: 'Gestion des emprunts'
      },
      {
        name: 'Statistics',
        description: 'Statistiques et rapports'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
