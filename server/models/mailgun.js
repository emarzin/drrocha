
'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Mailgun Schema
var MailgunSchema = new Schema({

    created: { type: Date, default: Date.now },
    dados: {}

});




module.exports = mongoose.model('Mailgun', MailgunSchema);