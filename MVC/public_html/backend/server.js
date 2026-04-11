const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from parent public_html (so admin page is accessible)
app.use(express.static(path.join(__dirname, '..')));

// Ensure uploads dir exists (served statically)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Serve uploads
app.use('/uploads', express.static(uploadsDir));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, unique + '-' + safe);
  }
});
const upload = multer({ storage });

const db = new sqlite3.Database('catalogo.db');

// Obtener todos los productos
app.get('/productos', (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // aseguramos que imagen_url NUNCA sea null
    const fixed = rows.map(p => {
      return {
        ...p,
        imagen_url: (p.imagen && p.imagen !== "null" && p.imagen !== "") 
          ? `/uploads/${p.imagen}` 
          : '/img/default.png'
      };
    });

    res.json(fixed);
  });
});

// Obtener un producto por ID
app.get('/producto/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({error: err.message});

    if (row) {
      row.imagen_url = row.imagen ? `/uploads/${row.imagen}` : null;
    }

    res.json(row);
  });
});

// Upload imagen
app.post('/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, url: '/uploads/' + req.file.filename });
});

// Crear un producto
app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

  if (!nombre)
    return res.status(400).json({ error: "El campo 'nombre' es requerido." });

  const stmt = db.prepare(
    "INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?)"
  );

  stmt.run(
    [nombre, descripcion || '', precio || 0, stock || 0, categoria || '', imagen || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Producto creado', id: this.lastID });
    }
  );

  stmt.finalize();
});

// Actualizar un producto
app.put('/producto/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

  const fields = [];
  const values = [];

  if (nombre !== undefined) { fields.push("nombre = ?"); values.push(nombre); }
  if (descripcion !== undefined) { fields.push("descripcion = ?"); values.push(descripcion); }
  if (precio !== undefined) { fields.push("precio = ?"); values.push(precio); }
  if (stock !== undefined) { fields.push("stock = ?"); values.push(stock); }
  if (categoria !== undefined) { fields.push("categoria = ?"); values.push(categoria); }
  if (imagen !== undefined) { fields.push("imagen = ?"); values.push(imagen); }

  if (fields.length === 0)
    return res.status(400).json({ error: "Nada para actualizar." });

  const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Producto no encontrado." });
    res.json({ message: 'Producto actualizado' });
  });
});

// Eliminar un producto
app.delete('/producto/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM productos WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Producto no encontrado." });
    res.json({ message: 'Producto eliminado' });
  });
});

app.listen(3000, () => {
  console.log("Servidor backend funcionando en http://localhost:3000");
});
