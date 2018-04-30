'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



// Userproduto Schema
var userprodutoSchema = new Schema({

    created: { type: Date, default: Date.now },
    updated: Date,
    userid: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
    produtoid: { type: Schema.Types.ObjectId, ref: 'Produto' },
    produtokey: String,
    active: { type: Boolean, default: true },
    degree: { type: Number, default: 0 },
    status: {type: String},
    transacao: {type: String},
    dtpedido: {type: String},
    dtlibcom: {type: String},
    verifica: {type: String}
});

userprodutoSchema.methods = {

    cadHotmartProd: function(customer, callback){


        //mongoose.connect('mongodb://127.0.0.1:27017/mbeedb');//LOCAL
        mongoose.connect('mongodb://127.0.0.1:29099/mbeedb');//SERVIDO
        var prod = mongoose.model('userproduto', userprodutoSchema);

        var cont = customer.length;
        cont = cont - 1;

        var verifica = '164391' + customer.email;

        new prod({

            userid     : customer._id,
            produtoid  : '59afdcb211b0d584d2a309f5',
            produtokey : 'drrocha_com_voce',
            verifica   : verifica,
            status     : customer.status,
            transacao  : customer.transacao,
            dtpedido   : customer.dt_pedido,
            dtlibcom   : customer.dt_libcom

        }).save(function(err, pro){
            if(err){
                console.log("PROD NÃO CADASTRADO / JÁ POSSUI");
            }else{
                console.log('PROD CADASTRADO');
            }
        })


    }

}



userprodutoSchema.index({ created: 1 });
userprodutoSchema.index({ userid: 1, plataforma: 1 });


module.exports = mongoose.model('Userproduto', userprodutoSchema);