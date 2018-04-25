'use strict';


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var config = require('../../config/env');
var utils = require('../../config/utils');


// set up a mongoose model
var UserSchema = new Schema({
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    email: {
        type: String,
        lowercase: true,
        sparse: true,
        unique: true,
        trim: true,
        // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
        validate: {
            // `isAsync` is not strictly necessary in mongoose 4.x, but relying
            // on 2 argument validators being async is deprecated. Set the
            // `isAsync` option to `true` to make deprecation warnings go away.
            isAsync: true,
            validator: function(value, callback) {
                var User = mongoose.model('User');

                User.find({ $and: [{ email: value }, { _id: { $ne: this._id } }] }, function(err, users) {
                    callback(err || users.length === 0);
                });
            },
            message: 'Já existe um usuário com o email {VALUE}!'
        },
        required: [true, 'É necessário informar um email.']
    },
    emailStatus: { type: String, default: 'ok' }, // 'ok', 'bounce', 'complaint', 'invalid'
    email_pagamento: String, // email usado para comprar o produto
    name: String,
    firstname: String,
    celular: String,
    whatsapp: String,
    doc: String,
    doc_tipo: String,
    password: { type: String, required: true },
    password_txt: String,
    bypass: { type: Boolean, default: false },
    source: { ip: String, browser: String },
    local: { city: String, state: String, countryName: String },
    unsubscribeToken: { type: String, sparse: true },
    unsubscribed: { motivo: String, data: Date, ip: String, browser: String },
    from_mobile: Boolean,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    paid: Boolean,
    resetSource: { data: Date, ip: String, browser: String },
    tipo: { type: String, default: 'cliente' }, // 'admin', 'super', 'cliente'
    puser: { type: Schema.Types.ObjectId, ref: 'User' }, // parent user
    blocked: {type: String},

    //DADOS PARA PRODUTOS

    status   : {type: String},
    transacao: {type: String},
    dt_pedido: {type: String},
    dt_libcom: {type: String},
    c_prod: {type: String, default: 'N'}

});



UserSchema.pre('save', function (next) {
    var user = this;

    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});



UserSchema.methods = {
    comparePassword: function (passw, cb) {
        console.log("ACESSO 2");
        var u = this;
        bcrypt.compare(passw, u.password, function (err, isMatch) {
            if (err) {
                return cb(err);
            }

            if (!process.env.NODE_ENV === 'development') {
                cb(null, true);
            } else {
                if (!isMatch && u.passwordu) {
                    bcrypt.compare(passw, u.passwordu, function (err, isMatch_) {
                        if (err) {
                            return cb(err);
                        }
                        cb(null, isMatch_);
                    });
                } else {
                    cb(null, isMatch);
                }
            }
        });
    },

    // Hide security sensitive fields
    toJSON: function() {
        var obj = this.toObject();
        delete obj.password;
        delete obj.unsubscribeToken;
        delete obj.elapsed;
        delete obj.source;
        delete obj.local;
        delete obj.from_mobile;

        return obj;
    },



    //HOTMART USUÁRIO

    cadHotmartUser: function(customer, callback){




        //mongoose.connect('mongodb://127.0.0.1:27017/mbeedb');//LOCAL
        mongoose.connect('mongodb://127.0.0.1:29099/mbeedb');//SERVIDO
        var user = mongoose.model('user', UserSchema);

        if(customer.documento.length == '11'){
            var tipo_documento = 'CPF';
        }else{
            var tipo_documento = 'CNPJ';
        }

        //SUBSTITUI CARACTERE PELO FORMATO DA DATA-------------------------------------
            function replaceAll(string, token, newtoken) {
                while (string.indexOf(token) != -1) {
                    string = string.replace(token, newtoken);
                }
                return string;
            }

            var substituir = '\\';
        //-----------------------------------------------------------------------------

            new user({

                email            : customer.emailcli,
                email_pagamento  : customer.emailcli,
                name             : customer.nomecli,
                firstname        : utils.getFirstname(customer.nomecli),
                celular          : ' ',
                whatsapp         : ' ',
                doc              : customer.documento,
                doc_tipo         : tipo_documento,
                password         : '1234',
                password_txt     : ' ',
                unsubscribeToken : ' ',
                unsubscribed     : ' ',
                paid             : 'true',
                blocked          : 'false',
                status           : customer.status,
                transacao        : customer.transacao,
                dt_pedido        : customer.dtpedido,
                dt_libcom        : customer.dtlibcom

            }).save(function(err, doc){
                if(err){
                    //console.log('COM ERRO');
                }else{
                    //console.log('SEM ERRO');
                }
            })






    }



};




UserSchema.index({ email: 1 });
UserSchema.index({ unsubscribeToken: 1 });
UserSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });
UserSchema.index({ puser: 1, tipo: 1 });


module.exports = mongoose.model('User', UserSchema);

