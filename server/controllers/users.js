
'use strict';


var User = require('../models/user'),
    Userproduto = require('../models/userproduto'),
    Monetizze = require('../models/monetizze'),
    Email = require('../models/email'),
    Sms = require('../models/sms'),
    Mailgun = require('../models/mailgun'),
    jwt = require('jwt-simple'),
    async = require('async'),
    request = require('request'),
    config = require('../../config/env'),
    receitafederal = require('../../config/receitafederal'),
    crypto = require('crypto'),
    utils = require('../../config/utils'),
    ddd = require('../../config/ddd'),
    chance = require('chance').Chance(),
    swig = require('swig'),
    express = require('express'),
    router = express.Router(),
    axios = require('axios');
var mongoose = require('mongoose');
//var sendgrid = require('sendgrid')(process.env.U, process.env.password);





module.exports = {

    loginpage: function(req, res, next) {
        res.render(__dirname + '/../../public/views/login.html', {
            env: config.env,
            assets: utils.assets
        });
    },


    login: function(req, res, next) {
        //console.log('login: ' + new Date());
        //console.log(req.body);

        var contato = utils.cleanContato(req.body.email);
        User.findOne({
            email: contato
        }, function(err, user) {

            //console.log('CASA: ' + user);
            if (err) throw err;

            if (!user) {
                return res.status(403).send('Email ou senha incorretos!');
            } else {
                if(user.blocked != 'true'){
                    // check if password matches
                    user.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {

                            // if user is found and password is right create a token
                            var now = new Date();

                            var simpleuser = {
                                _id: user._id,
                                updated: user.updated,
                                exp: now.setDate(now.getDate() + 7)
                            };

                            var token = jwt.encode(simpleuser, config.secret);
                            // return the information including token as JSON


                                res.json({
                                    token: token,
                                    user: user.toJSON()
                                });


                        } else {
                            return res.status(403).send('Email ou senha incorretos!');
                        }
                    });
                }else{
                    return res.status(403).send('Caro usuário, seu acesso está bloqueado. Para maiores informações entre em contato conosco.');
                }

            }

        });

    },

    memberspage: function(req, res, next) {
        res.render(__dirname + '/../../public/views/members.html', {
            env: config.env,
            assets: utils.assets
        });
    },

    contapage: function(req, res, next) {
        res.render(__dirname + '/../../public/views/conta.html', {
            env: config.env,
            assets: utils.assets
        });
    },


    bemvindopage: function(req, res, next) {
        res.render(__dirname + '/../../public/views/bemvindo.html', {
            env: config.env,
            assets: utils.assets
        });
    },


    checkemail: function(req, res, next) {
        console.log('checkemail: ' + new Date());
        console.log(req.body);

        req.assert('name', 'Informe seu nome completo.').notEmpty();
        req.assert('email', 'Informe seu MELHOR email.').isEmail();
        //req.assert('celular', 'Informe seu número de celular com DDD.').len(11,11);

        // validação de celular
        /*
         console.log('Validação de celular: ' + req.body.celular);
         var checkCelular = ddd.consultaCelular(req.body.celular);
         console.log('Status do celular: ' + checkCelular);
         */

        var errors = req.validationErrors();

        /*
        if (checkCelular != 'ok') {
            if (!errors) errors = [];
            errors.push({ msg: checkCelular });
        }
        */

        if (errors) return res.status(400).send(errors);

        var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        var browser = req.headers['user-agent'];

        var email = req.body.email.toLowerCase();
        email = email.trim();

        User.findOne({ email: email }, function(err, user) {
            if (err) {
                console.log(err);
                res.status(400).send('erro');
            } else {
                if (user) {
                    if (user.paid) {
                        return res.status(200).send('loginpage');
                    }

                    console.log('Já existe user com: ' + email);
                    //user.celular = req.body.celular;
                    user.from_mobile = utils.isMobile(req);
                    user.vagas = req.body.vagas;

                    for (var i = 0; i < user.tags.length; i++) {
                        if (user.tags[i].name === 'checkout') {
                            user.tags.splice(i, 1);
                            break;
                        }
                    }

                    var tomorrow = new Date();
                    tomorrow = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
                    user.tags.push({ name: 'checkout', nextRunAfter: tomorrow });

                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send([ { msg: 'Erro! Por favor, tente novamente.' } ]);
                        } else {
                            res.status(200).send('ok');
                        }
                    });
                } else {
                    // Neverbounce email validation
                    var NeverBounce = require('neverbounce')({
                        apiKey: config.emailvalidator.user,
                        apiSecret: config.emailvalidator.pass
                    });

                    console.log('Email a verificar: ' + email);

                    NeverBounce.single.verify(email).then(
                        function(result) {
                            console.log('Email verificado: ' + email);
                            console.log(result);

                            var isValid = result.is(0);

                            if (!isValid) {
                                // invalid email: warn user to check it
                                console.log('Email não existe: ' + email);
                                res.status(400).send([{ msg: 'Não existe este email: ' + email + ' Por favor, corrija!' }]);
                            } else {
                                // valid email :-))
                                console.log('Email EXISTE: ' + email);

                                crypto.randomBytes(20, function(err, buf) {
                                    var newuser = new User();
                                    newuser.name = req.body.name;
                                    newuser.email = email;
                                    //newuser.celular = req.body.celular;
                                    newuser.from_mobile = utils.isMobile(req);
                                    newuser.vagas = req.body.vagas;
                                    newuser.firstname = utils.getFirstname(req.body.name);
                                    newuser.password = config.defaultpassword;
                                    newuser.unsubscribeToken = buf.toString('hex');

                                    var tomorrow = new Date();
                                    tomorrow = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
                                    newuser.tags.push({ name: 'checkout', nextRunAfter: tomorrow });

                                    newuser.source = {
                                        ip: ip,
                                        browser: browser
                                    };

                                    newuser.save(function(err) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).send([ { msg: 'Erro! Por favor, tente novamente.' } ]);
                                        } else {
                                            res.status(200).send('ok');
                                        }
                                    });
                                });
                            }
                        },
                        function(error) {
                            // errors will bubble up through the reject method of the promise.
                            // you'll want to console.log them otherwise it'll fail silently
                            console.log('Erro ao validar email no Neverbounce ' + new Date());
                            console.log('Email: ' + email);
                            console.log(error);
                            res.status(400).send([{ msg: 'Erro ao verificar seu email. Por favor, tente novamente!' }]);
                        });
                }
            }
        });

    },



    checkemaillead: function(req, res, next) {
        console.log('checkemaillead: ' + new Date());
        console.log(req.body);
        req.assert('name', 'Informe seu nome completo.').notEmpty();
        req.assert('email', 'Informe seu MELHOR email.').isEmail();
        var errors = req.validationErrors();
        if (errors) return res.status(400).send(errors);

        var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        var browser = req.headers['user-agent'];

        var email = req.body.email.toLowerCase();
        email = email.trim();

        User.findOne({ email: email }, function(err, user) {
            if (err) {
                console.log(err);
                res.status(400).send('erro');
            } else {
                if (user) {
                    console.log('Já existe user com: ' + email);
                    user.from_mobile = utils.isMobile(req);
                    if (!user.paid) user.tags.push({ name: 'ebook' });

                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send([ { msg: 'Erro! Por favor, tente novamente.' } ]);
                        } else {
                            // ENVIA EMAIL: FAZER

                            res.status(200).send('ok');
                        }
                    });
                } else {
                    // Neverbounce email validation
                    var NeverBounce = require('neverbounce')({
                        apiKey: config.emailvalidator.user,
                        apiSecret: config.emailvalidator.pass
                    });

                    console.log('Email a verificar: ' + email);

                    NeverBounce.single.verify(email).then(
                        function(result) {
                            console.log('Email verificado: ' + email);
                            console.log(result);

                            var isValid = result.is(0);

                            if (!isValid) {
                                // invalid email: warn user to check it
                                console.log('Email não existe: ' + email);
                                res.status(400).send([{ msg: 'Não existe este email: ' + email + ' Por favor, corrija!' }]);
                            } else {
                                // valid email :-))
                                console.log('Email EXISTE: ' + email);

                                crypto.randomBytes(20, function(err, buf) {
                                    var newuser = new User();
                                    newuser.name = req.body.name;
                                    newuser.email = email;
                                    //newuser.celular = req.body.celular;
                                    newuser.from_mobile = utils.isMobile(req);
                                    newuser.firstname = utils.getFirstname(req.body.name);
                                    newuser.password = config.defaultpassword;
                                    newuser.unsubscribeToken = buf.toString('hex');
                                    newuser.tags.push({ name: 'ebook' });

                                    newuser.source = {
                                        ip: ip,
                                        browser: browser
                                    };

                                    newuser.save(function(err) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).send([ { msg: 'Erro! Por favor, tente novamente.' } ]);
                                        } else {
                                            // ENVIA EMAIL: FAZER

                                            res.status(200).send('ok');
                                        }
                                    });
                                });
                            }
                        },
                        function(error) {
                            // errors will bubble up through the reject method of the promise.
                            // you'll want to console.log them otherwise it'll fail silently
                            console.log('Erro ao validar email no Neverbounce ' + new Date());
                            console.log('Email: ' + email);
                            console.log(error);
                            res.status(400).send([{ msg: 'Erro ao verificar seu email. Por favor, tente novamente!' }]);
                        });
                }
            }
        });

    },

    unsubscribepage: function(req, res, next) {
        res.render(__dirname + '/../../public/views/unsubscribe.html', {
            env: config.env,
            assets: utils.assets
        });
    },

    unsubscribe: function(req, res, next) {
        req.assert('id', 'Por favor, informe o motivo do cancelamento!').notEmpty();
        req.assert('motivo', 'Por favor, informe o motivo do cancelamento!').notEmpty();

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                var errors = result.array();
                return res.status(400).send(errors[0].msg);
            }

            var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
            var browser = req.headers['user-agent'];

            User.findOne({ unsubscribeToken: req.body.id }, function(err, user) {
                if (err) {
                    console.log(err);
                    res.status(400).send('Erro ao descadastrar seu email. ' +
                        'Por favor, tente mais tarde ou entre em contato no email suporte@drrocha.com.br');
                } else {
                    if (user) {
                        user.unsubscribeToken = undefined;
                        user.unsubscribed = {
                            motivo: req.body.motivo,
                            data: new Date(),
                            ip: ip,
                            browser: browser
                        };

                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Email descadastrado da lista VIP: ' + user.email + ' ' + new Date());
                            }

                            res.status(200).send('Seu email foi retirado da lista VIP!');
                        });
                    } else {
                        res.status(200).send('Seu email já foi retirado da lista VIP anteriormente!');
                    }
                }
            });
        });
    },


    forgotpage: function(req, res, next) {
        res.render(__dirname + '/../../public/views/forgot.html', {
            env: config.env,
            assets: utils.assets
        });
    },


    // Send email to recover the lost password
    forgot: function(req, res) {
        var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        var browser = req.headers['user-agent'];

        crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');

            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    res.status(400).send('Usuário não encontrado com ' +
                        req.body.email + '. Para ajuda, envie um email para suporte@drrocha.com.br');
                } else {
                    console.log('TESTE: ' + user.paid);
                    if (user.paid) {
                        user.resetSource.ip = ip;
                        user.resetSource.browser = browser;
                        user.resetSource.data = new Date();
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + (3 * 86400000); // 3 * 24 hours to expire

                        user.save(function(err) {
                            if (err) console.log(err);
                            res.status(200).send('Enviamos um email para você recuperar a sua senha. Confira lá.');
                        });

                        // send email to user
                        var frase1 = 'Oi, ' + user.firstname + '!';
                        var frase2 = 'Recebemos uma solicitação para recuperar a sua senha.' +
                            ' Se você não solicitou isto, desconsidere este email.';
                        var frase3 = 'Para criar uma nova senha, use o link:';
                        var frase4 = '<a href="' + config.hostname + '/reset?token=' + token + '">Criar Nova Senha</a>';
                        var frase5 = 'Qualquer dúvida, responda este email.';
                        var frase6 = 'Suporte Dr. Rocha';

                        var fraseT1 = 'Oi, ' + user.firstname + '!';
                        var fraseT2 = 'Recebemos uma solicitação para recuperar a sua senha.' +
                            ' Se você não solicitou isto, desconsidere este email.';
                        var fraseT3 = 'Para criar uma nova senha, use o link:';

                        var fraseT4 = 'Criar nova senha: ' + config.hostname + '/reset?token=' + token;
                        var fraseT5 = 'Qualquer dúvida, responda este email.';
                        var fraseT6 = 'Suporte Dr. Rocha';

                        var text =
                            fraseT1 + '\n\n' +
                            fraseT2 + '\n\n' +
                            fraseT3 + '\n\n' +
                            fraseT4 + '\n\n' +
                            fraseT5 + '\n\n' +
                            fraseT6 + '\n\n';

                        var frases = [];
                        frases.push(frase1);
                        frases.push(frase2);
                        frases.push(frase3);
                        frases.push(frase4);
                        frases.push(frase5);
                        frases.push(frase6);

                        swig.renderFile(__dirname + '/../email_template/default.html', {
                            frases: frases,
                            unsubscribeUrl: config.hostname + '/unsubscribe?id=' + user.unsubscribeToken
                        }, function (err, data) {
                            if (err) console.log(err);
                            console.log('Sending email to: ' + user.name + ' ' + user.email);

                            utils.enviaEmail(user.name, user.email, null, 'Recuperar Senha', text, data, user._id,
                                'forgot_passwd', function(err, result) {

                                });
                        });
                    } else {
                        // redirecionar para a página de vendas
                        res.status(400).send('Você ainda não se inscreveu no Hot Importador!');
                    }
                }
            });
        });

    },

    // Checks if reset token is still valid
    resetpage: function(req, res) {
        User.findOne({ resetPasswordToken: req.query.token, resetPasswordExpires: { $gt: new Date() } },
            function(err, user) {
                if (!user) {
                    // Token para recuperação de senha inválido ou expirado
                    res.redirect('/forgot' );
                } else {
                    res.render(__dirname + '/../../public/views/reset.html', {
                        env: config.env,
                        assets: utils.assets,
                        token: req.query.token
                    });

                }
            });
    },


    // Reset lost password
    resetpassword: function(req, res) {
        var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        var browser = req.headers['user-agent'];

        User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: new Date() } },
            function(err, user) {
                if (!user) {
                    //Password reset token is invalid or has expired
                    res.redirect('/forgot' );
                } else {
                    req.assert('password', 'Sua senha deve ter entre 4 e 20 caracteres.').len(4, 20);
                    req.assert('confirmPassword', 'A nova senha não confere.').equals(req.body.password);

                    req.getValidationResult().then(function(result) {
                        if (!result.isEmpty()) {
                            return res.status(400).send('A nova senha não confere. Verique!');
                        }

                        user.password = req.body.password;
                        user.updated = new Date();

                        user.source.ip = ip;
                        user.source.browser = browser;

                        // comment the next 2 lines for testing purposes. It avoids sending reset emails
                        // don't forget to comment resetPasswordExpires above. Otherwise, it wont work after X hours.
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            // fazer já entrar no sistema
                            var now = new Date();

                            var simpleuser = {
                                _id: user._id,
                                updated: user.updated,
                                exp: now.setDate(now.getDate() + 7)
                            };

                            var token = jwt.encode(simpleuser, config.secret);
                            // return the information including token as JSON
                            res.json({
                                token: token,
                                user: user.toJSON()
                            });
                        });

                        // send email to user
                        var frase1 = 'Oi, ' + user.firstname + '!';
                        var frase2 = 'Sua senha foi alterada no Portal Dr. Rocha.';
                        var frase3 = '<b>Nova senha:</b> ' + req.body.password;
                        var frase4 = 'Suporte Dr. Rocha';

                        var fraseT1 = 'Oi, ' + user.firstname + '!';
                        var fraseT2 = 'Sua senha foi alterada no Portal Dr. Rocha.';
                        var fraseT3 = 'Nova senha: ' + req.body.password;
                        var fraseT4 = 'Suporte Dr. Rocha';

                        var text =
                            fraseT1 + '\n\n' +
                            fraseT2 + '\n\n' +
                            fraseT3 + '\n\n' +
                            fraseT4 + '\n\n';

                        var frases = [];
                        frases.push(frase1);
                        frases.push(frase2);
                        frases.push(frase3);
                        frases.push(frase4);

                        swig.renderFile(__dirname + '/../email_template/default.html', {
                            frases: frases,
                            unsubscribeUrl: config.hostname + '/unsubscribe?id=' + user.unsubscribeToken
                        }, function (err, data) {
                            if (err) console.log(err);

                            utils.enviaEmail(user.name, user.email, null, 'Senha Alterada', text, data, user._id,
                                'passwd_changed', function(err, result) {

                                });

                        });
                    });
                }
            });
    },


    updateconta: function(req, res) {
       //console.log(req.body);
        console.log("--------------------------------------");
        req.assert('name', 'Informe seu nome completo.').len(8,100);
        req.assert('email', 'Informe um email válido').isEmail();
        req.assert('celular', 'Informe seu número de WhatsApp com DDD.').len(11,11);

        // validação de celular
        //console.log('Validação de celular: ' + req.body.celular);
        var checkCelular = ddd.consultaCelular(req.body.celular);
        //console.log('Status do celular: ' + checkCelular);

        if (checkCelular !== 'ok') {
            return res.status(400).send(checkCelular);
        }

        var updatePassword = false;

        if (req.body.password) {
            req.assert('password', 'A nova senha deve ter entre 6 e 20 caracteres.').len(4, 20);
            req.assert('confirmPassword', 'A nova senha não confere.').equals(req.body.password);
            updatePassword = true;
        }

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                return res.status(400).send(result.array());
            }

            var token = utils.getToken(req.headers, null);
            //console.log('aqui o token: ' + token);

            if (token) {
                var decoded = jwt.decode(token, config.secret);
                //console.log(decoded);

                User.findOne({
                    _id: decoded._id
                }, function(err, user) {
                    if (err) throw err;

                    if (!user) {
                        return res.status(403).send('Falha na autenticação do usuário.');
                    } else {
                        // update user
                        user.name = req.body.name;
                        user.firstname = utils.getFirstname(req.body.name);
                        if (updatePassword) user.password = req.body.password;
                        user.updated = new Date();
                        user.celular = req.body.celular;
                        var email = req.body.email.toLowerCase();
                        email = email.trim();

                        if (user.bypass) user.bypass = false;

                        if (user.email !== email) {
                            var NeverBounce = require('neverbounce')({
                                apiKey: config.emailvalidator.user,
                                apiSecret: config.emailvalidator.pass
                            });

                            NeverBounce.single.verify(email).then(
                                function(result) {
                                    console.log('Checking Email on Neverbounce: ' + email);
                                    console.log(result);
                                    var invalid = result.is(1);

                                    if (invalid) {
                                        // invalid email: warn user to check it
                                        res.status(400).send('O email ' + email + ' NÃO existe! Por favor, corrija!');
                                    } else {
                                        user.email = email;
                                        user.emailStatus = 'ok';

                                        // generate new token
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(403).send(err);

                                            } else {
                                                var now = new Date();

                                                var simpleuser = {
                                                    _id: user._id,
                                                    updated: user.updated,
                                                    exp: now.setDate(now.getDate() + 7)
                                                };

                                                var token = jwt.encode(simpleuser, config.secret);
                                                // return the information including token as JSON
                                                res.json({
                                                    token: token,
                                                    user: user.toJSON()
                                                });
                                            }
                                        });
                                    }
                                },
                                function(error) {
                                    console.log('Erro ao validar email no Neverbounce ' + new Date());
                                    console.log('Email: ' + email);
                                    console.log(error);
                                    res.status(400).send('Erro ao validar seu email. Por favor, tente mais tarde!');
                                });
                        } else {


                            // generate new token
                            user.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    return res.status(403).send(err);

                                } else {
                                    var now = new Date();

                                    var simpleuser = {
                                        _id: user._id,
                                        updated: user.updated,
                                        exp: now.setDate(now.getDate() + 7)
                                    };

                                    var token = jwt.encode(simpleuser, config.secret);
                                    // return the information including token as JSON
                                    res.json({
                                        token: token,
                                        user: user.toJSON()
                                    });

                                }
                            });




                        }
                    }
                });
            } else {
                return res.status(403).send('Falha na autenticação do usuário.');
            }
        });
    },


    updatecpf: function(req, res) {
        console.log(req.body);
        req.assert('cpf', 'Por favor, informe o seu CPF.').len(11,11);

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                return res.status(400).send(result.array());
            }

            if (!receitafederal.cpfvalido(req.body.cpf)) {
                return res.status(400).send([{ msg: 'CPF inválido. Por favor, informe o número correto!' }]);
            }

            var token = utils.getToken(req.headers, null);
            console.log('aqui o token: ' + token);

            if (token) {
                var decoded = jwt.decode(token, config.secret);
                console.log(decoded);

                User.findOne({
                    _id: decoded._id
                }, function(err, user) {
                    if (err) throw err;

                    if (!user) {
                        return res.status(403).send('Falha na autenticação do usuário.');
                    } else {
                        // update user
                        user.cpf = req.body.cpf;
                        user.updated = new Date();

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                                return res.status(403).send(err);

                            } else {
                                var now = new Date();

                                var simpleuser = {
                                    _id: user._id,
                                    updated: user.updated,
                                    exp: now.setDate(now.getDate() + 7)
                                };

                                var token = jwt.encode(simpleuser, config.secret);
                                // return the information including token as JSON
                                res.json({
                                    token: token,
                                    user: user.toJSON()
                                });
                            }
                        });
                    }
                });
            } else {
                return res.status(403).send('Falha na autenticação do usuário.');
            }
        });
    },


    mailgun: function(req, res, next) {
        console.log('Mailgun Webhook ' + new Date());
        console.log(req.body);

        var mailgun = new Mailgun();
        mailgun.dados = req.body;

        mailgun.save(function(err) {
            if (err) {
                res.status(400).send('err');
            } else {
                res.status(200).send();
            }
        });

        var dados = req.body;
        var msgid;
        var isnormal = false;

        if (dados.event === 'delivered') {
            msgid = dados['Message-Id'];
            msgid = msgid.replace(/[<>]/g, '');
            isnormal = true;
        }

        if ((dados.event === 'opened') || (dados.event === 'clicked')) {
            msgid = dados['message-id'];
            isnormal = true;
        }

        if (isnormal) {
            Email.findOne({ msgid: msgid }, function(err, email) {
                if (err) throw err;

                if (email) {
                    if (!email.events) email.events = [];
                    var event = req.body;
                    event.at = new Date();
                    email.events.push(event);

                    email.save(function(err) {
                        if (err) console.log(err);
                    });
                }
            });
        } else {
            if ((dados.event === 'bounced') || (dados.event === 'complained')) {
                Email.findOne({ email: dados.recipient }, function(err, email) {
                    if (err) throw err;

                    if (email) {
                        if (!email.events) email.events = [];
                        var event = req.body;
                        event.at = new Date();
                        email.events.push(event);

                        email.save(function(err) {
                            if (err) console.log(err);
                        });
                        User.findOne({ email: dados.recipient }, function(err, user) {
                            if (err) throw err;

                            if (user) {
                                user.emailStatus = dados.event;

                                user.save(function(err) {
                                    if (err) console.log(err);
                                });
                            }
                        });
                    }
                });
            }
        }

        res.status(200).send();
    },

    hotmartpage: function(req, res) {

        res.render(__dirname + '/../../public/views/hotmart.html', {
            env: config.env,
            assets: utils.assets
        });


        setInterval(function() {


        //CAPTURA DE DADOS

        var dados;

        function usuarioHotmart() {
            return axios.post("https://drrocha.com.br/callbacks/posteste.txt");
        }

        dados = usuarioHotmart();
        dados.then(function (resposta) {
            var usuhotmart = resposta.data;
            var dadoshotmart = usuhotmart.toString().replace('"', '');


            function replaceAll(string, token, newtoken) {
                while (string.indexOf(token) != -1) {
                    string = string.replace(token, newtoken);
                }
                return string;
            }

            dadoshotmart = replaceAll(dadoshotmart, '"', '');




            //RETORNA QUANTIDADE DE REGISTROS - GERAL ----------------------------------------
            var tam_dados_ = dadoshotmart.length;
            var e_ = 0;
            var qtd_registros = 0;

            for (e_; e_ < tam_dados_; e_++) {

                if (dadoshotmart[e_] == '-') {
                    var qtdfre = parseInt(e_) + parseInt(39);
                    var string_pos = dadoshotmart.substring(e_, qtdfre);
                    if (string_pos == '---------------------------------------') {
                        qtd_registros++
                    }
                }
            }



            //RETORNA QUANTIDADE DE REQUISITOS - GERAL ----------------------------------------
            var tam_dados = dadoshotmart.length;
            var e = 0;
            var qtd_requisitos = 0;

            for (e; e < tam_dados; e++) {
                if (dadoshotmart[e] == '#') {
                    qtd_requisitos++;
                }

            }


            var recolhe_dado = dadoshotmart.split("#");
            var del_posicao = 0;
            var pos_grupo = 0;
            var dados_hot = [];
            var descartavel = [];

            for (var cont = 1; cont <= qtd_requisitos; cont++) {
                if (del_posicao != 9) {
                    if (del_posicao == 0) {
                        var status = recolhe_dado[cont];
                    }
                    if (del_posicao == 1) {
                        var transacao = recolhe_dado[cont];
                    }
                    if (del_posicao == 2) {
                        var nomecli = recolhe_dado[cont];
                    }
                    if (del_posicao == 3) {
                        var emailcli = recolhe_dado[cont];
                    }
                    if (del_posicao == 4) {
                        var documento = recolhe_dado[cont];
                    }
                    if (del_posicao == 5) {
                        var produto = recolhe_dado[cont];
                    }
                    if (del_posicao == 6) {
                        var nomprod = recolhe_dado[cont];
                    }
                    if (del_posicao == 7) {
                        var dt_pedido = recolhe_dado[cont];
                    }
                    if (del_posicao == 8) {
                        var dt_libcompra = recolhe_dado[cont];
                    }

                    del_posicao++;
                } else {

                    if (nomprod.slice(0, 17) != 'Dr. Rocha Com Voc') {
                        var igual = 'a';
                        status = '';
                        transacao = '';
                        nomecli = '';
                        emailcli = '';
                        documento = '';
                        produto = '';
                        nomprod = '';
                        dt_pedido = '';
                        dt_libcompra = '';

                    }

                    dados_hot[pos_grupo] = {
                        status: status,
                        transacao: transacao,
                        cliente: nomecli,
                        email: emailcli,
                        cpf: documento,
                        idprod: produto,
                        nomeprod: nomprod,
                        dtpedido: dt_pedido,
                        dtlibcom: dt_libcompra
                    };

                    pos_grupo++;

                    del_posicao = 0;
                    status = '';
                    transacao = '';
                    nomecli = '';
                    emailcli = '';
                    documento = '';
                    produto = '';
                    nomprod = '';
                    dt_pedido = '';
                    dt_libcompra = '';

                }
            }


            var qtd = dados_hot.length;
            var contar = 0;
            var dados_pesquisa = [];

            for (i = 0; i < qtd; i++) {

                // RECEBE TODOS OS DADOS
                var status    = dados_hot[i].status;
                var transacao = dados_hot[i].transacao;
                var cliente   = dados_hot[i].cliente;
                var email     = dados_hot[i].email;
                var documento = dados_hot[i].cpf;
                var idprod    = dados_hot[i].idprod;
                var nomeprod  = dados_hot[i].nomeprod;
                var dtpedido  = dados_hot[i].dtpedido;
                var dtlibcom  = dados_hot[i].dtlibcom;

                dados_pesquisa[contar] = {
                    status: status,
                    transacao: transacao,
                    nomecli: cliente,
                    emailcli: email,
                    documento: documento,
                    produto: idprod,
                    nomprod: nomeprod,
                    dtpedido: dtpedido,
                    dtlibcom: dtlibcom
                };


                contar++;
            }



            var newarray = [];
            var conta = 0;

            for (var i = 0; i < dados_pesquisa.length; i++) {
                if (dados_pesquisa[i].nomecli != '') {
                    newarray[conta] = {
                        status: dados_pesquisa[i].status,
                        transacao: dados_pesquisa[i].transacao,
                        nomecli: dados_pesquisa[i].nomecli,
                        emailcli: dados_pesquisa[i].emailcli,
                        documento: dados_pesquisa[i].documento,
                        produto: dados_pesquisa[i].produto,
                        nomprod: dados_pesquisa[i].nomprod,
                        dtpedido: dados_pesquisa[i].dtpedido,
                        dtlibcom: dados_pesquisa[i].dtlibcom
                    }
                    conta++;
                }
            }

            var rep = [];
            var dado_separado;
            var index;

            for (dado_separado in newarray) {

                var numero = dado_separado;
                var status = newarray[dado_separado].status;
                var transacao = newarray[dado_separado].transacao;
                var nomecli = newarray[dado_separado].nomecli;
                var emailcli = newarray[dado_separado].emailcli;
                var documento = newarray[dado_separado].documento;
                var produto = newarray[dado_separado].produto;
                var nomprod = newarray[dado_separado].nomprod;
                var dtpedido = newarray[dado_separado].dtpedido;
                var dtlibcom = newarray[dado_separado].dtlibcom;

                cadusu(newarray[dado_separado]);
            }


            function teste(dado){
                Userproduto.findOne({'userid' : acerto[0]._id}, function(err, dprod){
                    if(err){
                        console.log('erro');
                    }else{
                        console.log('aqui');
                        console.log(dprod);
                        dprod.status    = dados.status;
                        dprod.transacao = dados.transacao;
                        dprod.dtpedido  = dados.dt_pedido;
                        dprod.save();
                    }
                })
            }

            function cadusu(requisito) {

                if(requisito.status == 'approved' || requisito.status == 'refunded' || requisito.status == 'expired'){

                    User.findOne({doc: requisito.documento}, function (err, userr) {
                        if (!userr) {

                            if(requisito.documento != '') {
                                var user = new User();
                                user.cadHotmartUser(requisito);
                            }

                        } else {

                            User.findOne({doc: requisito.documento}, function(err, usu){
                                if(!usu){
                                    console.log(err);
                                }else{
                                    //TRATAMENTO DE DATA--------------------------------------------------------------------
                                    var substituir = "\\";
                                    var post_libcom     = (replaceAll(requisito.dtlibcom, substituir, ""));
                                    var colecao_libecom = (replaceAll(usu.dt_libcom, substituir, ""));
                                    //---------------------------------------------------------------------------------------

                                    if(usu.c_prod == "N"){
                                        usu.c_prod = "Y";
                                        usu.save();

                                        cadprod(usu);
                                    }

                                    if(colecao_libecom < post_libcom){
                                        usu.status    = requisito.status;
                                        usu.transacao = requisito.transacao;
                                        usu.dt_pedido = requisito.dtpedido;
                                        usu.dt_libcom = requisito.dtlibcom;
                                        usu.save();
                                        console.log('ATUALZIAÇÃO DE USUÁRIO');
                                        console.log('ESTES DADOS: ' + usu.name + ' - ' + usu.status + ' - ' + usu.transacao + ' - ' + usu.dt_pedido);

                                        var ver = '164391' + usu.email;
                                        Userproduto.findOne({'verifica' : ver}, function(err, produto){
                                            if(!produto){
                                                console.log('NÃO HÁ PRODUTO LIBERADO PARA ESTE USUÁRIO');
                                            }else{
                                                produto.status    = usu.status;
                                                produto.transacao = usu.transacao;
                                                produto.dtpedido  = usu.dt_pedido;
                                                produto.dtlibcom    = usu.dt_libcom;
                                                produto.save();
                                                console.log('ATUALZIAÇÃO DE PRODUTO');
                                                console.log('ESTES DADOS: ' + produto.status + ' - ' + produto.transacao + ' - ' + produto.dtpedido + ' - ' + produto.dtlibcom);
                                            }
                                        })
                                    }

                                    cadprod(usu);
                                }
                            })

                        }



                    });


                }



            }


            function cadprod(dados){

                    User.findOne({'doc' : dados.doc}).exec(function(err, cad){
                        if(!cad){
                            console.log('NÃO EXISTE DADOS');
                        }else{
                            //var produto = new Userproduto();
                            //produto.cadHotmartProd(cad);
                        }
                    })

            }

        console.log('-------------------- Passou!!!');

        })

    }, 15000)


    }



};







