$(document).ready(function() {
    var storage = Storages.localStorage;

    function loadUserData () {
        $('#name').val(storage.get('user').name);
        $('#cpf').val(storage.get('user').doc).mask('000.000.000-00', { reverse: true });
        $('#email').val(storage.get('user').email);
        $('#celular').val(storage.get('user').celular).mask('00 00000-0000', { reverse: true });
    }


    if (storage.isSet('token')) {
        loadUserData();
    } else {
        window.location.href = '/entrar';
    }


    function setCredentials(data) {
        storage.set({ 'user': data.user });
        storage.set({ 'token': data.token });
        // Set the token as header for your requests!
        $.ajaxSetup({
            headers: {
                'Authorization': data.token
            }
        });
    }


    $('#btnSaveLabel').text('Salvar');
    $('#btnSaveSpinner').hide();


    var actualCount = 40;
    var counter;

    function startCountDown(){
        actualCount--;
        var btnSaveLabel = $('#btnSaveLabel');

        btnSaveLabel.text('Salvando. Aguarde...' + actualCount);
        if (actualCount < 0) {
            btnSaveLabel.text('Salvando. Aguarde...');
            clearInterval(counter);
        }
    }


    $('#btnSave').click(function(){
        var errEmail = $('#errEmail');
        errEmail.text('');

        var password = $('#password').val();
        var confirmPassword = $('#confirmPassword').val();

        if (password !== confirmPassword) {
            errEmail.text('A confirmação da senha não confere! Verifique!!');
            return;
        }

        $('#btnSave').prop('disabled', true);
        $('#btnSaveSpinner').show();
        counter = setInterval(startCountDown, 1000);

        var data = {
            name: $('#name').val(),
            email: $('#email').val(),
            celular: $('#celular').cleanVal(),
            password: password,
            confirmPassword: confirmPassword
        };

        var update = $.ajax({
            url: '/api/conta',
            type: 'PUT',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', storage.get('token'));
            },
            data: data
        });

        update.done(function(data) {
            clearInterval(counter);
            errEmail.text('Atualização completa! Aguarde...');
            setCredentials(data);
            $('#btnSave').hide();
            $('#btnGoBack').hide();
            window.location.href = '/members?token=' + data.token;
        });

        update.fail(function(xhr, textStatus) {
            clearInterval(counter);
            actualCount = 40;
            $('#btnSaveSpinner').hide();
            $('#btnSaveLabel').text('Salvar');
            $('#btnSave').prop('disabled', false);

            if (xhr.responseJSON && xhr.responseJSON.errors && xhr.responseJSON.errors.email && xhr.responseJSON.errors.email.message) {
                errEmail.text(xhr.responseJSON.errors.email.message);
            } else {
                if (xhr.responseJSON && xhr.responseJSON.length > 0) {
                    var erro = '';
                    for (var i = 0; i < xhr.responseJSON.length; i++) {
                        erro = erro + '<br>' + xhr.responseJSON[i].msg;
                    }

                    errEmail.append(erro);
                } else {
                    errEmail.text(xhr.responseText);
                }
            }
        });
    });


    $('#btnGoBack').click(function(){
        window.location.href = '/members?token=' + storage.get('token');
    });




});