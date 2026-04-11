const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');

router.get('/productos', controller.getProductos);
router.get('/producto/:id', controller.getProducto);

module.exports = router;