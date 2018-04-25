$(document).ready(function() {

    function getUrlVars() {
        var vars = [], hash;
        var q = decodeURIComponent(document.URL);
        q = q.split('?')[1];

        if (q !== undefined) {
            q = q.split('&');

            for(var i = 0; i < q.length; i++){
                hash = q[i].split('=');
                vars.push(hash[1]);
                vars[hash[0]] = hash[1];
            }
        }
        return vars;
    }

    var q = getUrlVars();
    var emailInformed = q['email'];
    if (emailInformed !== undefined) $('#email').val(emailInformed);


    $('#btnForgotSpinner').hide();
    $('#btnForgotLabel').text('Recuperar Senha');


    $("#btnForgot").click(function(){
        var errEmail = $('#errEmail');
        errEmail.text('');
        var email = $('#email').val();

        if (email === '') {
            errEmail.text('Informe seu email cadastrado!');
            return;
        }

        $('#btnForgot').prop('disabled', true);
        $('#btnForgotLabel').text('Processando');
        $('#btnForgotSpinner').show();

        var data = {
            email: email
        };

        var forgot = $.ajax({
            url: '/api/forgot',
            type: 'POST',
            data: data
        });

        forgot.done(function(data) {
            errEmail.text(data);
            $('#btnForgot').hide();
        });

        forgot.fail(function(xhr, textStatus) {
            errEmail.text(xhr.responseText);
            $('#btnForgotSpinner').hide();
            $('#btnForgotLabel').text('Recuperar Senha');
            $('#btnForgot').prop('disabled', false);
        });

    });







});