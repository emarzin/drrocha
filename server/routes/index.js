

'use strict';

var indexController = require('../controllers/index');




module.exports = function(app, auth) {


    app.get('/bem-mais-mulher-obrigado', indexController.bmm_obrigado);


};





