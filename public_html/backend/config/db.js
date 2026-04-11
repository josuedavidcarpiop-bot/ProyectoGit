const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('catalogo.db', (err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
  } else {
    console.log("Conectado a SQLite");
  }
});

module.exports = db;