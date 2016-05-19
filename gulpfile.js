var gulp = require('gulp'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

var srcJs = './src/**/*.js';

var distPath = './dist';

var tasks = ['js-clean', 'js-uglify'];

gulp.task('js-uglify', ['js-clean'], function() {
    return gulp.src(srcJs)
    .pipe(uglify())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(gulp.dest(distPath));
});

gulp.task('js-clean', function() {
    return gulp.src(distPath, {read: false})
    .pipe(clean());
});

gulp.task('default', tasks, function() {
    return gulp.watch([srcJs], ['js-uglify']);
});
