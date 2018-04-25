
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

    getuserprodutos: function(req, res, next) {
        var token = utils.getToken(req.headers, null);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Userproduto.
            find({
                userid:  mongoose.Types.ObjectId(decoded._id),
                active: true
            }).
            sort({ created: 1 }).
            populate({
                path: 'produtoid'//,
                //select: 'tipo'
            }).
            exec(function(err, userprodutos){
                //console.log("AQUI: "+ userprodutos + ")) FINAL AQUI" );
                if (err) {
                    console.log(err);
                } else {
                    console.log(userprodutos);
                    panels.buildProdutos(userprodutos, function (data) {
                        res.status(200).send(data);
                    });
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    },

    loadaccess: function(req, res, next) {
        var token = utils.getToken(req.headers, null);

        console.log(req.query);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Userproduto.
            findOne({
                userid:  mongoose.Types.ObjectId(decoded._id),
                active: true,
                produtokey: req.query.keyword
            }).
            exec(function(err, userproduto){
                if (err) {
                    console.log(err);
                    res.status(400).send();
                } else {
                    if (userproduto) {
                        var updated = false;

                        for (var i = 0; i < userproduto.mod_progressos.length; i++) {
                            if (userproduto.mod_progressos[i].status === 'blocked') {
                                if (userproduto.mod_progressos[i].deliver_after < new Date()) {
                                    userproduto.mod_progressos[i].deliver_after = undefined;
                                    userproduto.mod_progressos[i].deliver_after_str = undefined;
                                    userproduto.mod_progressos[i].status = 'free';
                                    updated = true;
                                }
                            }
                        }

                        if (updated) {
                            userproduto.save(function(err) {
                                if (err) console.log(err);

                                res.status(200).send(userproduto);
                            });
                        } else {
                            res.status(200).send(userproduto);
                        }
                    } else {
                        res.status(400).send();
                    }
                }
            });
        } else {
            return res.status(403).send('Falha na autenticação.');
        }
    }







};






