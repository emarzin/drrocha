
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Progresso Schema
var progressoSchema = new Schema({

    created: { type: Date, default: Date.now },
    updated: Date,
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    progresso: { type: Number, default: 0 },
    itemsfree: { type: Boolean, default: true }, // se todos os items estão liberados para uso
    modulesversion: String,
    items: [{
        key: String,
        hasvideo: { type: Boolean, default: false },
        firstaccess: Date, // data do primeiro acesso
        lastaccess: Date, // data do acesso mais recente
        entered: { type: Number, default: 0 }, // quantas vezes entrou neste item
        performed: { type: Number, default: 0 }, // quantas vezes fez uma ação: cv update, teste de perfil / personalidade
        durationinseconds: Number, // duração total do vídeo
        currentinseconds: Number,  // último segundo atual de visualização do vídeo
        percentwatched: Number,  // maior percentual de visualização do vídeo
        status: String,  // 'free', 'wait', 'done'
        deliverafter: Date,
        deliverafterstr: String
    }]

});



progressoSchema.index({ userid: 1 });

module.exports = mongoose.model('Progresso', progressoSchema);
