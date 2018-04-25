
'use strict';


// Valida o CNPJ
function validaCNPJ(cnpj) {
    var b = [6,5,4,3,2,9,8,7,6,5,4,3,2], c = cnpj;
    if((c = c.replace(/[^\d]/g,'').split('')).length != 14)
        return false;
    for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
    if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false;
    for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
    if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false;
    return true;
}



function validaCPF(cpf) {

    // digitos idênticos, letra no cpf, tamanho inválido ?
    var pattern1 = new RegExp('\\b([0-9])\\1\\1+\\b');
    if ((pattern1.test(cpf)) || (cpf.length !== 11)) {
        return false;
    }

    // Valida 1o digito verificador
    var add = 0;
    var i =0;
    for (i=0; i < 9; i ++)
        add += parseInt(cpf.charAt(i)) * (10 - i);

    var rev = 11 - (add % 11);
    if (rev === 10 || rev === 11)  rev = 0;

    //Retorna falso se o dígito calculado eh diferente do passado na string
    if (rev !== parseInt(cpf.charAt(9))) return false;

    // Valida 2o digito
    add = 0;
    for (i = 0; i < 10; i ++)
        add += parseInt(cpf.charAt(i)) * (11 - i);

    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;

    //Retorna falso se o dígito calculado for diferente do passado na string
    if (rev !== parseInt(cpf.charAt(10))) return false;

    return true;

}


exports.cnpjvalido = function (cnpj) {
    return validaCNPJ(cnpj);
};


exports.cpfvalido = function (cpf) {
    return validaCPF(cpf);
};


