
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Email Schema
var emailSchema = new Schema({

    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    tag: String, // para classificar emails
    to: String,
    toEmail: String,
    bccEmail: String,
    subject: String,
    text: String,
    html: String,
    created: { type: Date, default: Date.now },
    sendAfter: { type: Date, default: Date.now },
    status: String,
    gateway: String,
    gatewayMsg: String,
    msgid: String,
    gatewayInfo: {}, // grava o json de retorno do gateway aqui
    erros: [ {
        gateway: String,
        msg: String,
        at: Date
    } ],
    events: [{
        event: String,
        at: Date,
        ip: String,
        country: String,
        region: String,
        city: String,
        'user-agent': String,
        'device-type': String,
        'client-type': String,
        'client-name': String,
        'client-os': String,
        url: String,
        code: String,
        error: String,
        notification: String
    }],
    sendDate: { type: Date, sparse: true }

});


emailSchema.index({ userid: 1 });

module.exports = mongoose.model('Email', emailSchema);
