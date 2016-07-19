
var fs = require('fs'),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify");

function fetchScriptsFromHTML(htmlStr) {
	var scripts = [],
		regexp = /(?:src\=["'])([\w\/\.\-]+\.js)(?:["'])/g;
		
	var match = regexp.exec(htmlStr);
	while(match) {
		scripts.push(match[1]);
		match = regexp.exec(htmlStr);
	}
	return scripts;
}

module.exports = function (gulp) {
	
	gulp.task('public', ['copy_static', 'public_js']);
	
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
	
	gulp.task('public_js', function () {
		var indexStr = fs.readFileSync('./public/index.html');
		var scripts = fetchScriptsFromHTML(indexStr);
		gulp.src(scripts.map((a)=>'.'+a)) 	// path to your files
		.pipe(uglify())
		.pipe(concat('public.js'))
		.pipe(gulp.dest('./dist/public/js'));
	});
	
	
};

