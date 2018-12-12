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
const gulpPug = require('gulp-pug');
const gulpFileinclude = require('gulp-file-include');
const gulpEjs = require('gulp-ejs');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const please = require('gulp-pleeease');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const Path = require('path');
const del = require('del');
const DIR = require('./DIR.js')();
require('date-utils');

// pug or fileinclude or ejs
const HTML_TASK = 'ejs';

// *********** COMMON METHOD ***********

// html buildタスクの拡張子
const htmlExpanded = HTML_TASK === 'fileinclude' ? 'html' : HTML_TASK;

// 現在時刻の取得
const fmtdDate = new Date().toFormat('YYYY-MM-DD HH24MISS');

// clean
const clean = dir => {
  return del([dir]);
};

// *********** DEVELOPMENT TASK ***********

// browserSync
const devServer = async () => {
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
};

const reload = async fn => {
  await fn();
  browserSync.reload();
};

// sass
const styles = () =>
  gulp
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
    .pipe(gulp.dest(`${DIR.DEST_ASSETS}css`));

// js
const scripts = () =>
  gulp
    .src(`${DIR.SRC_ASSETS}js/**/*.js`)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig.dev, webpack))
    .pipe(gulp.dest(`${DIR.DEST_ASSETS}js`));

// html include
const fileinclude = () =>
  gulp
    .src([`${DIR.SRC}**/*.html`, `!${DIR.SRC}_inc/**/*.html`])
    .pipe(plumber())
    .pipe(
      gulpFileinclude({
        prefix: '@@',
        basepath: 'app/src/_inc'
      })
    )
    .pipe(gulp.dest(DIR.DEST));

// pug
const pug = () =>
  gulp
    .src([`${DIR.SRC}**/*.pug`, `!${DIR.SRC}_inc`, `!${DIR.SRC}_inc/**/*.pug`])
    .pipe(plumber())
    .pipe(
      gulpPug({
        pretty: true,
        basedir: DIR.SRC
      })
    )
    .pipe(gulp.dest(DIR.DEST));

// ejs include
const ejs = () =>
  gulp
    .src([`${DIR.SRC}**/*.ejs`, `!${DIR.SRC}_inc/**/*.ejs`])
    .pipe(plumber())
    .pipe(
      gulpEjs(
        { INC: Path.resolve(__dirname, `${DIR.SRC}_inc`) + '/' },
        {},
        { ext: '.html' }
      )
    )
    .pipe(gulp.dest(DIR.DEST));

// bundle html task
const html = {
  ejs,
  fileinclude,
  pug
};

// imageMin
const imageMin = () =>
  gulp
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
    .pipe(gulp.dest(`${DIR.DEST_ASSETS}img`));

// watch
const watch = async () => {
  gulp.watch(
    `${DIR.SRC}**/*.${htmlExpanded}`,
    reload.bind(null, html[HTML_TASK])
  );
  gulp.watch(
    `${DIR.SRC_ASSETS}sass/**/*.{sass,scss}`,
    reload.bind(null, styles)
  );
  gulp.watch(`${DIR.SRC_ASSETS}js/**/*.js`, reload.bind(null, scripts));
};

const devTask = gulp.parallel(html[HTML_TASK], styles, scripts, imageMin);

const build = gulp.series(clean.bind(null, DIR.DEST), devTask);

const dev = gulp.series(build, devServer, watch);

// *********** RELEASE TASK ***********

// css
const releaseStyles = () =>
  gulp
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

// js conat
const releaseScripts = () =>
  webpackStream(webpackConfig.prod, webpack).pipe(
    gulp.dest(`${DIR.RELEASE_ASSETS}js`)
  );

// releaesへcopy
const releaseImages = () =>
  gulp
    .src(`${DIR.DEST_ASSETS}img/**/*.{jpg,png,gif,svg,ico}`)
    .pipe(gulp.dest(`${DIR.RELEASE_ASSETS}img`));

const releaseHtml = () =>
  gulp.src(`${DIR.DEST}**/*.html`).pipe(gulp.dest(DIR.RELEASE));

// for release

const release = gulp.series(
  clean.bind(null, DIR.RELEASE),
  gulp.parallel(releaseScripts, releaseImages, releaseHtml, releaseStyles)
);

module.exports = {
  styles,
  scripts,
  imageMin,
  watch,
  ...html,
  default: dev,
  build,
  releaseHtml,
  releaseImages,
  releaseScripts,
  releaseStyles,
  release
};
