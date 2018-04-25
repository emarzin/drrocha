
$(document).ready(function() {
    var storage = Storages.localStorage;

    function setCredentials(data) {
        storage.set({ 'user': data.user });
        storage.set({ 'token': data.token });
        storage.set({ 'member': data.user.email });
        $.ajaxSetup({
            headers: {
                'Authorization': data.token
            }
        });
    }

    var user = storage.get('user');

    var firstname = $('#firstname');
    var name = $('#name');
    var email = $('#email');
    var celular = $('#celular');

    if (user && user.firstname) firstname.text(user.firstname);
    if (user && user.name) name.val(user.name);
    if (user && user.email) email.val(user.email);
    if (user && user.celular) celular.val(user.celular).mask('00 00000-0000', { reverse: true });

    var errUpdate = $('#errUpdate');
    var btnUpdate = $('#btnUpdate');
    var btnUpdateLabel = $('#btnUpdateLabel');
    var btnUpdateSpinner = $('#btnUpdateSpinner');

    btnUpdateSpinner.hide();
    btnUpdateLabel.text('Atualizar');

    if (user.emailStatus !== 'ok') errUpdate.text('O email que você informou está com problemas. ' +
        'Por favor, digite o seu email corretamente.');

    var actualCount = 40;
    var counter;

    function startCountDown(){
        actualCount--;

        btnUpdateLabel.text('Atualizando. Aguarde...' + actualCount);
        if (actualCount < 0) {
            btnUpdateLabel.text('Atualizando. Aguarde...');
            clearInterval(counter);
        }
    }


    btnUpdate.click(function(){
        errUpdate.text('');
        btnUpdate.prop('disabled', true);
        btnUpdateLabel.text('Atualizando');
        btnUpdateSpinner.show();
        counter = setInterval(startCountDown, 1000);

        var update_data = {
            name: name.val(),
            email: email.val(),
            celular: celular.cleanVal()
        };

        var update_user = $.ajax({
            url: '/api/conta',
            type: 'PUT',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', storage.get('token'));
            },
            data: update_data
        });

        update_user.done(function(data) {
            clearInterval(counter);
            errUpdate.text('Atualização completa! Aguarde...');
            setCredentials(data);
            window.location.href = '/members?token='+ data.token;
        });

        update_user.fail(function(xhr, textStatus) {
            clearInterval(counter);
            actualCount = 40;
            btnUpdateSpinner.hide();
            btnUpdateLabel.text('Atualizar');
            btnUpdate.prop('disabled', false);

            if (xhr.responseJSON && xhr.responseJSON.errors && xhr.responseJSON.errors.email && xhr.responseJSON.errors.email.message) {
                errUpdate.text(xhr.responseJSON.errors.email.message);
            } else {
                if (xhr.responseJSON && xhr.responseJSON.length > 0) {
                    var erro = '';
                    for (var i = 0; i < xhr.responseJSON.length; i++) {
                        erro = erro + '<br>' + xhr.responseJSON[i].msg;
                    }

                    errUpdate.append(erro);
                } else {
                    errUpdate.text(xhr.responseText);
                }
            }
        });


    });



});