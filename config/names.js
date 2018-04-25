
'use strict';



var chance = require('chance').Chance();

var firstNames = [
    'Adriana',
    'Alberto',
    'Alcides',
    'Alda',
    'Aldo',
    'Alfredo',
    'Amanda',
    'Amelia',
    'Américo',
    'André',
    'Antonio',
    'Antonia',
    'Armindo',
    'Augusta',
    'Aurora',
    'Beatriz',
    'Brenda',
    'Bruna',
    'Bruno',
    'Caio',
    'Camila',
    'Carla',
    'Carolina',
    'Cassandra',
    'Cauê',
    'Cecilia',
    'Celeste',
    'Clara',
    'Claudemira',
    'Cláudia',
    'Cristiana',
    'Cristina',
    'Daniela',
    'Dulce',
    'Debora',
    'Edite',
    'Eduarda',
    'Elisa',
    'Elisabete',
    'Eloá',
    'Emanuela',
    'Emiliana',
    'Emilia',
    'Esmeralda',
    'Eugenia',
    'Eunice',
    'Fabiana',
    'Fernanda',
    'Fábio',
    'Geralda',
    'Giovan0',
    'Gláucia',
    'Glória',
    'Jaime',
    'Janaína',
    'João',
    'Julia',
    'Lais',
    'Lia',
    'Luciana',
    'Marcelo',
    'Marisa',
    'Marta',
    'Miriam',
    'Moisés',
    'Nelson',
    'Nicolas',
    'Osvaldo',
    'Otávio',
    'Pedro',
    'Rafael',
    'Raquel',
    'Rebeca',
    'Reinaldo',
    'Renata',
    'Renato',
    'Roberto',
    'Rodrigo',
    'Ronaldo',
    'Rosa',
    'Rosana',
    'Rui',
    'Rúbens',
    'Samuel',
    'Telma',
    'Ulisses',
    'Valmor'
];


var today = new Date();
var todaystr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
var now = new Date();
var nowstr = '';
var vagas = chance.natural({ min: 3, max: 7 }); // vagas livres
var novosmembros = chance.natural({ min: 5, max: 9 });

function getNameVagas() {
    now = new Date();
    nowstr = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

    if (todaystr !== nowstr) {
        // seta today e todaystr para hoje e recalcula quantidades
        today = new Date();
        todaystr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
        vagas = chance.natural({ min: 3, max: 6 });
        novosmembros = chance.natural({ min: 5, max: 9 });
    }

    //var nome = chance.pick(firstNames, 1) + ' ' + chance.character({ pool: 'ABCDEFGHIJKLMNOPQRSTUVZ' }) + '.';
    var nome = chance.pick(firstNames, 1);

    return {
        nomemembro: nome,
        vagas: vagas,
        novosmembros: novosmembros
    };
}



exports.getNameVagas = function () {
    return getNameVagas ();
};
