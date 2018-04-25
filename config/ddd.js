

'use strict';


var ddds = [

    { codigo: '51', digitos: 9, uf: 'RS' },
    { codigo: '53', digitos: 9, uf: 'RS' },
    { codigo: '54', digitos: 9, uf: 'RS' },
    { codigo: '55', digitos: 9, uf: 'RS' },

    { codigo: '47', digitos: 9, uf: 'SC' },
    { codigo: '48', digitos: 9, uf: 'SC' },
    { codigo: '49', digitos: 9, uf: 'SC' },

    { codigo: '41', digitos: 9, uf: 'PR' },
    { codigo: '42', digitos: 9, uf: 'PR' },
    { codigo: '43', digitos: 9, uf: 'PR' },
    { codigo: '44', digitos: 9, uf: 'PR' },
    { codigo: '45', digitos: 9, uf: 'PR' },
    { codigo: '46', digitos: 9, uf: 'PR' },

    { codigo: '67', digitos: 9, uf: 'MS' },

    { codigo: '11', digitos: 9, uf: 'SP' },
    { codigo: '12', digitos: 9, uf: 'SP' },
    { codigo: '13', digitos: 9, uf: 'SP' },
    { codigo: '14', digitos: 9, uf: 'SP' },
    { codigo: '15', digitos: 9, uf: 'SP' },
    { codigo: '16', digitos: 9, uf: 'SP' },
    { codigo: '17', digitos: 9, uf: 'SP' },
    { codigo: '18', digitos: 9, uf: 'SP' },
    { codigo: '19', digitos: 9, uf: 'SP' },

    { codigo: '21', digitos: 9, uf: 'RJ' },
    { codigo: '22', digitos: 9, uf: 'RJ' },
    { codigo: '24', digitos: 9, uf: 'RJ' },

    { codigo: '27', digitos: 9, uf: 'ES' },
    { codigo: '28', digitos: 9, uf: 'ES' },

    { codigo: '31', digitos: 9, uf: 'MG' },
    { codigo: '32', digitos: 9, uf: 'MG' },
    { codigo: '33', digitos: 9, uf: 'MG' },
    { codigo: '34', digitos: 9, uf: 'MG' },
    { codigo: '35', digitos: 9, uf: 'MG' },
    { codigo: '37', digitos: 9, uf: 'MG' },
    { codigo: '38', digitos: 9, uf: 'MG' },

    { codigo: '62', digitos: 9, uf: 'GO' },
    { codigo: '64', digitos: 9, uf: 'GO' },

    { codigo: '61', digitos: 9, uf: 'DF' },

    { codigo: '65', digitos: 9, uf: 'MT' },
    { codigo: '66', digitos: 9, uf: 'MT' },

    { codigo: '69', digitos: 9, uf: 'RO' },

    { codigo: '68', digitos: 9, uf: 'AC' },

    { codigo: '92', digitos: 9, uf: 'AM' },
    { codigo: '97', digitos: 9, uf: 'AM' },

    { codigo: '95', digitos: 9, uf: 'RR' },

    { codigo: '91', digitos: 9, uf: 'PA' },
    { codigo: '93', digitos: 9, uf: 'PA' },
    { codigo: '94', digitos: 9, uf: 'PA' },

    { codigo: '96', digitos: 9, uf: 'AP' },

    { codigo: '98', digitos: 9, uf: 'MA' },
    { codigo: '99', digitos: 9, uf: 'MA' },

    { codigo: '63', digitos: 9, uf: 'TO' },

    { codigo: '86', digitos: 9, uf: 'PI' },
    { codigo: '89', digitos: 9, uf: 'PI' },

    { codigo: '71', digitos: 9, uf: 'BA' },
    { codigo: '73', digitos: 9, uf: 'BA' },
    { codigo: '74', digitos: 9, uf: 'BA' },
    { codigo: '75', digitos: 9, uf: 'BA' },
    { codigo: '77', digitos: 9, uf: 'BA' },

    { codigo: '85', digitos: 9, uf: 'CE' },
    { codigo: '88', digitos: 9, uf: 'CE' },

    { codigo: '84', digitos: 9, uf: 'RN' },

    { codigo: '83', digitos: 9, uf: 'PB' },

    { codigo: '81', digitos: 9, uf: 'PE' },
    { codigo: '87', digitos: 9, uf: 'PE' },

    { codigo: '82', digitos: 9, uf: 'AL' },

    { codigo: '79', digitos: 9, uf: 'SE' }

];



function verificaNonoDigito (celular) {

    if ((celular === null) || (celular === '') || (celular === undefined) ) return 'ddd inválido';
    var dddcelular = celular.substr(0,2);

    for (var i = 0; i < ddds.length; i++) {
        if ( ddds[i].codigo === dddcelular ) {
            return ddds[i].digitos;
        }
    }

    return 'ddd inválido';

}


function verificaCelular (celular) {
    var errorMsg = 'Celular inválido';

    // celular sem o ddd
    var cel = celular.substr(2);
    // primeiro dígito do celular
    var primeiroDigito = cel.substr(0,1);
    var codigoddd = celular.substr(0,2);

    if ((celular === null) || (celular === '') || (celular === undefined) ) return errorMsg;

    var ddd = verificaNonoDigito(celular);

    if (ddd === 'ddd inválido') return 'O DDD ' + codigoddd + ' do seu celular não existe! ' +
        'Por favor, corrija! Exemplos de DDD: (11), (91), (31), (54).';


    if (ddd === 9) { // ddd já tem nono digito   91 98155 7050
        if (cel.length !== 9) {
            return 'Todos os celulares no Brasil já tem 9 dígitos. Exemplo: (' + codigoddd + ') 98333-1234.';
        }
        if ( !(primeiroDigito === '9') ) {
            return 'Seu número de celular tem que começar com 9! Exemplo: (' + codigoddd + ') 9XXXX-XXXX' ;
        }
    }

    if (ddd === 8) {
        if (cel.length !== 8) {
            return 'O celular deve ter DDD + 8 dígitos. Exemplo: ' + codigoddd + ' 8765 1234.';
        }

        if (!((primeiroDigito === '4') || (primeiroDigito === '5') || (primeiroDigito === '6') || (primeiroDigito === '7') || (primeiroDigito === '8') || (primeiroDigito === '9'))) {
            return 'O número do seu celular NÃO está correto!';
        }

    }

    return 'ok';

}



function verificaDDD (ddd) {

    if ((ddd === null) || (ddd === '') || (ddd === undefined) ) return 'DDD inválido: ' + ddd;

    for (var i = 0; i < ddds.length; i++) {
        if ( ddds[i].codigo === ddd ) {
            console.log(ddd);
            return 'ddd_ok';
        }
    }

    return 'DDD inválido: ' + ddd;

}



exports.consultaCelular = function (celular) {
    return verificaCelular(celular);  // 'ok' or errorMsg
};




exports.consultaDDD = function (ddd) {
    return verificaDDD(ddd);
};




//console.log( verificaNonoDigito('795') );

//console.log(verificaCelular ('6151557050') );

//console.log(verificaDDD ('631') );