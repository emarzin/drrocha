
'use strict';


var config = require('../../config/env'),
    jwt = require('jwt-simple'),
    User = require('../models/user'),
    Produto = require('../models/produto'),
    Userproduto = require('../models/userproduto'),
    Postback = require('../models/postback'),
    utils = require('../../config/utils'),
    mongoose = require('mongoose'),
    async = require('async'),
    accounting = require('accounting'),
    swig = require('swig'),
    crypto = require('crypto'),
    chance = require('chance').Chance(),
    panels = require('../../config/panels');






function getTelefones(telefone) {
    var result = {
        fixo: '',
        celular: '', // 9 dígitos (novo)
        celular2: '', // 8 dígitos (antigo)
        tipo: ''
    };
    // limpa caracteres não numéricos
    telefone = telefone.replace(/\D/g,'');

    if (telefone.length >= 10) {
        // verifica se primeiro dígito no DDD é 0
        var digito = telefone.substr(0,1);
        if (digito === '0') telefone = telefone.substr(1);

        var digitos = telefone.length;
        var ddd = telefone.substr(0,2);
        var primeiroDigito = telefone.substr(2,1);

        if ((primeiroDigito === '2') || (primeiroDigito === '3') || (primeiroDigito === '4') || (primeiroDigito === '5')) {
            // número fixo
            result.fixo = telefone;
            result.tipo = 'fixo';
        } else {
            // celular
            if (digitos === 11) {
                result.celular = telefone;
                result.celular2 = ddd + telefone.substr(3);
            }

            if (digitos === 10) {
                result.celular = ddd + '9' + telefone.substr(2);
                result.celular2 = telefone;
            }

            result.tipo = 'celular';
        }
    } else {
        // número de telefone faltando dígitos
        result.celular = telefone;
    }

    return result;
}



