
$(document).ready(function() {
    var storage = Storages.localStorage;

    var user = storage.get('user');
    $('.firstname').text(user.firstname);


    $('.btnOpenConteudo').click(function() {
        var este = $(this);
        var modulo = este.attr('modulo');
        var conteudo = este.attr('conteudo');
        console.log(modulo);
        console.log(conteudo);
        var url = '/produto/drrocha_com_voce/modulo/' + modulo + '/conteudo/' + conteudo + '/?token=' + storage.get('token');
        console.log(url);
        window.location.href = url;
    });



});