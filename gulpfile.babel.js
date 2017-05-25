'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import cleanCSS from 'gulp-clean-css';
import del from 'del';

const DIR = {
	SRC: 'public',
	DEST: 'public/dist',
};

const SRC = {
	JS: DIR.SRC + '/javascripts/*.js',
	CSS: DIR.SRC + '/stylesheets/*.css',
};

const DEST = {
	JS: DIR.DEST + '/js',
	CSS: DIR.DEST + '/css',
};

gulp.task('default', ['clean', 'concatjs', 'concatugjs', 'concatcss', 'concatugcss'], () => {
	gutil.log('Gulp is running');
});

gulp.task('clean', () => {
	return del.sync([DIR.DEST]);
});

gulp.task('concatugjs', () => {
	return gulp.src(SRC.JS)
			   .pipe(concat('biochart.min.js'))
			   .pipe(uglify())
			   .on('error', function (err)	{
			   	gutil.log(gutil.colors.red('[Error]'), err.toString())
			   })
			   .pipe(gulp.dest(DEST.JS));
});

gulp.task('concatjs', () => {
	return gulp.src(SRC.JS)
			   .pipe(concat('biochart.js'))
			   .pipe(gulp.dest(DEST.JS));
});

gulp.task('concatcss', () => {
	return gulp.src(SRC.CSS)
			   .pipe(concat('biochart.css'))
			   .pipe(gulp.dest(DEST.CSS));
});

gulp.task('concatugcss', () => {
	return gulp.src(SRC.CSS)
			   .pipe(concat('biochart.min.css'))
			   .pipe(cleanCSS({compatibility: 'ie8'}))
			   .pipe(gulp.dest(DEST.CSS));
});
