

'use strict';

var produtosController = require('../controllers/produtos');




module.exports = function(app, auth) {

    app.get('/produto/:keyword', auth.checkUserPage, produtosController.produtopage);

    app.get('/produto/:keyword/modulo/:modulo', auth.checkUserPage, produtosController.modulopage);

    app.get('/produto/:keyword/modulo/:modulo/conteudo/:conteudo', auth.checkUserPage, produtosController.conteudopage);

    app.get('/obrigado/:produto', produtosController.obrigadopage);

    app.get('/api/getvitrine', produtosController.getvitrine);

    app.get('/api/getnova', produtosController.getnova);



};





