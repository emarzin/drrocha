$(document).ready(function() {
    var storage = Storages.localStorage;
     // storage.set({'foo': 'value','foo2': 'value2'});
     // console.log(storage);
     // console.log(storage.get('foo'));
     // console.log(storage.isEmpty('foo'));
     // console.log(storage.isSet('foo')); // Check if storage.foo exists (true)
     // storage.remove('foo') // Delete storage.foo
     // storage.removeAll() // Delete all items from the storage


    function setCredentials(data) {
        storage.set({ 'user': data.user });
        storage.set({ 'token': data.token });
        storage.set({ 'member': data.user.email });

        // Set the token as header for your requests!
        $.ajaxSetup({
            headers: {
                'Authorization': data.token
            }
        });
    }

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


    $('#forgotlink').click(function(){
        window.location.href = '/forgot?email=' + $('#email').val();
    });


    $('#btnLoginSpinner').hide();
    $('#btnLoginLabel').text('Entrar');


    $("#btnLogin").click(function(){
        $('#errEmail').text('');
        $('#btnLogin').prop('disabled', true);
        $('#btnLoginLabel').text('Entrando');
        $('#btnLoginSpinner').show();

        var email = $('#email').val();
        var password = $('#password').val();

        var login_data = {
            email: email,
            password: password
        };

        var login = $.ajax({
            url: '/api/login',
            type: 'POST',
            data: login_data
        });

        login.done(function(data) {
            setCredentials(data);
            window.location.href = '/members?token='+ data.token;
        });

        login.fail(function(xhr, textStatus) {
            if (xhr.responseJSON) {
                console.log(xhr.responseJSON);
            } else {
                $('#errEmail').text(xhr.responseText);
            }

            $('#btnLoginSpinner').hide();
            $('#btnLoginLabel').text('Entrar');
            $('#btnLogin').prop('disabled', false);
        });


    });



});