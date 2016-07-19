
var fs = require('fs'),
	gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify");

var manifest = JSON.parse(fs.readFileSync('./manifest.json'));


module.exports = function (gulp) {
	
	// background
	gulp.task('background', function () {
		gulp.src(manifest.background.scripts) // path to your files
		.pipe(uglify())
		.pipe(concat('background.js'))
		.pipe(gulp.dest('./dist'));
	});
	
	// content
	gulp.task('content', function () {
		gulp.src(manifest.content_scripts[0].js) // path to your files
		.pipe(uglify())
		.pipe(concat('content.js'))
		.pipe(gulp.dest('./dist'));
	});
	
	gulp.task('manifest', function () {
		gulp.src('./build/manifest.prod.js')
			.pipe(rename('manifest.json'))
			.pipe(gulp.dest('./dist'));
	});
	
	gulp.task('app', ['background', 'content', 'manifest']);
};