'use strict';

var mongoose = require('mongoose'),
    User = require('../server/models/user'),
    config = require('./env'),
    utils = require('./utils'),
    jwt = require('jwt-simple'),
    _ = require('lodash');



exports.checkUserApi = function(req, res, next) {
    var token = utils.getToken(req.headers, req.query.token);

    if (token) {
        var decoded;

        try {
            decoded = jwt.decode(token, config.secret);
        }
        catch(err) {
            console.log('erro');
            console.log(err);
            return res.redirect('/entrar');
        }

        var updatedDecoded = new Date(decoded.updated);
        updatedDecoded = updatedDecoded.getTime();

        User.findOne({
            _id: decoded._id
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                console.log('não existe user');
                return res.status(401).send('User is not authorized');
            } else {
                console.log('ok na funcao auth.checkUserApi');
                if (user.updated.getTime() !== updatedDecoded) {
                    return res.redirect('/entrar');
                } else {
                    if (decoded.exp) {
                        if (decoded.exp <= Date.now()) {
                            return res.redirect('/entrar');
                        } else {
                            next();
                        }
                    } else {
                        return res.redirect('/entrar');
                    }
                }
            }
        });
    } else {
        console.log('sem token');
        return res.status(401).send('User is not authorized');
    }
};



exports.checkUserPage = function(req, res, next) {
    var token = utils.getToken(req.headers, req.query.token);

    if (token) {
        var decoded;

        try {
            decoded = jwt.decode(token, config.secret);
        }
        catch(err) {
            console.log('erro');
            console.log(err);
            return res.redirect('/login');
        }

        var updatedDecoded = new Date(decoded.updated);
        updatedDecoded = updatedDecoded.getTime();

        /*
        var dataTeste = new Date();
        dataTeste = new Date(dataTeste.setDate(dataTeste.getDate() + 10));
        dataTeste = dataTeste.getTime();
        console.log('dataTeste ' + dataTeste);
        console.log('decoded.exp ' + decoded.exp);
        */


        User.findOne({
            _id: decoded._id
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.redirect('/login');
            } else {
                if (user.updated.getTime() !== updatedDecoded) {
                    return res.redirect('/login');
                } else {
                    if (decoded.exp) {
                        if (decoded.exp <= Date.now()) {
                            return res.redirect('/login');
                        } else {
                            next();
                        }
                    } else {
                        return res.redirect('/login');
                    }
                }
            }
        });
    } else {
        console.log('sem token');
        return res.redirect('/login');
    }
};



/**
 * Generic validates if the first parameter is a mongo ObjectId
 */
exports.isMongoId = function(req, res, next) {
    if ((_.size(req.params) === 1) && (!mongoose.Types.ObjectId.isValid(_.values(req.params)[0]))) {
        return res.status(500).send('Parameter passed is not a valid Mongo ObjectId');
    }
    next();
};


