'use strict';


const app = require( 'express' )();
const path = require('path');
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const linkedom = require("linkedom");
const linkedom = require("linkedom");

app.use(cookieParser());


// VARIABLES - BASE DE DONNEES
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
let db;

// ROUTES API


// =========================
// ========== GET ==========
// =========================

app.get('/init', async function ( req, res ) {
    await initialisation();
    await test1();
    // await Test2Data();
    // await test2();
    res.json({'Ok':true});
} );

app.get('/poly', async function ( req, res ) {
    if(!fs.existsSync("./actu/api/BDD/dataActu.json")){
        fetch("https://api.actu.fr/posts?filter%5Bmarque%5D=87725", {
            method: "GET",    
            headers: {
                "Content-Type": "application/json",
                "user-agent": "Hyblab2026"
            }
        })
        .then(response => response.json())
        .then(data => {
            fs.writeFileSync("./actu/api/BDD/dataActu.json", JSON.stringify(data, null, 2));

            fs.readFile("./actu/api/BDD/dataActu.json", "utf8", function (err, fileData) {
                if (err) {
                    res.json({error:"Les données n'ont pas pu être récupérés !"});
                    return;
                }
                res.json(JSON.parse(fileData));
            });
        });
    }else{
        fs.readFile("./actu/api/BDD/dataActu.json", "utf8", function (err, fileData) {
                if (err) {
                    res.json({error:"Les données n'ont pas pu être récupérés !"});
                    return;
                }
                res.json(JSON.parse(fileData));
        });
    }  

} );

function lastWednesday() {
  const today = new Date()
  const day = today.getDay()

  const diff = (day - 3 + 7) % 7

  today.setDate(today.getDate() - diff)

  return today
}

app.get('/getAffiches', async function ( req, res ) {
    const lastDate = lastWednesday();
    const day = String(lastDate.getDate()).padStart(2, "0");
    const month = String(lastDate.getMonth()+1).padStart(2, "0");
    const year = String(lastDate.getFullYear()); 

    if(!fs.existsSync(`./actu/api/BDD/Films/films-${year}-${month}-${day}.json`)){
        
        const link = `https://cinema.actu.fr/semaine/${year}-${month}-${day}`;

        const resp = await fetch(link);
        const html = await resp.text();

        const document  = new linkedom.DOMParser().parseFromString(html, "text/html");
        const fiche = document?.body.querySelectorAll(".fiche-film");
        const ficheObjs = [];
        for(const f of fiche){
            const title = f?.querySelector(".fiche-film--description>a>h2").textContent.trim();
            const realisateur = f?.querySelector(".fiche-film--description>span.fiche-film--description--no-gap>a").textContent.trim();
            const date = f?.querySelector(".fiche-film--description>span.fiche-film--date>a").textContent.trim();
            const image = f?.querySelector(".media>img")?.getAttribute("src").replace("_thumb","");
            console.log(title);
            console.log(realisateur);
            console.log(date);
            console.log(image);
            ficheObjs.push({title:title,real:realisateur,date:date,affiche:image});
        }
        fs.writeFileSync(`./actu/api/BDD/Films/films-${year}-${month}-${day}.json`, JSON.stringify(ficheObjs, null, 2));
    }
    fs.readFile(`./actu/api/BDD/Films/films-${year}-${month}-${day}.json`, "utf8", function (err, fileData) {
        if (err) {
            res.json({error:"Les données n'ont pas pu être récupérés !"});
            return;
        }
        res.json(JSON.parse(fileData));
    });
} );

// async function getCineActuHTML(){
//     const res = await fetch("http://localhost:8080/actu/api/poly");
//     const json = await res.json();

//     const values = Object.values(json);
//     const target = values[2];
//     const result = Object.values(target);
    

//     return result.find(e=>e.id === 63923715)?.content;
// }
// async function getCineActuHTML(){
//     const res = await fetch("https://actu.fr/cinema/sorties-films/planetes-scarlet-et-l-eternite-le-testament-d-ann-lee-nos-critiques-des-sorties-du-11-mars_63923715.html")
//     const html = await res.text()

//     const { document } = new linkedom.DOMParser().parseFromString(html, "text/html");


//     // console.log(document.querySelector("h1").textContent);
// }
// getCineActuHTML();

// ROUTES FILMS

