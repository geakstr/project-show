var gulp = require('gulp'),
  stylus = require('gulp-stylus'),
  run = require('gulp-run'),
  autoprefixer = require('gulp-autoprefixer'),
  koutoSwiss = require("kouto-swiss"),
  browserSync = require('browser-sync'),
  nodemon = require('gulp-nodemon'),
  reload = browserSync.reload;

gulp.task('dev', ['stylus-dev', 'js-dev', 'move-dev'], function() {
  browserSync({
    proxy: "project.show:8000",
    notify: false,
    open: false
  });

  gulp.watch('app/src/frontend/stylus/*.styl', ['stylus-dev']);
  gulp.watch('app/src/frontend/js/*.js', ['js-dev']);
  gulp.watch("app/www/*.html").on('change', reload);

  nodemon({
    script: 'app/src/backend/server.js',
    ext: 'js html',
    nodeArgs: ['--harmony'],
    env: {
      'NODE_ENV': 'development'
    }
  })
});

gulp.task('stylus-dev', function() {
  gulp.src('app/src/frontend/stylus/*.styl')
    .pipe(stylus({
      'include css': true,
      'use': [koutoSwiss()]
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(gulp.dest('app/www/static/css'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('js-dev', function() {
  run('lmd build app').exec(function() {
    reload();
  });
});

gulp.task('move-dev', function() {
  gulp.src([
    './bower_components/jquery/dist/jquery.min.js',
    './bower_components/jquery/dist/jquery.js',
    './bower_components/jquery/dist/jquery.min.map',
    './bower_components/socket.io-client/socket.io.js',
  ]).pipe(gulp.dest('./app/www/static/vendor'));
});