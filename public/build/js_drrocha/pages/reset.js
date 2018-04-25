
$(document).ready(function() {

    var storage = Storages.localStorage;

    $('#btnResetPassSpinner').hide();
    $('#btnResetPassLabel').text('Cadastrar Nova Senha');

    function setCredentials(data) {
        storage.set({ 'user': data.user });
        storage.set({ 'token': data.token });
        $.ajaxSetup({
            headers: {
                'Authorization': data.token
            }
        });
    }


    $("#btnResetPass").click(function(){
        var errEmail = $('#errEmail');
        errEmail.text('');

        var password = $('#password').val();
        var confirmPassword = $('#confirmPassword').val();

        if ((password === '') || (confirmPassword === '')) {
            errEmail.text('Informe sua nova senha!');
            return;
        }

        if (password !== confirmPassword) {
            errEmail.text('A confirmação da senha não confere! Verifique!');
            return;
        }

        $('#btnResetPass').prop('disabled', true);
        $('#btnResetPassLabel').text('Processando');
        $('#btnResetPassSpinner').show();

        var data = {
            token: $('#token').text(),
            password: password,
            confirmPassword: confirmPassword
        };

        var resetPass = $.ajax({
            url: '/api/reset',
            type: 'POST',
            data: data
        });

        resetPass.done(function(data) {
            errEmail.text('Senha atualizada com sucesso! Aguarde...');
            $('#btnResetPass').hide();
            setCredentials(data);
            window.location.href = '/members?token='+ data.token;
        });

        resetPass.fail(function(xhr, textStatus) {
            errEmail.text(xhr.responseText);
            $('#btnResetPassSpinner').hide();
            $('#btnResetPassLabel').text('Cadastrar Nova Senha');
            $('#btnResetPass').prop('disabled', false);
        });

    });







});