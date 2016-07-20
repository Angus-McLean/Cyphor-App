
var fs = require('fs'),
	gulp = require('gulp'),
	rename = require('gulp-rename'),
	useref = require('gulp-useref'),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify");

var buildUtils = require('./../utils.gulp.js');

module.exports = function (gulp) {

	// pack js
	gulp.task('iframe', function () {
		gulp.src('./iframe/**/*.html')
			.pipe(useref({
				searchPath : './'
			}))
			//.pipe(uglify())
			.pipe(gulp.dest('./dist/iframe'));
	});

};
