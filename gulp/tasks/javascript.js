var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('js', function() {
    gulp.src('index.js')
        .pipe(browserify({
          insertGlobals : true,
          debug : !gulp.env.production
        }))
	   .pipe(uglify({
	   	mangle: false,
	   	compress: true
	   }))
	   .pipe(concat('build.min.js'))
	   .pipe(gulp.dest('src/'))
});