function translatePostback(req, user, produto, callback) {
    var postback = new Postback();
    postback.userid = user._id;
    postback.data = req.body;
    postback.produto = produto.nome;
    postback.produtoid = produto._id;
    postback.source = 'venda';
    postback.plataforma = produto.plataforma;
    postback.produtocodigo = produto.codigo;
    postback.produtotipo = produto.tipo;

    postback.cliente = {};
    postback.venda = {};
    postback.assinatura = {};

    if (produto.plataforma === 'Hotmart') {
        if (req.body.name) postback.cliente.nome = req.body.name;
        if (req.body.email) {
            postback.cliente.email = req.body.email;
            postback.cliente.email = postback.cliente.email.toLowerCase();
            postback.cliente.email = postback.cliente.email.trim();
        }

        if (req.body.phone_local_code && req.body.phone_number) {
            var telefones_hotmart = getTelefones(req.body.phone_local_code + req.body.phone_number);
            postback.cliente.celular = telefones_hotmart.celular;
            postback.cliente.celular2 = telefones_hotmart.celular2;
            postback.cliente.fixo = telefones_hotmart.fixo;
        }

        if (req.body.doc) {
            postback.cliente.doc = req.body.doc;
            if (postback.cliente.doc.length >= 12) {
                postback.cliente.doc_tipo = 'CNPJ';
            } else {
                postback.cliente.doc_tipo = 'CPF';
            }
        }

        if (req.body.address_zip_code) {
            postback.cliente.cep = req.body.address_zip_code;
            postback.cliente.cep  = postback.cliente.cep.replace(/\D/g,'');
        }
        if (req.body.address) postback.cliente.endereco = req.body.address;
        if (req.body.address_number) postback.cliente.numero = req.body.address_number;
        if (req.body.address_comp) postback.cliente.complemento = req.body.address_comp;
        if (req.body.address_district) postback.cliente.bairro = req.body.address_district;
        if (req.body.address_city) postback.cliente.cidade = req.body.address_city;
        if (req.body.address_state) postback.cliente.estado = req.body.address_state;
        if (req.body.address_country) postback.cliente.pais = req.body.address_country;

        if (req.body.transaction) postback.venda.codigo = req.body.transaction;

        if (req.body.payment_type) {
            if (req.body.payment_type === 'billet') postback.venda.formaPagamento = 'Boleto';
            if (req.body.payment_type === 'credit_card') postback.venda.formaPagamento = 'Cartão de crédito';
            if (req.body.payment_type === 'bank_transfer') postback.venda.formaPagamento = 'Cartão de crédito';
            if (req.body.payment_type === 'bcash_balance') postback.venda.formaPagamento = 'Cartão de crédito';
            if (req.body.payment_type === 'paypal') postback.venda.formaPagamento = 'Cartão de crédito';
        }

        if (req.body.status) {
            if (req.body.status === 'billet_printed') postback.venda.status = 'Aguardando pagamento';
            if (req.body.status === 'canceled') postback.venda.status = 'Cancelada';
            if (req.body.status === 'expired') postback.venda.status = 'Cancelada';
            if (req.body.status === 'approved') postback.venda.status = 'Finalizada';
            if (req.body.status === 'refunded') postback.venda.status = 'Devolvida';
            if (req.body.status === 'chargeback') postback.venda.status = 'Devolvida';
            if (req.body.status === 'completed') postback.venda.status = 'Completa';
        }

        if (req.body.refusal_reason) postback.venda.canceladaMotivo = req.body.refusal_reason;

        if (req.body.price) {
            if (typeof req.body.price === 'string') {
                postback.venda.valor = Number(req.body.price);
            } else {
                postback.venda.valor = req.body.price;
            }
        }

        if (req.body.cms_vendor) {
            if (typeof req.body.cms_vendor === 'string') {
                postback.venda.valorRecebido = Number(req.body.cms_vendor);
            } else {
                postback.venda.valorRecebido = req.body.cms_vendor;
            }
        }
        if (req.body.purchase_date) postback.venda.dataInicio = req.body.purchase_date;
        if (req.body.confirmation_purchase_date) postback.venda.dataFinalizada = req.body.confirmation_purchase_date;
        if (req.body.payment_engine) postback.venda.meioPagamento = req.body.payment_engine;
        if (req.body.billet_url) postback.venda.linkBoleto = req.body.billet_url;
        if (req.body.billet_barcode) postback.venda.linha_digitavel = req.body.billet_barcode;

        if (req.body.aff) postback.venda.aff = req.body.aff;

        if (req.body.aff_name) {
            var indexName = req.body.aff_name.indexOf(';');
            if (indexName > -1) {
                var aff_names = req.body.aff_name.split(';');
                postback.venda.aff_name = aff_names[0];
            } else {
                postback.venda.aff_name = req.body.aff_name;
            }
        }

        if (req.body.cms_aff) {
            if (typeof req.body.cms_aff === 'string') {
                if (!isNaN(req.body.aff_value)) {
                    postback.venda.aff_value = Number(req.body.cms_aff);
                } else {
                    var index = req.body.cms_aff.indexOf(';');
                    if (index > -1) {
                        var cms_aff = req.body.cms_aff.split(';');
                        postback.venda.aff_value = Number(cms_aff[0]);
                    } else {
                        postback.venda.aff_value = 0;
                    }
                }
            } else {
                postback.venda.aff_value = req.body.cms_aff;
            }
        }

        if (req.body.src) postback.venda.src = req.body.src;

        if (req.body.subscribe_code) postback.assinatura.codigo = req.body.subscribe_code;
        if (req.body.subscription_status) postback.assinatura.status = req.body.subscription_status;

    }

    postback.save(function (err) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null, 'ok');
        }
    });

}



