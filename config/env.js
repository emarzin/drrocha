'use strict';


var development = {
    env: 'development',
    db: 'mongodb://' + (process.env.DB_PORT_29099_TCP_ADDR || '127.0.0.1:27017') + '/mbeedb',
    secret: 'Ap3&)m8FInxVp#Lw^0i82!jo3UVMcC$PbM@V)!Z*Om&zIK$KPvKiL[mYVHO^',
    hostname: 'http://127.0.0.1:3008',
    port: '3008',
    defaultpassword: 'relri!@_2020',
    emailPerRun: 1,
    sendemail: true, // set to send email
    emailgateway: {
        service: 'Mailgun',
        user: 'postmaster@portaldrrocha.com.br',
        pass: 'b92e8a8b5f8300af857d9cb0812c4519',
        maxConnections: 20
    },
    emailvalidator: {
        service: 'neverbounce',
        user: 'a4prDGx3',
        pass: 'KpSa2cMUOs8xZjN'
    },
    testing: {
        firstname: 'Guilherme',
        name: 'Guilherme Rangel',
        emailaddress: 'guirangel77@gmail.com',
        mobilenumber: '21969137597'
    },
    modulesversion: '1.0',
    callphone: '11 99999-9999',
    smsPerRun: 1
};

var production = {
    env: 'production',
    db: 'mongodb://' + (process.env.DB_PORT_29099_TCP_ADDR || '127.0.0.1:29099') + '/mbeedb',
    secret: 'Ap3&)m8FInxVp#Lw^0i82!jo3UVMcC$PbM@V)!Z*Om&zIK$KPvKiL[mYVHO^',
    hostname: 'http://www.portaldrrocha.com.br',
    port: '3008',
    defaultpassword: 'relri!@_2020',
    emailPerRun: 100,
    sendemail: true, // set to send email
    emailgateway: {
        service: 'Mailgun',
        user: 'postmaster@portaldrrocha.com.br',
        pass: 'b92e8a8b5f8300af857d9cb0812c4519',
        maxConnections: 20
    },
    emailvalidator: {
        service: 'neverbounce',
        user: 'a4prDGx3',
        pass: 'KpSa2cMUOs8xZjN'
    },
    testing: {
        firstname: 'Guilherme',
        name: 'Guilherme Rangel',
        emailaddress: 'guirangel77@gmail.com',
        mobilenumber: '21969137597'
    },
    modulesversion: '1.0',
    callphone: '11 99999-9999',
    smsPerRun: 25
};


if (process.env.NODE_ENV === 'development') {
    console.log('development');
    return module.exports = development;
} else {
    console.log('production');
    return module.exports = production;
}