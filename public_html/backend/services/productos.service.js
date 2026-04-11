const db = require('../config/db');

const obtenerProductos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
      if (err) reject(err);

      const fixed = rows.map(p => ({
        ...p,
        imagen_url: (p.imagen && p.imagen !== "null" && p.imagen !== "")
          ? `/uploads/${p.imagen}`
          : '/img/default.png'
      }));

      resolve(fixed);
    });
  });
};

const obtenerProducto = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM productos WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);

      if (row) {
        row.imagen_url = row.imagen ? `/uploads/${row.imagen}` : null;
      }

      resolve(row);
    });
  });
};

module.exports = {
  obtenerProductos,
  obtenerProducto
};