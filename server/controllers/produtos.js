
'use strict';


var Userproduto = require('../models/userproduto'),
    User = require('../models/user'),
    Produto = require('../models/produto'),
    jwt = require('jwt-simple'),
    chance = require('chance').Chance(),
    mongoose = require('mongoose'),
    config = require('../../config/env'),
    panels = require('../../config/panels'),
    utils = require('../../config/utils');







module.exports = {

    produtopage: function(req, res) {
        var token = utils.getToken(req.headers, req.query.token);

        if (token) {
            var decoded = jwt.decode(token, config.secret);
            Userproduto.
            findOne({
                userid: mongoose.Types.ObjectId(decoded._id),
                produtokey:  req.params.keyword
            }).
            exec(function(err, userproduto){
                if (err) {
                    console.log(err);
                    return res.status(400).send('Falha ao carregar produto.');
                } else {
                    if (!userproduto) {
                        return res.status(400).send('Produto não existe.');
                    } else {
                        res.render(__dirname + '/../../public/views/produtos/' + userproduto.produtokey + '/produto.html', {
                            env: config.env,
                            assets: utils.assets,
                            keyword: userproduto.produtokey
                        });
                    }
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    },

    modulopage: function(req, res) {
        var token = utils.getToken(req.headers, req.query.token);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Userproduto.
            findOne({
                userid: mongoose.Types.ObjectId(decoded._id),
                produtokey:  req.params.keyword
            }).
            exec(function(err, userproduto){
                if (err) {
                    console.log(err);
                    return res.status(400).send('Falha ao carregar produto.');
                } else {
                    if (!userproduto) {
                        return res.status(400).send('Produto não existe.');
                    } else {
                        res.render(__dirname + '/../../public/views/produtos/' + userproduto.produtokey + '/' +
                            req.params.modulo + '/modulo.html',
                            {
                                env: config.env,
                                assets: utils.assets,
                                keyword: userproduto.produtokey,
                                modulo: req.params.modulo
                            });
                    }
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    },

    conteudopage: function(req, res) {
        var token = utils.getToken(req.headers, req.query.token);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Userproduto.
            findOne({
                userid: mongoose.Types.ObjectId(decoded._id),
                produtokey:  req.params.keyword
            }).
            exec(function(err, userproduto){
                if (err) {
                    console.log(err);
                    return res.status(400).send('Falha ao carregar produto.');
                } else {
                    if (!userproduto) {
                        return res.status(400).send('Produto não existe.');
                    } else {
                        res.render(__dirname + '/../../public/views/produtos/' + userproduto.produtokey + '/' +
                            req.params.modulo + '/' + req.params.conteudo + '.html',
                            {
                                env: config.env,
                                assets: utils.assets,
                                keyword: userproduto.produtokey,
                                modulo: req.params.modulo
                            });
                    }
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    },

    obrigadopage: function(req, res) {
        Produto.
        findOne({
            keyword:  req.params.produto
        }).
        exec(function(err, produto){
            if (err) {
                console.log(err);
                return res.status(400).send('Falha ao carregar produto.');
            } else {
                if (!produto) {
                    return res.status(400).send('Produto não existe.');
                } else {
                    res.render(__dirname + '/../../public/views/produtos/' + req.params.produto + '/obrigado.html',
                        {
                            env: config.env,
                            assets: utils.assets,
                            keyword: req.params.produto
                        });
                }
            }
        });
    },

    getvitrine: function(req, res) {

        var token = utils.getToken(req.headers, req.query.token);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Userproduto.
            find({
                userid: mongoose.Types.ObjectId(decoded._id),
                active:  true
            }).
            exec(function(err, userprodutos){
                if (err) {
                    console.log(err);
                    return res.status(400).send('Falha ao carregar produtos.');
                } else {
                    var purchased = [];
                    for (var i = 0; i < userprodutos.length; i++) {
                        purchased.push(userprodutos[i].produtoid);
                    }

                    Produto.
                    find({
                        _id: { $nin: purchased }
                    }).
                    exec(function(err, produtos){
                        if (err) {
                            console.log(err);
                            return res.status(400).send('Falha ao carregar produtos.');
                        } else {
                            panels.buildVitrine(produtos, function (data) {
                                res.status(200).send(data);
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    },

    getnova: function(req, res) {
        var token = utils.getToken(req.headers, req.query.token);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Userproduto.
            find({
                userid: mongoose.Types.ObjectId(decoded._id),
                active:  true
            }).
            exec(function(err, userprodutos){
                if (err) {
                    console.log(err);
                    return res.status(400).send('Falha ao carregar produtos.');
                } else {
                    var purchased = [];
                    for (var i = 0; i < userprodutos.length; i++) {
                        purchased.push(userprodutos[i].produtoid);
                    }

                    Produto.
                    find({
                        _id: { $nin: purchased }
                    }).
                    exec(function(err, produtos){
                        if (err) {
                            console.log(err);
                            return res.status(400).send('Falha ao carregar produtos.');
                        } else {
                            panels.buildNova(produtos, function (data) {
                                res.status(200).send(data);
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    }
    
    


};






