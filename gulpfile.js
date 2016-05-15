var destDir = 'bin';
var gulp = require('gulp');
var bower = require('gulp-bower');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var less = require('gulp-less');
var argv = require('yargs').argv;
var debug = require( 'gulp-debug' );
var clean = require( 'gulp-clean' );
var livereload = require('gulp-livereload');
var csscomb = require('gulp-csscomb');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var minifyCss = require('gulp-minify-css');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var htmlhint = require('gulp-htmlhint');
var browserSync = require('browser-sync').create();
var htmlmin = require('gulp-htmlmin');
var autoprefixer = require('gulp-autoprefixer');
var gulpGitStatus = require('gulp-git-status');

gulp.task('default', ['libs', 'build']);

gulp.task('build', ['copy-static', 'css']);

gulp.task('libs', function () {
    return gulp.src(['libs/**/*.min.js'])
        .pipe( gulp.dest(destDir + '/libs') );
});

gulp.task('copy-static', function () {
    return gulp.src(['images/**/*.{png,jpg,svg}', '*.html', '**.*.js'])
        .pipe( gulp.dest(destDir) );
});

gulp.task('images', function () {
    return gulp.src(['**/*.{png,jpg,svg}', '!node_modules/**', '!libs/**'])
        .pipe( gulp.dest(destDir) );
});

gulp.task('html', function () {
    return gulp.src(['**/*.html', '!node_modules/**', '!libs/**', '!bin/**'])
        .pipe(gulpif(argv.prod, htmlmin({collapseWhitespace: true})))
        .pipe( gulp.dest(destDir) );
});

gulp.task('js', function () {
    return gulp.src(['js/**/*.js'])
        .pipe(gulpif(argv.prod, sourcemaps.init()))
        .pipe(concat('build.js'))
        .pipe(uglify())
        .pipe(gulpif(argv.prod, sourcemaps.write()))
        .pipe( gulp.dest(destDir) );
});

gulp.task('css', function () {
    return gulp.src('styles/**/*.less')
        .pipe(gulpif(argv.prod, sourcemaps.init()))
        .pipe(autoprefixer())
        .pipe(concat('styles.css'))
        .pipe(less())
        .pipe(cssnano())
        .pipe(gulpif(argv.prod, sourcemaps.write()))
        .pipe(gulp.dest(destDir + '/static'));
});

gulp.task('bower', function () {
    return bower('libs');
});

gulp.task( 'browsersync', function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
} );

gulp.task('watch-reload', ['browsersync', 'watch'], browserSync.reload);

gulp.task( 'clean', function (cb) {
    return gulp.src( destDir + '/*', { read: false } )
        .pipe( clean( { force: true } ) );
} );


gulp.task( 'watch', function () {
    gulp.watch('styles/*.@(less)',          [ 'css' ] );
    gulp.watch('images/*.{png,jpg,svg}',    [ 'images' ] );
    gulp.watch('*.html',                 [ 'html' ] );
    gulp.watch('js/*.js',                   [ 'js' ] );
} );


//CODESTYLE
gulp.task('csscomb', function () {
    return gulp.src('styles/*.less')
        .pipe(gulpif(!argv.all, gulpGitStatus({
            excludeStatus: 'unchanged'
        })))
        .pipe(csscomb().on('error', handleError))
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('htmlhint', function () {
    return gulp.src(['**/*.html', '!node_modules/**', '!libs/**'])
        .pipe(gulpif(!argv.all, gulpGitStatus({
            excludeStatus: 'unchanged'
        })))
        .pipe(htmlhint('.htmlhintrc'))
        .pipe(htmlhint.reporter())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('jscs', function () {
    return gulp.src('js/*.js')
        .pipe(gulpif(!argv.all, gulpGitStatus({
            excludeStatus: 'unchanged'
        })))
        .pipe(jscs({fix: true}))
        .pipe(jscs.reporter())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('jshint', function () {
    return gulp.src('js/*.js')
        .pipe(gulpif(!argv.all, gulpGitStatus({
            excludeStatus: 'unchanged'
        })))
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('style', ['csscomb', 'htmlhint', 'jscs', 'jshint']);

//CODESTYLE//

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
    return this;
}

