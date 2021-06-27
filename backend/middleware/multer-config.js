// importation de multer pour la gestion des fichiers
const multer = require('multer');

// Mime types potentiels des fichiers reçus
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};


// objet de configuration pour multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // null = pas d'erreur
  },
  filename: (req, file, callback) => {
    // on récupère le nom original, on remplace les espaces par des _
    const name = file.originalname.split(' ').join('_');
    // on crée l'extension grâce aux MIME_TYPES définis
    const extension = MIME_TYPES[file.mimetype];
    // on crée le filename en ajoutant aussi un timestamp
    callback(null, name + Date.now() + '.' + extension);
  }
});

// export du middleware multer configuré
module.exports = multer({storage: storage}).single('image');