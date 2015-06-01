var gulp = require('gulp');

gulp.task('watch', function() {
	gulp.watch('source/*.js', ['js']);
});