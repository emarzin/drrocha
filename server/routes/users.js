

'use strict';

var usersController = require('../controllers/users');
var multer = require('multer');
var upload = multer();


/*
var hasAuthorization = function(req, res, next) {
    if (req.user.type === 'tu') {
        next();
    } else {
        if (!req.user._id.equals(req.params.userId)) {
            return res.send(401, 'Zugriff verweigert!');
        }
        next();
    }
};
*/


module.exports = function(app, auth) {

    app.get('/', usersController.loginpage);

    app.get('/members', auth.checkUserPage, usersController.memberspage);

    app.get('/conta', auth.checkUserPage, usersController.contapage);

    app.post('/api/login', usersController.login);

    app.post('/api/entrar', usersController.login);

    app.get('/bem-vindo', auth.checkUserPage, usersController.bemvindopage);

    app.post('/api/checkemail', usersController.checkemail);

    app.post('/api/checkemaillead', usersController.checkemaillead);

    app.get('/unsubscribe', usersController.unsubscribepage);

    //HOTMART
    app.get('/hotmart', usersController.hotmartpage);
    
    app.put('/api/unsubscribe', usersController.unsubscribe);

    app.get('/forgot', usersController.forgotpage);
    app.post('/api/forgot', usersController.forgot);

    app.get('/reset', usersController.resetpage);
    app.post('/api/reset', usersController.resetpassword);

    app.put('/api/conta', auth.checkUserApi, usersController.updateconta);

    app.put('/api/updatecpf', auth.checkUserApi, usersController.updatecpf);

    // MAILGUN WEBHOOKS
    app.post('/api/mg', upload.any(), usersController.mailgun);



};





