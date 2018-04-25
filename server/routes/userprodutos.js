

'use strict';

var userprodutosController = require('../controllers/userprodutos');




module.exports = function(app, auth) {

    app.get('/api/getuserprodutos', auth.checkUserApi, userprodutosController.getuserprodutos);

    app.get('/api/loadaccess', auth.checkUserApi, userprodutosController.loadaccess);



};