function enviaEmailAtivacao(user, password, callback) {
    var frase1 = 'Olá, <b>' + user.firstname + '</b>, aqui é o Dr. Rocha,!';
    var frase2 = 'Estou enviando esse email para parabenizá-lo por sua inscrição, ' +
        'e também para informar os seus dados de acesso.';
    var frase3 = '<a href="' + config.hostname + '/entrar?email=' + user.email + '">==> Entrar no Portal Dr. Rocha</a>';
    var frase4 = 'Seus dados de acesso:';
    var frase5 = '<b>Email:</b> ' + user.email + '<br>' + '<b>Senha:</b> ' + password;
    var frase6 = 'Obrigado pela confiança e bons estudos!';
    var frase7 = 'Abraços!<br>Dr. Rocha';

    var fraseT1 = 'Olá, ' + user.firstname + ', aqui é o Dr. Rocha,!';
    var fraseT2 = 'Estou enviando esse email para parabenizá-lo por sua inscrição, ' +
        'e também para informar os seus dados de acesso.';
    var fraseT3 =  config.hostname + '/entrar';
    var fraseT4 = 'Seus dados de acesso:';
    var fraseT5 = 'Email: ' + user.email + '\n' + 'Senha: ' + password;
    var fraseT6 = 'Obrigado pela confiança e bons estudos!';
    var fraseT7 = 'Abraços!\nDr. Rocha';

    var text =
        fraseT1 + '\n\n' +
        fraseT2 + '\n\n' +
        fraseT3 + '\n\n' +
        fraseT4 + '\n\n' +
        fraseT5 + '\n\n' +
        fraseT6 + '\n\n' +
        fraseT7;

    var frases = [];
    frases.push(frase1);
    frases.push(frase2);
    frases.push(frase3);
    frases.push(frase4);
    frases.push(frase5);
    frases.push(frase6);
    frases.push(frase7);

    var subject = 'Acesso ao Portal';

    // envia SMS
    var msg = user.firstname + ', aqui eh o Dr. Rocha! ' +
        'Acesse www.portaldrrocha.com.br com a senha ' + password;

    utils.sendSMS(user.celular, msg, user._id, 'user_ativado', null, function(err, result) {
        console.log('SMS sent (user ativado): ' + user.name + ' ' + user.celular);
    });


    swig.renderFile(__dirname + '/../email_template/default.html', {
        frases: frases,
        unsubscribeUrl: config.hostname + '/unsubscribe?id=' + user.unsubscribeToken
    }, function (err, html) {
        if (err) console.log(err);
        console.log('Sending email to: ' + user.name + ' ' + user.email);

        utils.enviaEmail(user.firstname, user.email, config.testing.emailaddress, subject,
            text, html, user._id, 'user_activated', function(err, result) {

                return callback('ok');

            });
    });

}



function ativaProduto(user, password, produto, callback) {

    Userproduto.findOne({
        userid: user._id,
        produtoid: produto._id
    }, function(err, userproduto) {
        if (err) {
            console.log(err);
        } else {
            if (userproduto) {
                console.log('existe userproduto');

                userproduto.active = true;

                userproduto.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (password) {
                            enviaEmailAtivacao(user, password, function(result) {
                                console.log(result);
                            });
                        }

                        callback(null, 'ok');
                    }
                });
            } else {
                console.log('NAO existe userproduto');

                var new_userproduto = new Userproduto();

                new_userproduto.userid = user._id;
                new_userproduto.produtoid = produto._id;
                new_userproduto.produtokey = produto.keyword;
                new_userproduto.teste = user._id;


                for (var i = 0; i < produto.modulos.length; i++) {
                    var progresso = {
                        keyword: produto.modulos[i].keyword,
                        conteudos: []
                    };

                    if (produto.modulos[i].deliver_after > 0) {
                        var today = new Date();
                        today = new Date(today.setDate(today.getDate() + produto.modulos[i].deliver_after));
                        today = new Date(today.setHours(2,0,0,0));
                        progresso.deliver_after = today;
                        progresso.deliver_after_str = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
                        progresso.status = 'blocked';
                    } else {
                        progresso.status = 'free';
                    }

                    new_userproduto.mod_progressos.push(progresso);
                }

                console.log('bbbbb');

                new_userproduto.save(function(err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    } else {
                        console.log('cccc');
                        if (password) {
                            enviaEmailAtivacao(user, password, function(result) {
                                console.log(result);
                            });
                        }

                        callback(null, 'ok');
                    }
                });
            }
        }
    });

}




function desativaProduto(user, produto, callback) {
    Userproduto.findOne({
        userid: user._id,
        produtoid: produto._id
    }, function(err, userproduto) {
        if (err) {
            console.log(err);
        } else {
            if (userproduto) {
                userproduto.active = false;

                userproduto.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback('ok');
                    }
                });
            } else {
                callback('ok');
            }
        }
    });

}



