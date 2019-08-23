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
const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require('browser-sync');
const insert = require('gulp-insert');
const plumber = require('gulp-plumber');
const gulpEjs = require('gulp-ejs');
const gulpRename = require('gulp-rename');
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

// *********** COMMON METHOD ***********

// 現在時刻の取得
const fmtdDate = new Date().toFormat('YYYY-MM-DD HH24MISS');

// clean
const clean = dir => del([dir]);

// *********** DEVELOPMENT TASK ***********

// browserSync
const devServer = done => {
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
  done();
};

const reload = done => {
  browserSync.reload({ stream: true });
  done();
};

// sass
const styles = () =>
  src(`${DIR.SRC_ASSETS}sass/**/*.{sass,scss}`)
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
    .pipe(dest(`${DIR.DEST_ASSETS}css`));

// js
const scripts = () =>
  src(`${DIR.SRC_ASSETS}js/**/*.js`)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig.dev, webpack))
    .pipe(dest(`${DIR.DEST_ASSETS}js`));

// ejs include
const ejs = () =>
  src([`${DIR.SRC}**/*.ejs`, `!${DIR.SRC}_inc/**/*.ejs`])
    .pipe(plumber())
    .pipe(gulpEjs({ INC: Path.resolve(__dirname, `${DIR.SRC}_inc`) + '/' }))
    .pipe(gulpRename({ extname: '.html' }))
    .pipe(dest(DIR.DEST));

// imageMin
const imageMin = () =>
  src(`${DIR.SRC_ASSETS}img/**/*`)
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
    .pipe(dest(`${DIR.DEST_ASSETS}img`));

// watch
const watchEjs = () => watch(`${DIR.SRC}**/*.ejs`, series(ejs, reload));
const watchSass = () =>
  watch(`${DIR.SRC_ASSETS}sass/**/*.{sass,scss}`, series(styles, reload));
const watchJs = () =>
  watch(`${DIR.SRC_ASSETS}js/**/*.js`, series(scripts, reload));

const watches = () => {
  watchEjs();
  watchSass();
  watchJs();
};

const devTask = parallel(ejs, styles, scripts, imageMin);

const build = series(clean.bind(null, DIR.DEST), devTask);

const dev = series(build, devServer, watches);

// *********** RELEASE TASK ***********

// css
const releaseStyles = () =>
  src(`${DIR.DEST_ASSETS}css/*.css`)
    .pipe(
      please({
        sass: false,
        minifier: true,
        rem: false,
        pseudoElements: false
      })
    )
    .pipe(insert.prepend(`/*! compiled at:${fmtdDate}*/\n`))
    .pipe(dest(`${DIR.RELEASE_ASSETS}css`));

// js conat
const releaseScripts = () =>
  webpackStream(webpackConfig.prod, webpack).pipe(
    dest(`${DIR.RELEASE_ASSETS}js`)
  );

// releaesへcopy
const releaseImages = () =>
  src(`${DIR.DEST_ASSETS}img/**/*.{jpg,png,gif,svg,ico}`).pipe(
    dest(`${DIR.RELEASE_ASSETS}img`)
  );

const releaseHtml = () => src(`${DIR.DEST}**/*.html`).pipe(dest(DIR.RELEASE));

// for release

const release = series(
  clean.bind(null, DIR.RELEASE),
  parallel(releaseScripts, releaseImages, releaseHtml, releaseStyles)
);

module.exports = {
  styles,
  scripts,
  imageMin,
  watch,
  default: dev,
  build,
  releaseHtml,
  releaseImages,
  releaseScripts,
  releaseStyles,
  release
};
