$(document).ready(function() {

    var storage = Storages.localStorage;
    var panelbody = $('#panelbody');


    function destroyCredentials(callback) {
        storage.removeAll();
        $.ajaxSetup({ headers: { } });
        callback('storage cleaned!');
    }



    $("#btnLogout").click(function() {
        $('#btnLogoutLabel').text('Saindo...');

        destroyCredentials(function(result) {
            window.location.href = '/entrar';
        });
    });

    $("#btnAccount").click(function() {
        window.location.href = '/conta?token=' + storage.get('token');
    });



    //PRODUTOS
    var div_produtos = $('#div_produtos');

    function loadProdutos () {
        var produtos = $.ajax({
            url: '/api/getuserprodutos',
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', storage.get('token'));
            },
            data: {}
        });

        produtos.done(function(data) {
            div_produtos.text('');
            div_produtos.append(data);

        });

        produtos.fail(function(xhr, textStatus) {
            console.log(xhr);
            console.log(textStatus);
        });
    }


    if (storage.isSet('token') && storage.isSet('user')) {
        $('.firstname').text(storage.get('user').firstname);
        $('.nav-tabs a[href="#tab_produtos"]').tab('show');
        loadProdutos();
    } else {
        window.location.href = '/entrar';
    }

    // $(staticAncestors).on(eventName, dynamicChild, function() {});

    div_produtos.on('click', '.btnOpenProduto', function(){
        //var teste = $(this).attr('teste');
        //console.log(teste);

        var key = $(this).attr('href');
        var url = '/produto/' + key + '/?token=' + storage.get('token');
        console.log(url);
        window.location.href = url;
    });


    //TESTE

    var div_nova = $('#div_nova');

    function loadNova () {
        var getnova = $.ajax({
            url: '/api/getnova',
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', storage.get('token'));
            },
            data: {}
        });

        getnova.done(function(data) {
            console.log(data);
            div_nova.text('');
            div_nova.append(data);

        });

        getnova.fail(function(xhr, textStatus) {
            console.log(xhr);
            console.log(textStatus);
        });
    }


    $('.nav-tabs a[href="#tab_nova"]').click(function() {
        console.log( loadNova);
        loadNova();
    });


    //FINAL TESTE



    var div_vitrine = $('#div_vitrine');

    function loadVitrine () {
        var getvitrine = $.ajax({
            url: '/api/getvitrine',
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', storage.get('token'));
            },
            data: {}
        });

        getvitrine.done(function(data) {
            console.log(data);
            div_vitrine.text('');
            div_vitrine.append(data);

        });

        getvitrine.fail(function(xhr, textStatus) {
            console.log(xhr);
            console.log(textStatus);
        });
    }


    $('.nav-tabs a[href="#tab_vitrine"]').click(function() {
        console.log( loadVitrine);
        loadVitrine();
    });


});


