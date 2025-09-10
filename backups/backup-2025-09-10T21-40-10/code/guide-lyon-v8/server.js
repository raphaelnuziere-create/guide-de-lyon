const express = require('express');
const path = require('path');
const app = express();

// Configuration
const PORT = process.env.PORT || 8006;

// Middleware pour servir les fichiers statiques
app.use(express.static(__dirname));

// API routes
app.use('/api', express.static(path.join(__dirname, 'api')));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Guide de Lyon v6 lancé sur http://localhost:${PORT}`);
    console.log(`📁 Dossier: ${__dirname}`);
});