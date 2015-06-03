var gulp = require('gulp');

gulp.task('watch', function() {
	gulp.watch('index.js', ['js']);
});