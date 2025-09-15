// routes/dosen.routes.js
const dosenController = require('../controllers/dosen.controller');
// Jika Anda memiliki middleware otentikasi/otorisasi, import di sini
// const { authJwt } = require('../middlewares'); // Asumsi path middleware Anda

module.exports = (app) => {
    // Tambahkan header untuk CORS, atau biarkan di server.js jika sudah global
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Anda HARUS MENAMBAHKAN middleware otentikasi/otorisasi di sini
    // Contoh:
    // app.get('/api/admin/dosen', [authJwt.verifyToken, authJwt.isAdmin], dosenController.getAllDosen);
    // app.post('/api/admin/dosen', [authJwt.verifyToken, authJwt.isAdmin], dosenController.createDosen);
    // app.put('/api/admin/dosen/:id', [authJwt.verifyToken, authJwt.isAdmin], dosenController.updateDosen);
    // app.delete('/api/admin/dosen/:id', [authJwt.verifyToken, authJwt.isAdmin], dosenController.deleteDosen);

    // Untuk sementara tanpa autentikasi (HANYA UNTUK PENGEMBANGAN AWAL, JANGAN PRODUKSI!)
    app.get('/api/admin/dosen', dosenController.getAllDosen);
    app.post('/api/admin/dosen', dosenController.createDosen);
    app.put('/api/admin/dosen/:id', dosenController.updateDosen);
    app.delete('/api/admin/dosen/:id', dosenController.deleteDosen);
};