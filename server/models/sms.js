
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// SMS Schema
var SmsSchema = new Schema({

    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    tipo: String, // tipo de mensagem que foi enviada
    celular: String,
    msg: String,
    created: { type: Date, default: Date.now },
    status: String,
    gatewayMsg: String,
    erros: [ {
        msg: String,
        at: Date
    } ],
    sendDate: { type: Date, sparse: true },
    sendAfter: { type: Date, default: Date.now },
    go: { type: Boolean, default: true },
    checkevent: String

});


SmsSchema.index({ userid: 1 });
SmsSchema.index({ celular: 1 });


module.exports = mongoose.model('Sms', SmsSchema);