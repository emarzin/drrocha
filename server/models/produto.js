
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Produto Schema
var produtoSchema = new Schema({

    created: { type: Date, default: Date.now },
    updated: Date,
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    nome: String,
    tipo: { type: String, default: 'digital' }, // 'digital', 'fisico'
    plataforma: String, // Monetizze, Hotmart, Eduzz, Formulario
    url_venda: String, // URL da página de vendas
    codigo: { type: String, default: '' }, // codigo do produto na plataforma
    description: String,
    keyword: String, // path para html e img
    url_description: String, // URL da página de vendas
    activate: String,
    modulos: [{
        nome: String,
        description: String,
        keyword: String,
        deliver_after: { type: Number, default: 0 }
    }]


});


produtoSchema.index({ created: 1 });
produtoSchema.index({ userid: 1, plataforma: 1 });


module.exports = mongoose.model('Produto', produtoSchema);
