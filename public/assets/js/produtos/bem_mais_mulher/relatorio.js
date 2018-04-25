
$(document).ready(function() {
    var storage = Storages.localStorage;

    console.log('bmm relatorio');

    var user = storage.get('user');
    $('.firstname').text(user.firstname);



    $('#btn_modulo_2').attr('disabled', true);
    $('#btn_modulo_3').attr('disabled', true);
    $('#btn_modulo_4').attr('disabled', true);
    $('#btn_modulo_5').attr('disabled', true);
    $('#btn_modulo_6').attr('disabled', true);







});