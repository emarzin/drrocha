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


    $('#usub_sendingSpinner').hide();


    function unsubscribeEmail(motivo) {
        $('#usub_errEmail').text('');
        $('#usub_sendingSpinner').show();

        var q = getUrlVars();
        var url = '/api/unsubscribe';

        var data = {
            id: q['id'],
            motivo: motivo
        };

        var unsubsribeEmail = $.ajax({
            url: url,
            type: 'PUT',
            data: data
        });

        unsubsribeEmail.done(function(data) {
            $('#usub_errEmail').text(data);
            $('#usub_questions').hide();
            $('#usub_sendingSpinner').hide();
        });

        unsubsribeEmail.fail(function(xhr, textStatus) {
            $('#usub_errEmail').text(xhr.responseText);
            $('#usub_sendingSpinner').hide();
        });
    }


    $('#usub_btnWord1').click(function(){
        unsubscribeEmail($('#usub_btnWord1Label').text());
    });

    $('#usub_btnWord2').click(function(){
        unsubscribeEmail($('#usub_btnWord2Label').text());
    });

    $('#usub_btnWord3').click(function(){
        unsubscribeEmail($('#usub_btnWord3Label').text());
    });

    $('#usub_btnWord4').click(function(){
        unsubscribeEmail($('#usub_btnWord4Label').text());
    });





});