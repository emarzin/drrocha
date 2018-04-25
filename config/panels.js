'use strict';

var swig = require('swig'),
    util = require('util');




function buildProdutos(produtos, callback) {
    swig.renderFile(__dirname + '/panels/produtos.html', {
        produtos: produtos
    }, function (err, data) {
        if (err) {
            console.log(err);
            callback('erro!');
        } else {
            callback(data);
        }
    });
}


function buildVitrine(produtos, callback) {
    swig.renderFile(__dirname + '/panels/vitrine.html', {
        produtos: produtos
    }, function (err, data) {
        if (err) {
            console.log(err);
            callback('erro!');
        } else {
            callback(data);
        }
    });
}


function buildNova(produtos, callback) {
    swig.renderFile(__dirname + '/panels/prod.html', {
        produtos: produtos
    }, function (err, data) {
        if (err) {
            console.log(err);
            callback('erro!');
        } else {
            callback(data);
        }
    });
}


exports.buildProdutos = function (produtos, callback) {
    return buildProdutos (produtos, function(result) {
        callback(result);
    });
};


exports.buildVitrine = function (produtos, callback) {
    return buildVitrine (produtos, function(result) {
        callback(result);
    });
};


exports.buildNova = function (produtos, callback) {
    return buildNova (produtos, function(result) {
        callback(result);
    });
};