app.get('/film-week', async function ( req, res ) {
    const { last_date } = await GetLastDate();
    const films = await GetFilmsByDate(last_date);
    res.json(films);
} );

app.get('/film-like', async (req, res) => {

    const token = req.cookies.token;
    let user = null;

    if(token){
        user = await GetUserByToken(token);
    }

    if(user){
        const films = await GetLikeByUserId(user.id);
        res.json(films);
    }else{
        res.status(401).json({ error: "Utilisateur non authentifié" });
    }

});

//récupérer le classement des films
app.get('/film-ranking', async (req, res) => {

    const date = await GetLastDate();
    const films = await GetClassement(date);

    if (films){
        res.json(films);
    }
    else{
        res.status(401).json({ error: "Aucun films" });
    }
});

// récupérer le film coup de coeur de la semaine
app.get('/film-bestofweek', async (req, res) => {

    const date = await GetLastDate();
    const film = await GetFilmsCoupDeCoeurByDate(date);

    if (film){
        res.json(film);
    }
    else{
        res.status(401).json({ error: "Aucun film coup de coeur cette semaine" });
    }
});


// Sample endpoint that sends the partner's name
app.get('/topic', function ( req, res ) {
    let topic;

    // Get partner's topic from folder name
    topic = path.basename(path.join(__dirname, '/..'))
    // Send it as a JSON object
    res.json({'topic':topic});
} );


// --------acteurs-------------

//récupérer des acteurs par leur film
app.get('/acteur/:id_film', async (req, res) => {

    const film = parseInt(req.params.id_film);

    const acteurs = await GetActeursByFilm(film);

    if (acteurs){
        res.json(acteurs);
    }
    else{
        res.status(401).json({ error: "Aucun acteur pour le film " + film});
    }
});



// --------utilisatuers-------------

app.get("/create-user", async (req,res)=>{

    let token = req.cookies.token;
    let user = null;

    if(token){
        user = await GetUserByToken(token);
    }

    console.log(user);
    if(!user){
        console.log("Création de token chez le client");
        token = generateToken();

        await ajoutUtilisateur(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000*60*60*24*30
        });
    }

    res.json({status:"ok"});
});


function generateToken(){

    const token = crypto.randomBytes(32).toString("hex");

    return token;
}


async function recuperation_film(){

    const res = await fetch("https://actu.fr/cinema/sorties-films/planetes-scarlet-et-l-eternite-le-testament-d-ann-lee-nos-critiques-des-sorties-du-11-mars_63923715.html",{"Content-Type":"text/html; charset=UTF-8"});
    const html = await res.text();
    // console.log(html);

    const doc = new linkedom.DOMParser().parseFromString(html,"text/html");
    //console.log(dom.window.document.querySelector("h1").textContent);

    const films = [];
    const film = doc.querySelectorAll("h2");
    const critiques = [...doc.querySelectorAll("p.wall-content")].filter(p => p.textContent.trim().length > 0);

    const bande_annonces = doc.querySelectorAll(".ac-embed--youtube");

    for (let i = 0; i< film.length; i++){

        if (film[i].textContent != "Les plus lus"){
            const titre = film[i].querySelector("em").textContent.toLowerCase();
            const texte = film[i].innerHTML.split("<br>");

            const realisateur = texte[0]
            .replace(/<em>.*?<\/em>/, "")
            .replace(", de", "")
            .trim();
            const real = realisateur.replace("&#160;","");

            const etoiles = texte[1]
            .replace(/<.*?>/g, "")
            .trim();
            const c = critiques[i];
            const strong = c.querySelector("strong");
            if (strong) strong.remove();
            const critique = c.textContent;
            let bande_annonce = null;

            bande_annonces.forEach((e)=>{
                let title = e.querySelector("iframe").getAttribute("title");
                title = title.toLowerCase();
                let regex = new RegExp(titre)
                const est_film = regex.test(title);
                console.log(regex, title)
                console.log(est_film);
                if(est_film|| bande_annonce == null){
                    bande_annonce = e.querySelector("iframe").getAttribute("data-maybe-src");
                }
            })
            }

            // const attributs_film = {
            //     "titre" : titre,
            //     "realisateur" :real,
            //     "critique" :critique,
            //     "nb_etoile" : etoiles,
            //     "bande_annonce" : bande_annonce,
            // }
            // console.log(attributs_film);
            // films.push(attributs_film);
            }
    return films;
};
recuperation_film();
// =========================
// ========== POST =========
// =========================

