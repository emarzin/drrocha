

'use strict';


var nodemailer = require('nodemailer'),
    config = require('./env'),
    accounting = require('accounting'),
    swig = require('swig'),
    assetmanager = require('assetmanager'),
    diacritic = require('diacritic'),
    request = require('request'),
    Email = require('../server/models/email'),
    Sms = require('../server/models/sms'),
    Progresso = require('../server/models/progresso'),
    async = require('async'),
    crypto = require('crypto'),
    chance = require('chance').Chance(),
    MobileDetect = require('mobile-detect');


// create reusable transporter object using the default SMTP transport
var emailTransporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: config.emailgateway.user,
        pass: config.emailgateway.pass
    },
    pool: true
});


exports.emailTransporter = emailTransporter;



var assets = assetmanager.process({
    assets: require('../assets.json'),
    debug: (config.env !== 'production'),
    webroot: 'public'
});

exports.assets = assets;




function extractToken(headers, token) {
    if (headers && headers.authorization) {
        return headers.authorization;
    } else {
        if (token) {
            return token
        } else {
            return null;
        }
    }
}



function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}


function getIndexFromArray (array, key, keyelement) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === keyelement) {
            return i;
        }
    }

    return -1;
}




function enviaEmail (to, toEmail, bcc_address, subject, text, html, userid, tag, callback) {
    if (config.env === 'development') toEmail = config.testing.emailaddress;

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Portal Dr. Rocha" <contato@portaldrrocha.com.br>',
        to: toEmail,
        subject: subject,
        text: text,
        html: html
    };

    if (bcc_address) mailOptions.bcc = bcc_address;

    var email = new Email();

    if (userid) email.userid = userid;
    email.to = to;
    email.toEmail = toEmail;
    email.subject = subject;
    email.text = text;
    email.html = html;
    email.gateway = 'Mailgun';
    email.tag = tag;

    // send mail with defined transport object
    emailTransporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log('Gateway error occurred!');
            console.log(error);

            email.status = 'erro';
            if (!email.erros) email.erros = [];

            email.erros.push({
                gateway: 'Mailgun',
                msg: error.response,
                at: new Date()
            });

            email.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Email saved!');
                }

                callback(error.response, info);
            });
        } else {
            // Verifica se sempre vai com 'sent'
            email.status = 'enviado';
            email.gatewayMsg = info.response;
            email.sendDate = new Date();
            email.msgid = info.messageId;

            console.log('Email sent: ' + email.toEmail + ' ' + toEmail  + ' ' + info.response);

            email.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Email saved!');
                }

                callback(null, info);
            });
        }
    });


}



function getFirstname (name) {
    name = name.trim();
    var splitNames = name.split(' ');
    var firstname = splitNames[0].toLowerCase();
    firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);

    return firstname.substring(0, 15);
}


function formataFone (numero) {
    if (numero){
        switch(numero.length)
        {
            case 11:
                return '('+ numero.substring(0, 2) + ') ' + numero.substring(2,7) + '-' + numero.substring(7,11);
            case 10:
                return '('+ numero.substring(0, 2) + ') ' + numero.substring(2,6) + '-' + numero.substring(6,10);
            default:
                return '';
        }
    } else {
        return '';
    }
}


function formataCPF (cpf) {
    if (cpf){
        return cpf.substring(0,3) + '.' + cpf.substring(3,6) + '.' + cpf.substring(6,9) + '-' + cpf.substring(9,11);
    } else {
        return '';
    }
}


function calcUniqueArray (a) {
    return Array.from(new Set(a));
}


function findMondays() {
    var d = new Date(),
        month = d.getMonth(),
        mondays = [];

    d.setDate(1);

    // Get the first Monday in the month
    while (d.getDay() !== 1) {
        d.setDate(d.getDate() + 1);
    }

    // Get all the other Mondays in the month
    while (d.getMonth() === month) {
        mondays.push(d.getDate());
        d.setDate(d.getDate() + 7);
    }

    return mondays;
}




function countDuplicates (array) {
    var counts = {};
    array.forEach(function(x) { counts[x] = (counts[x] || 0) + 1; });
    return counts;
}



function incrementItemPerformed(userid, key) {

    Progresso.findOne({
        userid: userid
    }, function (err, progresso) {
        if (err) throw err;

        if (!progresso) {
            return 'progresso not found for userid ' + userid;
        } else {
            for (var i = 0; i < progresso.items.length; i++) {
                if (progresso.items[i].key === key) {
                    progresso.items[i].performed++;

                    progresso.save(function(err) {
                        if (err) console.log(err);

                        return 'progresso.item.performed incremented';
                    });

                    break;
                }
            }
        }

    });

}


function getSmsBalance (callback) {
    var url = 'http://smsmarketing.smslegal.com.br/index.php?app=webservices&ta=cr&u=guirangel&p=368716';

    var options = {
        url: url,
        timeout: 30000
    };

    request(options, function (error, response, body) {
        var result = {};

        if (!error && response.statusCode === 200) {
            result.tipo = 'ok';
            result.msg = body;
        }

        if (error) {
            result.tipo = 'erro';
            result.msg = error.message;
        }

        callback(result);
    });

}





