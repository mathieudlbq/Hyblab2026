// Use strict mode
'use strict';

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const db = require('./db');
const csvPath = path.join(__dirname, 'db_clean.csv');


// Load usefull expressjs and nodejs objects / modules
const express = require('express');

// Create our application
const app = express();

// Load and register our REST API
const api = require('./api/api');
app.use('/api', api);

// Minimum routing: serve static content from the html directory
app.use(express.static(path.join(__dirname, 'public/dist')));
app.use(express.static(path.join(__dirname, '../__common-logos__')));

app.get('*splat', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/dist', 'index.html'));
});

// You can then add whatever routing code you need
// database creation
db.serialize(() => {
    // 1. Création de la table
    db.run(`CREATE TABLE IF NOT EXISTS articles (
        "ID" INTEGER PRIMARY KEY,
        "Title" TEXT,
        "Content" TEXT,
        "Date" DATE,
        "Permalink" TEXT,
        "Image URL" TEXT,
        "Image Title" TEXT,
        "Image Alt Text" TEXT,
        "Image Featured" TEXT,
        "Attachment URL" TEXT,
        "Catégories" TEXT,
        "Étiquettes" TEXT,
        "categorie_tag" TEXT,
        "_post_review_box_title" TEXT,
        "_yoast_wpseo_primary_category" REAL,
        "_yoast_wpseo_estimated-reading-time-minutes" REAL,
        "_yoast_wpseo_content_score" REAL,
        "_yoast_wpseo_metadesc" TEXT,
        "_latlngmarker" TEXT,
        "Slug" TEXT,
        "Post Modified Date" DATE
    )`);

    // Start a transaction for the CSV import
    db.run("BEGIN TRANSACTION");

    // 2. Préparation de la requête d'insertion
    const stmt = db.prepare(`INSERT OR REPLACE INTO articles (
        "ID", "Title", "Content", "Date", "Permalink", "Image URL", "Image Title", 
        "Image Alt Text", "Image Featured", "Attachment URL", "Catégories", "Étiquettes", "categorie_tag",
        "_post_review_box_title", "_yoast_wpseo_primary_category", "_yoast_wpseo_estimated-reading-time-minutes", 
        "_yoast_wpseo_content_score", "_yoast_wpseo_metadesc", "_latlngmarker", "Slug", "Post Modified Date"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // Convertit une chaîne en date ISO (YYYY-MM-DD) ou null si invalide
    const parseDate = (value) => {
        if (!value || value.trim() === '') return null;
        const d = new Date(value.trim());
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    };

    let rowCount = 0;

    // 3. Lecture du CSV et insertion
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
            // Ignorer les articles sans coordonnées
            if (!row['_latlngmarker'] || row['_latlngmarker'].trim() === '') {
                return;
            }
            
            //Trim sur les images à l'endroit du tube 
            const imageURL = row['Image URL'].split('|')[0];;
            stmt.run(
                (row['ID'] || row['\ufeffID'] || row['\uFEFFID']), row['Title'], row['Content'], parseDate(row['Date']), row['Permalink'], 
                imageURL, row['Image Title'], row['Image Alt Text'], row['Image Featured'], 
                row['Attachment URL'], row['Catégories'], row['Étiquettes'], row['categorie_tag'], row['_post_review_box_title'], 
                row['_yoast_wpseo_primary_category'] || null, 
                row['_yoast_wpseo_estimated-reading-time-minutes'] || null, 
                row['_yoast_wpseo_content_score'] || null, 
                row['_yoast_wpseo_metadesc'], row['_latlngmarker'], row['Slug'], parseDate(row['Post Modified Date'])
            );
            rowCount++;
        })
        .on('end', () => {
            stmt.finalize(); // Clôture la requête préparée
            db.run("COMMIT", (err) => {
                if (err) {
                    console.error("Erreur lors du commit de la transaction:", err.message);
                } else {
                    console.log(`✅ Importation terminée : ${rowCount} articles insérés depuis le CSV.`);
                }
            });
        })
        .on('error', (error) => {
            console.error("Erreur de lecture du CSV:", error.message);
            db.run("ROLLBACK");
        });
});


// This module is exported and served by the main server.js located
// at the root of this set of projects. You can access it by lanching the main
// server and visiting http(s)://127.0.0.1:8080/name_of_you_project/ (if on a local server)
// or more generally: http(s)://server_name:port/name_of_you_project/
module.exports = app;
