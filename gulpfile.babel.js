import gulp from "gulp";
import gpug from "gulp-pug";
import { deleteAsync } from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import babelify from "babelify";
import js from "gulp-bro";
import ghPage from "gulp-gh-pages";

const route = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

// prepare
const clean = async () => await deleteAsync(["build"]);
const sass = gulpSass(dartSass);
const copy = {
  img: () =>
    gulp.src(route.img.src).pipe(image()).pipe(gulp.dest(route.img.dest)),
  pug: () =>
    gulp.src(route.pug.src).pipe(gpug()).pipe(gulp.dest(route.pug.dest)),
  scss: () =>
    gulp
      .src(route.scss.src)
      .pipe(sass().on("error", sass.logError))
      .pipe(autoprefixer())
      .pipe(miniCSS())
      .pipe(gulp.dest(route.scss.dest)),
  js: () =>
    gulp
      .src(route.js.src)
      .pipe(
        js({
          transform: [
            babelify.configure({ presets: ["@babel/preset-env"] }),
            ["uglifyify", { global: true }],
          ],
        })
      )
      .pipe(gulp.dest(route.js.dest)),
};

const watch = () => {
    gulp.watch(route.pug.watch, copy.pug);
    gulp.watch(route.img.src, copy.img);
    gulp.watch(route.scss.watch, copy.scss);
    gulp.watch(route.js.watch, copy.js);
};

const gh = () => gulp.src("build/**/*").pipe(ghPage());
const prepare = gulp.series([clean]);
const assets = gulp.series([copy.img, copy.scss, copy.js, copy.pug]);
const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));
const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh]);
