
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Monetizze Schema
var MonetizzeSchema = new Schema({

    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    created: { type: Date, default: Date.now },
    data: {}, // tudo que foi recebido pela requisição da Monetizze
    chave_unica: String,
    venda: {
        codigo: String,
        dataInicio: String,
        dataFinalizada: String,
        meioPagamento: String,
        formaPagamento: String,
        garantiaRestante: String,
        status: String,
        valor: String,
        quantidade: String,
        valorRecebido: String,
        frete: String,
        cupom: String,
        src: String,
        utm_source: String,
        utm_medium: String,
        utm_content: String,
        utm_campaign: String,
        linkBoleto: String,
        linha_digitavel: String
    },
    comissoes:[{
        nome: String,
        tipo_comissao: String,
        valor: String,
        porcentagem: String
    }],
    comprador:{
        nome: String,
        email: String,
        telefone: String,
        cnpj_cpf: String,
        pais: String
    },
    produtor:{
        cnpj_cpf: String,
        nome: String
    }

});


module.exports = mongoose.model('Monetizze', MonetizzeSchema);