const express = require('express');
const cors = require('cors');
const path = require('path');

const productosRoutes = require('./routes/productos.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', productosRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});