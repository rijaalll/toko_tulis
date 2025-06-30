const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/all', produkController.getAll);
router.get('/search/:param', produkController.search);
router.post('/add', upload.single('image'), produkController.add);
router.put('/edit', upload.single('image'), produkController.edit);
router.delete('/delete/:id', produkController.delete);

module.exports = router;