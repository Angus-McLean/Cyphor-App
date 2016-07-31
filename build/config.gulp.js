
var rename = require('gulp-rename');

module.exports = function (gulp) {

	gulp.task('manifest', function () {
		gulp.src('./build/manifest.prod.js')
			.pipe(rename('manifest.json'))
			.pipe(gulp.dest('./dist'));
	});

	gulp.task('config', function () {
		gulp.src('./build/config.prod.json')
			.pipe(rename('config.json'))
			.pipe(gulp.dest('./dist'));
	});

	gulp.task('app-config', ['manifest', 'config']);
};