function sendSMS (celular, msg, userid, tipo, smsdoc, callback) {
    var celularDisparo = '';

    if (config.env === 'development') {
        celularDisparo = config.testing.mobilenumber;
    } else {
        celularDisparo = celular;
    }

    var msgCleaned = diacritic.clean(msg);

    var url = 'http://smsmarketing.smslegal.com.br/index.php?app=webservices&ta=pv&u=relristein&p=352052&to=55' +
        celularDisparo + '&msg=' + msgCleaned;

    var options = {
        url: url,
        timeout: 30000
    };

    request(options, function (error, response, body) {
        console.log(url);
        var sms;

        if (smsdoc) {
            sms = smsdoc;
        } else {
            sms = new Sms({
                celular: celular,
                msg: msgCleaned
            });
        }

        if (userid) sms.userid = userid;
        sms.tipo = tipo;

        var result = {};

        if (!error && response.statusCode === 200) {
            console.log(body);
            sms.status = response.statusCode;
            sms.gatewayMsg = body;
            sms.sendDate = new Date();

            sms.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('SMS saved');
                }

                result.tipo = 'ok';
                result.msg = body;
                callback(result);
            });
        }

        if (error) {
            console.log('sms error: ' + error.message);

            if (!sms.erros) sms.erros = [];
            sms.erros.push({
                msg: error.message,
                at: new Date()
            });

            sms.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('SMS saved for later sending!');
                }

                result.tipo = 'erro';
                result.msg = error.message;
                callback(result);
            });

        }
    });

}



function cleanContato (contato) {
    if (contato) {
        if (contato.indexOf('@') === -1) {
            // contato is celular
            contato = contato.replace(/\./g,'');
            contato = contato.replace(/\+/g,'');
            contato = contato.replace(/-/g,'');
            contato = contato.replace(/\s/g,'');
            contato = contato.replace(/[()]/g,'');
            // remove 0 from DDD
            if (contato.substring(0, 1) === '0') {
                contato = contato.substring(1);
            }
        } else {
            // contato is email: convert to lowercase and trim
            contato = contato.toLowerCase();
            contato = contato.trim();
        }
    }

    return contato;
}



function nextWorkingDay (date, offset) {
    var day;
    while (offset > 0) {
        date.setDate(date.getDate() + 1);
        // skip saturdays and sundays
        day = date.getDay();
        if (!(day === 0 || day === 6 )) offset--;
    }
    return date;
}


function calcDueDate (offset) {  // retorna no formato '30/05/2015'
    var now = new Date();
    now = new Date(now.setHours(9,0,0,0));
    var vencimento = nextWorkingDay(now, offset);

    var year = vencimento.getFullYear();
    var month = vencimento.getMonth() + 1;
    var day = vencimento.getDate();
    day = day + '';
    month = month + '';
    if (day.length === 1) day = '0' + day;
    if (month.length === 1) month = '0' + month;
    console.log('year: ' + year + ' month: ' + month + ' day: ' + day);

    vencimento = new Date(vencimento.setHours(19,59,0,0));

    return {
        date: vencimento,
        datestr: day + '/' + month + '/' + year
    };
}


function getIP (req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
}


function getkey (req) {
    var key = '';
    if (req.query && req.query.key) key= req.query.key;
    return key;
}


function isMobile (req) {
    var md = new MobileDetect(req.headers['user-agent']);
    return (md.mobile() !== null);
}






exports.getToken = function (headers, token) {
    return extractToken (headers, token);
};


exports.sortByKey = function (array, key) {
    return sortByKey (array, key);
};

exports.enviaEmail = function (to, toEmail, bcc_address, subject, text, html, userid, tipo, callback) {
    return enviaEmail (to, toEmail, bcc_address, subject, text, html, userid, tipo, function(result) {
        callback(result);
    });
};

exports.getFirstname = function (name) {
    return getFirstname (name);
};

exports.uniqueArray = function (a) {
    return calcUniqueArray (a);
};

exports.formataTelefone = function (numero) {
    return formataFone (numero);
};

exports.formataCPF = function (numero) {
    return formataCPF (numero);
};

exports.getMondays = function () {
    return findMondays();
};

exports.getIndexFromArray = function (array, key, keyelement) {
    return getIndexFromArray (array, key, keyelement) ;
};

exports.countDuplicates = function (array) {
    return countDuplicates(array);
};


exports.incrementItemPerformed = function (userid, key) {
    return incrementItemPerformed(userid, key);
};


exports.getSmsBalance = function (callback) {
    return getSmsBalance (function(result) {
        callback(result);
    });
};


exports.sendSMS = function (celular, msg, userid, tipo, smsdoc, callback) {
    return sendSMS (celular, msg, userid, tipo, smsdoc, function(result){
        callback(result);
    });
};


exports.cleanContato = function (contato) {
    return cleanContato(contato);
};


exports.calculateDueDate = function (offset) {
    return calcDueDate (offset);
};


exports.getIP = function (req) {
    return getIP (req);
};

exports.getkey = function (req) {
    return getkey (req);
};


exports.isMobile = function (req) {
    return isMobile (req);
};







