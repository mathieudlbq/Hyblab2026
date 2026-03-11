'use strict';

const app = require( 'express' )();
const path = require('path');

// BASE DE DONNEES

const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

app.get('/init', async function ( req, res ) {
    initialisation();
    res.json({'Ok':true});
} );
// Sample endpoint that sends the partner's name
app.get('/topic', function ( req, res ) {
    let topic;

    // Get partner's topic from folder name
    topic = path.basename(path.join(__dirname, '/..'))
    // Send it as a JSON object
    res.json({'topic':topic});
} );


// BASE DE DONNEES

async function initialisation(){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
    CREATE TABLE Utilisateur(
        id INTEGER PRIMARY KEY,
        token TEXT
    ) STRICT

    CREATE TABLE FilmAime(
        id_film INTEGER PRIMARY KEY,
        id_utilisateur INTEGER PRIMARY KEY
    ) STRICT

    CREATE TABLE Film (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        affiche TEXT,
        bande_annonce TEXT,
        critique TEXT, 
        nb_etoile INTEGER,
        description TEXT, 
        realisateur TEXT,
        date_sortie TEXT
    ) STRICT 

    CREATE TABLE Acteur(
        id INTEGER PRIMARY KEY, 
        nom TEXT, 
        prenom TEXT
    )

    CREATE TABLE FilmActeur(
        id_film INTEGER PRIMARY KEY,
        id_acteur INTEGER PRIMARY KEY
    )

    CREATE TABLE FilmCoupDeCoeur(
        id_film INTEGER PRIMARY KEY,
        date TEXT
    )
    `); 
}

async function ajoutUtilisateur(token){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
        INSERT INTO Utilisateur (token) VALUES (${token})
    `);
}

async function ajoutFilmAime(id_film, id_utilisateur){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
        INSERT INTO FilmAime (id_film, id_utilisateur) VALUES (${id_film}, ${id_utilisateur})
    `);
}

async function ajoutFilm(nom, affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
        INSERT INTO Film (nom, affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie) VALUES (${nom}, ${affiche}, ${bande_annonce}, ${critique}, ${nb_etoile}, ${description}, ${realisateur}, ${date_sortie})
    `);
}

async function ajoutActeur(nom, prenom){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
        INSERT INTO Film (nom, prenom) VALUES (${nom}, ${prenom})
    `);
}

async function ajoutFilmActeur(id_film, id_acteur){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
        INSERT INTO Film (id_film, id_acteur) VALUES (${id_film}, ${id_acteur})
    `);
}

async function ajoutFilmCoupDeCoeur(id_film, date){
    const db = await open({
    filename: './actu/api/BDD/database.db',
    driver: sqlite3.Database
    })
    db.exec(`
        INSERT INTO Film (id_film, date) VALUES (${id_film}, ${date})
    `);
}





// Export our API
module.exports = app;
