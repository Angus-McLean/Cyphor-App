
var fs = require('fs'),
	through = require('through2'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	rename = require('gulp-rename'),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	babel = require('gulp-babel');

var manifest = JSON.parse(fs.readFileSync('./manifest.json'));

function empty () {
	return through.obj(function (f, enc, cb) {
		console.log('empty : '+f.path);
		cb(null, f);
	});
}

function regexTest(regex) {
	return function (file) {
		return regex.test(file.path);
	};
}

module.exports = function (gulp) {

	// background
	gulp.task('background', function () {
		gulp.src(manifest.background.scripts) // path to your files
		.pipe(gulpif(regexTest(/bower_components/), empty(), babel({
			presets : ['es2015']
		})))
		.pipe(gulpif(regexTest(/bower_components/), empty(), uglify()))
		.pipe(concat('background.js'))
		.pipe(gulp.dest('./dist'));
	});

	// content
	gulp.task('content', function () {
		gulp.src(manifest.content_scripts[0].js) // path to your files
		.pipe(gulpif(regexTest(/bower_components/), empty(), babel({
			presets : ['es2015']
		})))
		.pipe(gulpif(regexTest(/bower_components/), empty(), uglify()))

		// .pipe(babel({
		// 	presets : ['es2015']
		// }))
		// .pipe(uglify())
		.pipe(concat('content.js'))
		.pipe(gulp.dest('./dist'));
	});

	// iframe
	require('./iframe.gulp.js')(gulp);

	// injectables
	gulp.task('injectables', function () {
		gulp.src('./injectables/**/*').pipe(gulp.dest('./dist/injectables'));
	});

	gulp.task('manifest', function () {
		gulp.src('./build/manifest.prod.js')
			.pipe(rename('manifest.json'))
			.pipe(gulp.dest('./dist'));
	});

	gulp.task('app', ['background', 'content', 'manifest', 'iframe', 'injectables']);
};
