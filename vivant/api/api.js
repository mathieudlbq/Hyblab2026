'use strict';
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// Autoriser les requêtes cross-origin depuis localhost (dev Vite, quel que soit le port)
app.use(cors({
    origin: /^http:\/\/localhost(:\d+)?$/,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const db = require('../db');


// Sample endpoint that sends the partner's name
app.get('/topic', function (req, res) {
    let topic;

    // Get partner's topic from folder name
    topic = path.basename(path.join(__dirname, '/..'))
    // Send it as a JSON object
    res.json({ 'topic': topic });
});

// GET ARTICLES/
app.get(`/articles`, function (req, res) {
    const limit = req.query.limit

    // Get the database connection from the server
    //const db = require('../server').db;


    // Query the database for all articles
    let requete = `SELECT "ID", "Title", "Date", "Permalink", "Image URL", "Image Title", 
       "Image Alt Text", "Image Featured", "Attachment URL", "Catégories", "Étiquettes", categorie_tag,
       "_post_review_box_title", "_yoast_wpseo_primary_category", "_yoast_wpseo_estimated-reading-time-minutes", 
       "_yoast_wpseo_content_score", "_yoast_wpseo_metadesc", "_latlngmarker", "Slug", "Post Modified Date"
        FROM articles
        ORDER BY "Post Modified Date" DESC`
    if (limit) {
        requete += ` LIMIT ${limit}`
    }

    db.all(requete, [], (err, rows) => {
        if (err) {
            console.error('Error fetching articles:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

// GET ARTICLES/:category 
app.get('/articles/:category', function (req, res) {
    const category = req.params.category;

    if (!["Initiative personnelle/quotidienne", "Entrepreneuriat", "Collectifs", "Service publique"].includes(category)) {
        res.status(400).json({ error: 'Invalid category' });
        return;
    }

    db.all(`SELECT "ID", "Title", "Date", "Permalink", "Image URL", "Image Title", 
                "Image Alt Text", "Image Featured", "Attachment URL", "Étiquettes", "categorie_tag",
                "_post_review_box_title", "_yoast_wpseo_primary_category", "_yoast_wpseo_estimated-reading-time-minutes", 
                "_yoast_wpseo_content_score", "_yoast_wpseo_metadesc", "_latlngmarker", "Slug", "Post Modified Date" 
                FROM articles WHERE "categorie_tag" LIKE ?`, `%${category}%`, (err, rows) => {
        if (err) {
            console.error('Error fetching articles by category:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});


// Export our API
module.exports = app;
