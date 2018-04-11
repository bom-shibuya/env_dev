'use strict';

/*
    ██████╗ ██╗   ██╗██╗     ██████╗
    ██╔════╝ ██║   ██║██║     ██╔══██╗
    ██║  ███╗██║   ██║██║     ██████╔╝
    ██║   ██║██║   ██║██║     ██╔═══╝
    ╚██████╔╝╚██████╔╝███████╗██║
      ╚═════╝  ╚═════╝ ╚══════╝╚═╝
 */

// module import
const gulp = require('gulp');
const browserSync = require('browser-sync');
const insert = require('gulp-insert');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const fileinclude = require('gulp-file-include');
const runSequence = require('run-sequence');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const please = require('gulp-pleeease');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const del = require('del');
const DIR = require('./DIR.js')();
require('date-utils');

// pug or fileinclude
const HTML_TASK = 'fileinclude';

// *********** COMMON METHOD ***********

// 現在時刻の取得
const fmtdDate = new Date().toFormat('YYYY-MM-DD HH24MISS');

// clean
let cleanDIR;
gulp.task('clean', cb => {
  return del([cleanDIR], cb);
});

// *********** DEVELOPMENT TASK ***********

// browserSync
gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: DIR.DEST
    },
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: false
    }
  });
});

// sass
gulp.task('sass', () => {
  return gulp
    .src(`${DIR.SRC_ASSETS}sass/**/*.{sass,scss}`)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(
      sass({
        includePaths: 'node_modules/tokyo-shibuya-reset',
        outputStyle: ':expanded'
      }).on('error', sass.logError)
    )
    .pipe(
      please({
        sass: false,
        minifier: false,
        rem: false,
        pseudoElements: false,
        mqpacker: true
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${DIR.DEST_ASSETS}css`))
    .pipe(browserSync.stream());
});

// js
gulp.task('scripts', () => {
  return gulp
    .src(`${DIR.SRC_ASSETS}js/**/*.js`)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig.dev, webpack))
    .pipe(gulp.dest(`${DIR.DEST_ASSETS}js`))
    .pipe(browserSync.stream());
});

// html include
gulp.task('fileinclude', () => {
  return gulp
    .src([`${DIR.SRC}**/*.html`, `!${DIR.SRC}_inc/**/*.html`])
    .pipe(plumber())
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: 'app/src/_inc'
      })
    )
    .pipe(gulp.dest(DIR.DEST))
    .pipe(browserSync.stream());
});

// pug
gulp.task('pug', () => {
  gulp
    .src([`${DIR.SRC}**/*.pug`, `!${DIR.SRC}_inc`, `!${DIR.SRC}_inc/**/*.pug`])
    .pipe(plumber())
    .pipe(
      pug({
        pretty: true,
        basedir: DIR.SRC
      })
    )
    .pipe(gulp.dest(DIR.DEST))
    .pipe(browserSync.stream());
});

// imageMin
gulp.task('imageMin', () => {
  return gulp
    .src(`${DIR.SRC_ASSETS}img/**/*`)
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({
            optimizationLevel: 3,
            interlaced: true
          }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({ removeViewBox: false })
        ],
        { verbose: true }
      )
    )
    .pipe(gulp.dest(`${DIR.DEST_ASSETS}img`))
    .pipe(browserSync.stream());
});

// watch
gulp.task('watch', () => {
  const htmlExpanded = HTML_TASK === 'pug' ? 'pug' : 'html';
  gulp.watch(`${DIR.SRC}**/*.${htmlExpanded}`, [HTML_TASK]);
  gulp.watch(`${DIR.SRC_ASSETS}sass/**/*.{sass,scss}`, ['sass']);
  gulp.watch(`${DIR.SRC_ASSETS}js/**/*.js`, ['scripts']);
});

// only build
gulp.task('build', () => {
  cleanDIR = DIR.DEST;
  runSequence('clean', [HTML_TASK, 'scripts', 'sass', 'imageMin']);
});

// default
gulp.task('default', () => {
  cleanDIR = DIR.DEST;
  runSequence(
    'clean',
    [HTML_TASK, 'scripts', 'sass', 'imageMin'],
    'browserSync',
    'watch'
  );
});

// *********** RELEASE TASK ***********

// css
gulp.task('prodStyle', () => {
  return gulp
    .src(`${DIR.DEST_ASSETS}css/*.css`)
    .pipe(
      please({
        sass: false,
        minifier: true,
        rem: false,
        pseudoElements: false
      })
    )
    .pipe(insert.prepend(`/*! compiled at:${fmtdDate}*/\n`))
    .pipe(gulp.dest(`${DIR.RELEASE_ASSETS}css`));
});

// js conat
gulp.task('prodScript', () => {
  return webpackStream(webpackConfig.prod, webpack).pipe(
    gulp.dest(`${DIR.RELEASE_ASSETS}js`)
  );
});

// releaesへcopy
gulp.task('prodCopy', () => {
  // img
  gulp
    .src(`${DIR.DEST_ASSETS}img/**/*.{jpg,png,gif,svg,ico}`)
    .pipe(gulp.dest(`${DIR.RELEASE_ASSETS}img`));
  // html
  gulp.src(`${DIR.DEST}**/*.html`).pipe(gulp.dest(DIR.RELEASE));
});

// for release
gulp.task('release', () => {
  cleanDIR = DIR.RELEASE;
  runSequence('clean', ['prodStyle', 'prodScript', 'prodCopy']);
});
