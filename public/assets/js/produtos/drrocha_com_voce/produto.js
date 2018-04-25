
$(document).ready(function() {


    var storage = Storages.localStorage;

    var user = storage.get('user');
    $('.firstname').text(user.firstname);



    $('.btnOpenModulo').click(function() {
        var element = $(this);
        var modulo = element.attr('modulo');
        console.log(modulo);

        if (!$('#btn_' + modulo).is('[disabled=disabled]')) {
            var url = '/produto/drrocha_com_voce/modulo/' + modulo + '/?token=' + storage.get('token');
            console.log(url);
            window.location.href = url;
        }

    });


    var produto_keyword = $('#produto_keyword');


    function loadAccess() {
        var access = $.ajax({
            url: '/api/loadaccess',
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', storage.get('token'));
            },
            data: {
                keyword: produto_keyword.text()
            }
        });

        access.done(function(data) {
            if (data.mod_progressos) {
                for (var i = 0; i < data.mod_progressos.length; i++) {
                    if (data.mod_progressos[i].status === 'blocked') {
                        $('#btn_' + data.mod_progressos[i].keyword).attr('disabled', true);
                        $('#img_' + data.mod_progressos[i].keyword).attr('src', '/images/produtos/' + produto_keyword.text() + '/cadeado.png');
                    } else {
                        $('#btn_' + data.mod_progressos[i].keyword).attr('disabled', false);
                        $('#img_' + data.mod_progressos[i].keyword).attr('src', '/images/produtos/' + produto_keyword.text() + '/modulo1/thumb.png');
                    }
                }
            }
        });

        access.fail(function(xhr, textStatus) {
            if (xhr.responseJSON) {
                console.log(xhr.responseJSON);
            } else {
                console.log(xhr.responseText);
            }
        });
    }


    loadAccess();



});