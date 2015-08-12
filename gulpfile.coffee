browserify = require('browserify')
coffeeify = require('coffeeify')
derequire = require('gulp-derequire')
gulp = require('gulp')
gutil = require('gulp-util')
karma = require('karma').server
mocha = require('gulp-mocha')
rename = require('gulp-rename')
rimraf = require('gulp-rimraf')
source = require('vinyl-source-stream')
uglify = require('gulp-uglify')

gulp.task 'clean', ->
  gulp.src('./sorted-set.js', read: false)
    .pipe(rimraf())

gulp.task 'browserify', [ 'clean' ], ->
  b = browserify('./src/SortedSet.coffee', {
    extensions: [ '.js', '.coffee' ]
    standalone: 'SortedSet'
  })
  b.transform(coffeeify)

  b.bundle()
    .on('error', (e) -> gutil.log('Browserify error', e))
    .pipe(source('sorted-set.js'))
    .pipe(derequire())
    .pipe(gulp.dest('.'))

gulp.task 'minify', [ 'browserify' ], ->
  gulp.src('sorted-set.js')
    .pipe(uglify())
    .pipe(rename(suffix: '.min'))
    .pipe(gulp.dest('.'))

gulp.task 'test-browser', (done) ->
  karma.start({
    singleRun: true
    browsers: [ 'PhantomJS' ]
    frameworks: [ 'mocha', 'chai', 'browserify' ]
    reporters: [ 'dots' ]
    browserify:
      debug: true
      extensions: [ '.js', '.coffee' ]
      files: [ 'test/**/*Spec.coffee' ]
      transform: [ coffeeify ]
    preprocessors:
      '**/*.coffee': 'coffee'
      '/**/*.browserify': 'browserify'
  }, done)

gulp.task 'test-node', (done) ->
  gulp.src('test/**/*Spec.coffee', read: false)
    .pipe(mocha({
      compilers: [
        coffee: 'coffee-script/register'
      ]
      reporter: 'dot'
    }))
    .on('error', gutil.log)

gulp.task 'test', [ 'test-browser', 'test-node' ]

gulp.task('default', [ 'minify' ])
