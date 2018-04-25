

'use strict';

var pbController = require('../controllers/postbacks');


module.exports = function(app, auth) {

    //app.post('/api/monetizze', pbController.monetizze);

    //app.post('/api/upnid', pbController.upnid);

    app.post('/hotmart', auth.checkUserPage, pbController.hotmart);

    app.get('/api/checkpurchase', pbController.checkpurchase);


};