//ajouter un film aimé
app.post("/film-like", async(req, res) => {
    const {id_film, id_utilisateur} = req.body;
    if (!id_film || !id_utilisateur){
        res.status(400).json({ error: 'champs vide' });
    }

    const film = await ajoutFilmAime(id_film, id_utilisateur);
    if(!film){
        res.status(400).json({error: "erreur d'insertion"});
    }
    else{
        res.json({message : "film insérer avec succès voici son id :" + film})
    }
});


//ajouter un film
app.post("/film", async(req, res) => {
    const {nom , affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie} = req.body;

    const film = await ajoutFilm(nom, affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie);
    if(!film){
        res.status(400).json({error: "erreur d'insertion"});
    }
    else{
        res.json({message : "film insérer avec succès voici son id :" + film})
    }
});

//ajouter un film
app.post("/film-bestofweek", async(req, res) => {
    const {id_film, date} = req.body;

    const film = await ajoutFilmCoupDeCoeur(id_film, date);
    if(!film){
        res.status(400).json({error: "erreur d'insertion"});
    }
    else{
        res.json({message : "film insérer avec succès voici son id :" + film})
    }
});

//ajouter un acteur
app.post("/acteur", async(req, res) => {
    const {nom, prenom} = req.body;

    const acteur = await ajoutActeur(nom, prenom);
    if(!acteur){
        res.status(400).json({error: "erreur d'insertion"});
    }
    else{
        res.json({message : "acteur insérer avec succès voici son id :" + acteur})
    }
});

//ajouter un acteur à un film
app.post("/acteur-film", async(req, res) => {
    const {id_film, id_acteur} = req.body;

    const acteur = await ajoutFilmActeur(id_film, id_acteur);
    if(!acteur){
        res.status(400).json({error: "erreur d'insertion"});
    }
    else{
        res.json({message : "acteur insérer avec succès voici son id :" + acteur})
    }
});

// =========================
// ========= DELETE ========
// =========================

app.delete("/film-like/id_film", async(res,req)=>{
    const id_film = parseInt(req.params.id_film);
    let token = req.cookie.token;
    const id_utilisateur = await GetUserByToken(token);
    const film = supprimeFilmAime(id_film, id_utilisateur);
    if(!film){
        res.status(400).json({error: "erreur de suppression"});
    }
    else{
        res.json({message : "film disliké avec succès "});
    }
});







// BASE DE DONNEES

async function getDB(){
    if(!db){
        db = await open({
            filename: './actu/api/BDD/database.db',
            driver: sqlite3.Database
        })
    }
    return db;
}

async function initialisation(){
    const db = await getDB();

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
}

async function test1(){
    // Données tests généré par IA
    const user1 = await GetUserById(1);

    if(!user1){
        // Utilisateurs
        await ajoutUtilisateur("token_user_1");
        await ajoutUtilisateur("token_user_2");
        await ajoutUtilisateur("token_user_3");
        await ajoutUtilisateur("token_user_4");


        // Acteurs
        await ajoutActeur("Downey", "Robert");
        await ajoutActeur("Evans", "Chris");
        await ajoutActeur("Holland", "Tom");
        await ajoutActeur("DiCaprio", "Leonardo");


        // Films
        await ajoutFilm(
            "Iron Man",
            "ironman.jpg",
            "https://youtube.com/ironman",
            "Excellent film Marvel",
            5,
            "Tony Stark construit une armure pour devenir Iron Man",
            "Jon Favreau",
            "2024-05-01"
        );

        await ajoutFilm(
            "Avengers",
            "avengers.jpg",
            "https://youtube.com/avengers",
            "Super film d'équipe",
            5,
            "Les héros Marvel s'unissent",
            "Joss Whedon",
            "2024-05-01"
        );

        await ajoutFilm(
            "Spider-Man",
            "spiderman.jpg",
            "https://youtube.com/spiderman",
            "Très divertissant",
            4,
            "Peter Parker devient Spider-Man",
            "Jon Watts",
            "2024-06-01"
        );


        // Relations film-acteur
        await ajoutFilmActeur(1,1); // Iron Man - Robert Downey Jr
        await ajoutFilmActeur(2,1); // Avengers - Downey
        await ajoutFilmActeur(2,2); // Avengers - Chris Evans
        await ajoutFilmActeur(3,3); // Spiderman - Tom Holland


        // Likes utilisateurs
        await ajoutFilmAime(1,1);
        await ajoutFilmAime(1,2);
        await ajoutFilmAime(2,1);
        await ajoutFilmAime(2,3);
        await ajoutFilmAime(3,4);
    }

    
}

