
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate');


// Postback Schema
var PostbackSchema = new Schema({

    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    data: {}, // tudo que foi recebido
    produto: String, // sigla do produto que vem no postback
    produtoid: { type: Schema.Types.ObjectId, ref: 'Produto' },
    produtocodigo: String, // código do produto na plataforma
    plataforma: String, // plataforma do produto
    evento: String, // para facilitar consulta aos dados
    source: String, // 'venda', 'formulario'
    cliente: {
        nome: String,
        nomeFormatado: String,
        email: String,
        fixo: String,
        celular: String,
        celular2: String,
        zap: String,
        doc_tipo: String, // 'CPF', 'CNPJ'
        doc: String, // número do documento
        notes: String,
        contato: String,
        details: String,
        cep: String, // Endereço de entrega (produto físico)
        endereco: String,
        numero: String,
        complemento: String,
        bairro: String,
        cidade: String,
        estado: String,
        pais: String
    },
    google: {
        id: { type: Schema.Types.ObjectId, ref: 'Google' },
        email: String,
        contactid: String, // referência ao contato na agenda no Google
        error: String
    },
    venda: {
        aff_name: String,
        aff: String, // código ou email do afiliado, dependendo da plataforma
        aff_value: Number, // valor da comissão do afiliado: eduzz
        plano: String,
        codigo: String,
        formaPagamento: String,
        status: String,
        valor: Number,
        quantidade: Number,
        valorRecebido: Number,
        dataInicio: String,
        dataFinalizada: String,
        dataFinalizadaDate: Date,
        meioPagamento: String,
        canceladaMotivo: String,
        src: String,
        utm_source: String,
        utm_medium: String,
        utm_content: String,
        utm_campaign: String,
        linkBoleto: String,
        linha_digitavel: String
    },
    assinatura: {
        codigo: String,
        status: String   //  (Ativa, Inadimplente, Cancelada)
    },
    plano: {
        codigo: String,
        referencia: String,
        nome: String,
        quantidade: String
    }

});


// https://github.com/deveduzz/webhook-eduzz


PostbackSchema.plugin(mongoosePaginate);

PostbackSchema.index({ created: 1 });

PostbackSchema.index({ userid: 1, produto: 1, 'venda.codigo': 1 });
PostbackSchema.index({ produtoid: 1, 'cliente.email': 1, 'venda.status': 1 });

module.exports = mongoose.model('Postback', PostbackSchema);