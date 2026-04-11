const productosService = require('../services/productos.service');

const getProductos = async (req, res) => {
  try {
    const productos = await productosService.obtenerProductos();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProducto = async (req, res) => {
  try {
    const producto = await productosService.obtenerProducto(req.params.id);
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProductos,
  getProducto
};