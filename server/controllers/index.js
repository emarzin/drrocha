
'use strict';


var jwt = require('jwt-simple'),
    request = require('request'),
    config = require('../../config/env'),
    names = require('../../config/names'),
    chance = require('chance').Chance(),
    utils = require('../../config/utils');


module.exports = {


    bmm_obrigado: function(req, res, next) {
        res.render(__dirname + '/../../public/views/produtos/bem_mais_mulher/obrigado.html', {
            env: config.env,
            assets: utils.assets,
            keyword: 'bem_mais_mulher'
        });
    }





};