function processPostBack(req, res, action) {

    Produto.findOne({
        codigo: req.body.prod + ''
    }, function(err, produto) {
        if (err) {
            console.log(err);
        } else {
            if (produto) {
                var email_pagamento = '';

                if (req.body.email) {
                    email_pagamento = req.body.email;
                    email_pagamento = email_pagamento.trim();
                    email_pagamento = email_pagamento.toLowerCase();
                }

                if (action === 'ativar') {
                    User.findOne({
                        email_pagamento: email_pagamento
                    }, function (err, user) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (user) {
                                user.bypass = true;

                                if (req.body.doc) {
                                    user.doc = req.body.doc;
                                    if (user.doc.length >= 12) {
                                        user.doc_tipo = 'CNPJ';
                                    } else {
                                        user.doc_tipo = 'CPF';
                                    }
                                }

                                user.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        translatePostback(req, user, produto, function(err, postback) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                // ativa produto
                                                ativaProduto(user, null, produto, function(err, result) {
                                                    return res.status(200).send('ok');
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                crypto.randomBytes(20, function(err, buf) {
                                    var newuser = new User();
                                    newuser.name = req.body.name;
                                    newuser.email = email_pagamento;
                                    newuser.email_pagamento = email_pagamento;
                                    var celular = req.body.phone_local_code + req.body.phone_number;
                                    newuser.celular = celular.replace(/\D/g,'');
                                    newuser.firstname = utils.getFirstname(newuser.name);
                                    var password = chance.string({ length: 6, pool: '0123456789' });
                                    newuser.password = password;
                                    newuser.password_txt = password;
                                    newuser.bypass = true;
                                    newuser.unsubscribeToken = buf.toString('hex');

                                    if (req.body.doc) {
                                        newuser.doc = req.body.doc;
                                        if (newuser.doc.length >= 12) {
                                            newuser.doc_tipo = 'CNPJ';
                                        } else {
                                            newuser.doc_tipo = 'CPF';
                                        }
                                    }

                                    var NeverBounce = require('neverbounce')({
                                        apiKey: config.emailvalidator.user,
                                        apiSecret: config.emailvalidator.pass
                                    });

                                    NeverBounce.single.verify(newuser.email).then(
                                        function(result) {
                                            console.log('Checking Email on Neverbounce: ' + newuser.email);
                                            console.log(result);
                                            var invalid = result.is(1);

                                            if (invalid) {
                                                // invalid email: warn user to check it
                                                newuser.emailStatus = 'invalid';
                                            }

                                            newuser.save(function(err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    console.log('PRE translatePostback 1');

                                                    translatePostback(req, newuser, produto, function(err, result) {
                                                        if (err) {
                                                            console.log('erro 1');
                                                            console.log(err);
                                                        } else {
                                                            console.log('translatePostback DONE');
                                                            console.log(result);
                                                            // ativa produto
                                                            ativaProduto(newuser, password, produto, function(err, result) {
                                                                return res.status(200).send('ok');
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        },
                                        function(error) {
                                            console.log('Erro ao validar email no Neverbounce ' + new Date());
                                            console.log('Email: ' + newuser.email);
                                            console.log(error);

                                            newuser.save(function(err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    console.log('PRE translatePostback 2');
                                                    translatePostback(req, newuser, produto, function(err, postback) {
                                                        if (err) {
                                                            console.log('erro 2');
                                                            console.log(err);
                                                        } else {
                                                            // ativa produto
                                                            ativaProduto(newuser, password, produto, function(err, result) {
                                                                return res.status(200).send('ok');
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                });
                            }
                        }
                    });
                } else {
                    // desativar produto do user
                    User.findOne({
                        email_pagamento: email_pagamento
                    }, function (err, user) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (user) {
                                // desativa curso do user
                                desativaProduto(user, produto, function(err, result) {
                                    return res.status(200).send('ok');
                                });
                            } else {
                                console.log('curso de outra área de membros ' + new Date());
                                return res.status(200).send('ok');
                            }
                        }
                    });
                }
            } else {
                console.log('produto não existe: ' + req.body.prod);
                return res.status(400).send();
            }
        }
    });


}







module.exports = {

    hotmart: function(req, res, next) {
        res.render(__dirname + '/../../public/views/hotmart.html', {
            env: config.env,
            assets: utils.assets
        });
    },

    hotmartt: function(req, res) {
        console.log('POSTBACK Hotmart RECEIVED ' + new Date());
        console.log('req.url: ' + req.url);
        console.log('BODY');
        console.log(req.body);


        if (req.body && req.body.hottok === 'zeedvZMxH87nNyE93B9hmMci6hk3UQ394590') {
            console.log('hottok OK');
            
            var codigo = '';
            var formaPagamento = '';
            var status = '';
            var checkDuplicado = false;
            var action = '';

            // Verifica postbacks duplicados de venda
            if (req.body.transaction && req.body.payment_type && req.body.status  && req.body.prod) {
                // Converter formaPagamento e status
                if (req.body.payment_type === 'billet') formaPagamento = 'Boleto';
                if (req.body.payment_type === 'credit_card') formaPagamento = 'Cartão de crédito';
                if (req.body.payment_type === 'bank_transfer') formaPagamento = 'Cartão de crédito';
                if (req.body.payment_type === 'bcash_balance') formaPagamento = 'Cartão de crédito';
                if (req.body.payment_type === 'paypal') formaPagamento = 'Cartão de crédito';

                if (req.body.status === 'billet_printed') status = 'Aguardando pagamento';
                if (req.body.status === 'canceled') status = 'Cancelada';
                if (req.body.status === 'expired') status = 'Cancelada';
                if (req.body.status === 'approved') status = 'Finalizada';
                if (req.body.status === 'refunded') status = 'Devolvida';
                if (req.body.status === 'chargeback') status = 'Devolvida';

                codigo = '' + req.body.transaction;
            }

            if (req.body.status === 'approved') {
                action = 'ativar';
                checkDuplicado = true;
            }

            if ((req.body.status === 'refunded') || (req.body.status === 'chargeback') || (req.body.subscription_status === 'canceled')) {
                action = 'desativar';
                checkDuplicado = true;
            }


            if (checkDuplicado) {
                Postback.findOne({
                    produtocodigo: '' + req.body.prod,
                    'venda.codigo': codigo,
                    'venda.formaPagamento': formaPagamento,
                    'venda.status': status
                }, function(err, postback) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (postback) {
                            console.log('postback descartado: duplicado');
                            res.status(200).send('ok');
                        } else {
                            processPostBack(req, res, action);
                        }
                    }
                });
            } else {
                var pb = new Postback();
                pb.data = req.body;

                pb.save(function (err) {
                    if (err) console.log(err);
                    res.status(200).send('OK');
                });
            }
        } else {
            res.status(400).send();
        }
    },


    checkpurchase: function(req, res) {
        console.log('checkpurchase');
        console.log(req.query);

        var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        console.log('ip: ' + ip);

        var accept_request = false;
        if (ip.indexOf('127.0.0.1') > -1) accept_request = true;

        if (accept_request) {
            Postback.
            findOne({
                produtocodigo: req.query.prod,
                'venda.codigo': req.query.transaction,
                'venda.status': 'Finalizada'
            }).
            populate('userid').
            exec(function(err, postback){
                if (err) {
                    console.log(err);
                } else {
                    if (postback) {
                        if (postback.userid && postback.userid.bypass) {
                            // bypass password verification
                            var now = new Date();

                            var simpleuser = {
                                _id: postback.userid._id,
                                updated: postback.userid.updated,
                                exp: now.setDate(now.getDate() + 7)
                            };

                            var token = jwt.encode(simpleuser, config.secret);
                            // return the information including token as JSON

                            res.json({
                                status: 'ok',
                                token: token,
                                user: postback.userid.toJSON()
                            });
                        } else {
                            res.json({
                                status: 'no_token'
                            });
                        }
                    } else {
                        res.json({
                            status: 'not_yet'
                        });
                    }
                }
            });
        } else {
            return res.status(400).send();
        }

    }






};



