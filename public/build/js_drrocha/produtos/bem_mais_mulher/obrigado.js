
$(document).ready(function() {
    var storage = Storages.localStorage;

    // https://pay.hotmart.com/W6388592C?off=ln2knrqb
    // https://pay.hotmart.com/T6253753O?off=wu6gqrzm

    // https://portaldrrocha.com.br/bem-mais-mulher-obrigado?transaction=HP1711504717936&aff=W6388592C&c_name=Guilherme+Rangel&c_email=gui.rangel%40gmail.com
    // 127.0.0.1:3008/bem-mais-mulher-obrigado?transaction=HP1711504717936&aff=W6388592C&c_name=Guilherme+Rangel&c_email=gui.rangel%40gmail.com


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
    console.log(q);

    var transaction = q['transaction'];
    var c_name = q['c_name'];
    var c_email = q['c_email'];

    if (transaction !== undefined) {
        storage.set({ 'transaction': transaction });
    } else {
        if (console.log(storage.isSet('transaction'))) {
            transaction = storage.get('transaction');
        }
    }
    if (c_name !== undefined) {
        storage.set({ 'c_name': c_name });
    } else {
        if (console.log(storage.isSet('c_name'))) {
            c_name = storage.get('c_name');
        }
    }
    if (c_email !== undefined) {
        storage.set({ 'c_email': c_email });
    } else {
        if (console.log(storage.isSet('c_email'))) {
            c_email = storage.get('c_email');
        }
    }


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


    function checkPurchase() {
        var data = {
            name: c_name,
            email: c_email,
            transaction: transaction,
            prod: '169108'
        };

        var checkPurchase = $.ajax({
            url: '/api/checkpurchase',
            type: 'GET',
            data: data
        });

        checkPurchase.done(function(data) {
            console.log(data);

            if (data.status === 'ok') {
                storage.removeAll();
                setCredentials(data);
                window.location.href = '/bem-vindo?token='+ data.token;
            }
        });

        checkPurchase.fail(function(xhr, textStatus) {
            console.log(xhr.responseText);
            console.log(xhr.responseJSON);
        });

    }


    var countDown = 300;
    var cmd = $('#cmd');

    var clock = new FlipClock($('.clock'), countDown, {
        countdown: true,
        language: 'portuguese',
        clockFace: 'MinuteCounter',
        callbacks: {
            interval: function() {
                console.log(countDown);
                countDown--;

                if (countDown === 0) {
                    console.log('Postback não chegou. Alertar cliente para aguardar dados por email e sms.');
                    cmd.show();
                    return;
                }

                var checkNow = countDown % 5;

                if (checkNow === 0) {
                    console.log('check key');
                    checkPurchase();
                }

            }
        }
    });


});