async function Test2Data() {
    // Données tests généré par IA

    // --- Utilisateurs ---
    await ajoutUtilisateur("token_user_1");
    await ajoutUtilisateur("token_user_2");
    await ajoutUtilisateur("token_user_3");
    await ajoutUtilisateur("token_user_4");
    await ajoutUtilisateur("token_user_5");

    // --- Acteurs ---
    await ajoutActeur("Robert", "Downey Jr");
    await ajoutActeur("Chris", "Evans");
    await ajoutActeur("Tom", "Holland");
    await ajoutActeur("Scarlett", "Johansson");
    await ajoutActeur("Leonardo", "DiCaprio");

    // --- Films (5 films le même jour) ---
    const dateSortie = "2024-07-01";

    await ajoutFilm(
        "Iron Man",
        "ironman.jpg",
        "https://youtube.com/ironman",
        "Excellent film Marvel",
        5,
        "Tony Stark construit une armure pour devenir Iron Man",
        "Jon Favreau",
        dateSortie
    );

    await ajoutFilm(
        "Avengers",
        "avengers.jpg",
        "https://youtube.com/avengers",
        "Super film d'équipe",
        5,
        "Les héros Marvel s'unissent",
        "Joss Whedon",
        dateSortie
    );

    await ajoutFilm(
        "Spider-Man",
        "spiderman.jpg",
        "https://youtube.com/spiderman",
        "Très divertissant",
        4,
        "Peter Parker devient Spider-Man",
        "Jon Watts",
        dateSortie
    );

    await ajoutFilm(
        "Black Widow",
        "blackwidow.jpg",
        "https://youtube.com/blackwidow",
        "Action et émotion",
        4,
        "Natasha Romanoff affronte son passé",
        "Cate Shortland",
        dateSortie
    );

    await ajoutFilm(
        "Inception",
        "inception.jpg",
        "https://youtube.com/inception",
        "Thriller intellectuel",
        5,
        "Un voleur pénètre dans les rêves pour voler des secrets",
        "Christopher Nolan",
        dateSortie
    );

    // --- Relations Film-Acteur ---
    await ajoutFilmActeur(1,1); // Iron Man - Robert Downey Jr
    await ajoutFilmActeur(2,1); // Avengers - Robert Downey Jr
    await ajoutFilmActeur(2,2); // Avengers - Chris Evans
    await ajoutFilmActeur(3,3); // Spider-Man - Tom Holland
    await ajoutFilmActeur(4,4); // Black Widow - Scarlett Johansson
    await ajoutFilmActeur(5,5); // Inception - Leonardo DiCaprio

    // --- Likes utilisateurs ---
    await ajoutFilmAime(1,1);
    await ajoutFilmAime(1,2);
    await ajoutFilmAime(2,1);
    await ajoutFilmAime(2,3);
    await ajoutFilmAime(3,4);
    await ajoutFilmAime(4,5);
    await ajoutFilmAime(5,1); // Inception a quelques likes
    await ajoutFilmAime(5,2);

    // --- Film coup de cœur ---
    await ajoutFilmCoupDeCoeur(5, dateSortie); // Inception coup de cœur
    
}

async function test2(){

    const { last_date } = await GetLastDate();
    const films = await GetFilmsByDate(last_date);
    const filmsCoeur = await GetFilmsCoupDeCoeurByDate(last_date);
    const classement = await GetClassement(last_date);
    const user = await GetUserById(2);
    const like = await GetLikeByUserId(2);
    const acteurs = await GetActeursByFilm(1);

    console.log("Derniers films : ",films);
    console.log("Film Coup de Coeur : ",filmsCoeur);
    console.log("Classement : ",classement);
    console.log("Utilisateur 2 : ",user);
    console.log("Like de l'utilisateur 2 : ",like);
    console.log("Acteurs du film 1: ",acteurs);
}

