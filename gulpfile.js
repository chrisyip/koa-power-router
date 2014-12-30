var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish')

gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules{,/**}']).pipe(jshint()).pipe(jshint.reporter(stylish))
})

gulp.task('default', ['lint'])
