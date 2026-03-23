'use strict';

let { getDB } = require('./api.js');

async function initialisation() {

    const db = await getDB();
    console.log("Initialisation de la BDD");
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Utilisateur(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE
        );
    `); 

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Film(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT,
            affiche TEXT,
            bande_annonce TEXT,
            lien_article TEXT,
            critique TEXT,
            nb_etoile INTEGER,
            description TEXT,
            realisateur TEXT,
            date_sortie TEXT
        );
    `); 

    await db.exec(`
        CREATE TABLE IF NOT EXISTS FilmAime(
            id_film INTEGER,
            id_utilisateur INTEGER,
            PRIMARY KEY (id_film, id_utilisateur),
            FOREIGN KEY (id_film) REFERENCES Film(id),
            FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id)
        );
    `); 

    await db.exec(`
        CREATE TABLE IF NOT EXISTS FilmAimePas(
            id_film INTEGER,
            id_utilisateur INTEGER,
            PRIMARY KEY (id_film, id_utilisateur),
            FOREIGN KEY (id_film) REFERENCES Film(id),
            FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id)
        );
    `); 

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Acteur(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nom TEXT, 
            prenom TEXT
        );
    `); 

    await db.exec(`
        CREATE TABLE IF NOT EXISTS FilmActeur(
            id_film INTEGER,
            id_acteur INTEGER,
            PRIMARY KEY (id_film, id_acteur),
            FOREIGN KEY (id_film) REFERENCES Film(id),
            FOREIGN KEY (id_acteur) REFERENCES Acteur(id)
        );
    `); 

    await db.exec(`
        CREATE TABLE IF NOT EXISTS FilmCoupDeCoeur(
            id_film INTEGER PRIMARY KEY,
            date TEXT,
            FOREIGN KEY (id_film) REFERENCES Film(id)
        );
    `);
    console.log("Fin de l'initialisation de la BDD");

}

initialisation()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Erreur lors de l'initialisation :", err);
        process.exit(1);
    });