
var fs = require('fs'),
	path = require('path'),
	through = require('through2'),
	_ = require('lodash'),
	merge = require('merge-stream'),
	gulpif = require('gulp-if'),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify");

function recurseRegex(regexp, str) {
	var scripts = [],
		match = regexp.exec(str);
	while(match) {
		scripts.push(match[1]);
		match = regexp.exec(str);
	}
	return scripts;
}

var jsRegex = /(?:src\=["'])([\w\/\.\-]+\.js)(?:["'])/g;
var cssRegex = /(?:href\=["'])([\w\/\.\-]+\.css)(?:["'])/g;
var fetchScriptsFromHTML = _.curry(recurseRegex)(jsRegex);
var fetchCssFromHTML = _.curry(recurseRegex)(cssRegex);

module.exports = function (gulp) {

	gulp.task('public', ['copy_static', 'public_js', 'public_css']);

	gulp.task('copy_static', function () {
		var copy_map = {
			'./public/views/**/*' : './dist/public/views',
			'./public/img/**/*' : './dist/public/img',
			'./public/css/**/*' : './dist/public/css',
			'./build/public/index.html' : './dist/public'
		};
		for(var i in copy_map) {
			gulp.src(i).pipe(gulp.dest(copy_map[i]));
		}
	});

	gulp.task('public_css', function () {
		var indexStr = fs.readFileSync('./public/index.html');
		var styleSheets = fetchCssFromHTML(indexStr);

		gulp.src(styleSheets.map((a)=>'.'+a), {base: '.'}) 	// path to your files
		.pipe(gulp.dest('./dist'));
		/*.pipe(gulp.dest(function (file){
			return path.join('./dist/public', path.dirname(file.path));
		}));*/
	});

	gulp.task('public_js', function () {
		var indexStr = fs.readFileSync('./public/index.html');
		var scripts = fetchScriptsFromHTML(indexStr).map((a)=>'.'+a);

		/*
		var merged = merge();

		merged.add(gulp.src(_.filter(scripts, RegExp.prototype.test.bind(/bower_components/))));
		var custom = gulp.src(_.reject(scripts, RegExp.prototype.test.bind(/bower_components/)))
			.pipe(uglify());

		merged.add(custom);
		merged.pipe(concat('public.js'))
		.pipe(gulp.dest('./dist/public/js'));
		*/

		gulp.src(scripts)
			//.pipe(gulpif(/^((?!bower_components).)*$/, uglify()))
			.pipe(concat('public.js'))
			.pipe(gulp.dest('./dist/public/js'));
	});

};
