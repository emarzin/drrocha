

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    path = require('path'),
    uncss = require('gulp-uncss'),
    async = require('async'),
    _ = require('lodash');

var plugins = gulpLoadPlugins();
var defaultTasks = ['clean', 'cssmin', 'uglify', 'prodServe', 'uncss'];
var assets = require('../assets.json');


gulp.task('env:production', function () {
    process.env.NODE_ENV = 'production';
});



function tokenizeConfigCSS(config) {
    var destTokens = _.keys(config)[0].split('/');

    return {
        srcGlob: _.flatten(_.values(config)),
        destDir: destTokens[destTokens.length - 2],
        destFile: destTokens[destTokens.length - 1]
    };
}


function tokenizeConfig(config) {
    console.log('tokenizeConfig');

    var keys = _.keys(config)[0];
    var destTokens = keys.split('/');
    console.log('keys: ' + keys);

    console.log('destTokens');
    console.log(destTokens);

    var destFile = destTokens[destTokens.length - 1];
    console.log('destFile: ' + destFile);

    var destDir = keys.replace('/' + destFile, '');
    console.log('destDir: ' + destDir);

    return {
        srcGlob: _.flatten(_.values(config)),
        destDir: destDir,
        destFile: destFile
    };
}


gulp.task('cssmin', function () {
    console.log('in cssmin');
    var config = tokenizeConfigCSS(assets.main.css);

    if (config.srcGlob.length) {
        return gulp.src(config.srcGlob)
            .pipe(plugins.cssmin({ keepBreaks: true }))
            .pipe(plugins.concat(config.destFile))
            .pipe(gulp.dest(path.join('public/build', config.destDir)));
    }
});


gulp.task('uncss', function () {
    var config = tokenizeConfigCSS(assets.main.css);

    return gulp.src('public/build/css/main.min.css')
        .pipe(uncss({
            html: [ 'public/views/*.html' ],
            ignore: [ new RegExp('^\.mfp-.*'), new RegExp('^\.img-.*'), new RegExp('^\.button.*'),
                new RegExp('^\.fa-times.*'), new RegExp('^\.fa-bars.*'),
                new RegExp('^\.nav.*'), new RegExp('^\.drop.*'), new RegExp('^\.open.*'),
                new RegExp('^\.flip-clock.*')]
        }))
        .pipe(gulp.dest(path.join('public/build', config.destDir)));
});




gulp.task('uglify', function () {
    console.log('in uglify');

    var keys = Object.keys(assets.main);  // returns [ 'css', 'js', ... ]
    console.log('all keys:');
    console.log(keys);

    async.eachSeries(keys, function(key, cb) {
        console.log('key: '+ key + 'indexOf: ' + key.indexOf('js'));

        if (key.indexOf('js') > -1) {
            console.log('minificando: ' + key);
            var config = tokenizeConfig(assets.main[key]);
            console.log(config);

            if (config.srcGlob.length) {
                return gulp.src(config.srcGlob)
                    .pipe(plugins.concat(config.destFile))
                    .pipe(plugins.uglify({mangle: false}))
                    //.pipe(gulp.dest(path.join('public/build', config.destDir))).on('end', function(){
                    .pipe(gulp.dest(config.destDir)).on('end', function(){
                        console.log('key: ' + key + ' minified!');
                        cb();
                    });
            }
        } else {
            console.log('skip key: ' + key);
            cb();
        }

    }, function(err){
        if (err) {
            console.log('A key failed to process: ' + err);
        } else {
            console.log('All keys have been processed.' + new Date() );
        }
    });


});


gulp.task('images', function() {
    return gulp.src('public/assets/images/*')
        .pipe(gulp.dest('public/build/images'));
});




gulp.task('prodServe', ['env:production'], function () {
    plugins.nodemon({
        script: 'server.js',
        ext: 'html js',
        env: { 'NODE_ENV': 'production' } ,
        ignore: ['./node_modules/**']
    });
});
gulp.task('production',defaultTasks);