// ======================
// == GET INSTRUCTIONS ==
// ======================

async function GetLastDate(){
    const db = await getDB();
    
    const query = `
        SELECT max(date_sortie) as last_date from Film
    `;

    const result = await db.get(query, []);

    return result;
}

// --- FILMS --- 

async function GetFilmsByDate(date){
    const db = await getDB();
    
    const query = `
        SELECT * FROM Film WHERE date_sortie = ?
    `;
    const result = await db.all(query, [date]);

    return result;
}

async function GetFilmsCoupDeCoeurByDate(date){
    const db = await getDB();
    
    const query = `
        SELECT * FROM FilmCoupDeCoeur FC JOIN Film F ON FC.id_film = F.id WHERE date_sortie = ?
    `;
    const result = await db.get(query, [date]);

    return result;
}

async function GetClassement(date){
    const db = await getDB();
    
    const query = `
        SELECT F.nom, COUNT(FA.id_utilisateur) as nb_likes
        FROM film F
        JOIN FilmAime FA ON F.id = FA.id_film
        WHERE F.date_sortie = ?
        GROUP BY F.id
        ORDER BY nb_likes DESC
    `;

    const result = await db.all(query, [date]);

    return result;
}

// --- USER --- 

async function GetUserById(id){
    const db = await getDB();
    
    const query = `
        SELECT * FROM Utilisateur WHERE id = ?
    `;

    const result = await db.get(query, [id]);

    return result;
}

async function GetUserByToken(token){
    const db = await getDB();
    
    const query = `
        SELECT * FROM Utilisateur WHERE token = ?
    `;

    const result = await db.get(query, [token]);

    return result;
}

async function GetLikeByUserId(userid){
    const db = await getDB();
    
    const query = `
        SELECT F.* FROM FilmAime FA JOIN Film F on FA.id_film = F.id WHERE FA.id_utilisateur = ?
    `;

    const result = await db.all(query, [userid]);

    return result;
}


// --- ACTEUR ---

async function GetActeursByFilm(idFilm){
    const db = await getDB();
    
    const query = `
        SELECT * FROM FilmActeur FA JOIN Acteur A ON FA.id_acteur = A.id WHERE FA.id_film = ? 
    `;

    const result = await db.all(query, [idFilm]);

    return result;
}


// =========================
// == INSERT INSTRUCTIONS ==
// =========================

async function ajoutUtilisateur(token){
    const db = await getDB();

    const insert = await db.run(`
        INSERT INTO Utilisateur (token) VALUES (?)
    `,[token]);

    return insert.lastID;
}

async function ajoutFilmAime(id_film, id_utilisateur){
    const db = await getDB();

    const insert = await db.run(`
        INSERT INTO FilmAime (id_film, id_utilisateur) VALUES (?,?)
    `,[id_film, id_utilisateur]);

    return insert.lastID;
}

async function ajoutFilm(nom, affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie){
    const db = await getDB();
    
    const insert = await db.run(`
        INSERT INTO Film (nom, affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie) VALUES (?,?,?,?,?,?,?,?)
    `,[nom, affiche, bande_annonce, critique, nb_etoile, description, realisateur, date_sortie]);

    return insert.lastID;

}

async function ajoutActeur(nom, prenom){
    const db = await getDB();

    const insert = await db.run(`
        INSERT INTO Acteur (nom, prenom) VALUES (?,?)
    `,[nom,prenom]);

    return insert.lastID;

}

async function ajoutFilmActeur(id_film, id_acteur){
    const db = await getDB();

    const insert = await db.run(`
        INSERT INTO FilmActeur (id_film, id_acteur) VALUES (?,?)
    `,[id_film,id_acteur]);

    return insert.lastID;

}

async function ajoutFilmCoupDeCoeur(id_film, date){
    const db = await getDB();

    const insert = await db.run(`
        INSERT INTO Film (id_film, date) VALUES (?,?)
    `,[id_film,date]);

    return insert.lastID;
}

async function supprimeFilmAime(id_film, id_utilisateur){
    const db = await getDB();

    const deleteQuery = await db.run(`
        DELETE FROM FilmAime WHERE id_film = ? and id_utilisateur = ?
    `,[id_film, id_utilisateur]);

    return true;
}





// Export our API
module.exports = app;
