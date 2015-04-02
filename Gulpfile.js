#! /Users/brandondail/.npm-packages/bin/gulp --silent

/* Node and gulp packages  */

var gulp        = require('gulp');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-sass');
var minifyCSS 	= require('gulp-minify-css');
var plumber     = require('gulp-plumber');
var inject		= require('gulp-inject');
var del 		= require('del');
var gutil 		= require('gulp-util');
var browserSync = require('browser-sync');
var sourcemaps 	= require('gulp-sourcemaps');
var reload 		= browserSync.reload;


/* @name path
 * @type object
 * @desc stores all source, destination, and temporary (used to serve files to browserSync) file paths
 */

var path = {
 js:     { src: ['src/scripts/**/*.js'], tmp: 'tmp/scripts/', tmpsrc: 'tmp/scripts/**/*.js', dest: 'dest/scripts/'},
 sass :  { src: ['src/styles/**/*.scss'], tmp: 'tmp/styles/', tmpsrc:'tmp/styles/*.css', srcmaps: 'tmp/styles/maps', dest: 'dest/styles/'},
 html :  { src: ['src/*.html'], tmp: './tmp', tmpsrc: 'tmp/*.html', dest: 'dest/'}
};


/* Default Gulp task  */
gulp.task('default', ['build:tmp', 'serve', 'watch']);














/*@class UtlityTasks
 *@desc all tasks used for basic file management and general utlities such as servers.
 */

/* Clear out the entire tmp folder */
gulp.task('clean:tmp', function(){
	del(['tmp/**/**/'])
	gutil.log('tmp folder cleaned');
});



//Serve files from tmp directory 

gulp.task('serve', [], function(){

	browserSync({
		server: {
			port: 8080,
			baseDir: './tmp'
		}
	});

});


// Initial build of /tmp folder for file serving 
gulp.task('build:tmp', ['clean:tmp','build:js:tmp', 'build:sass:tmp'], function(){

	return	gulp.src(path.html.src)
				.pipe(inject(gulp.src([path.js.tmpsrc, path.sass.tmpsrc]), {read: false, cwd: __dirname + '/tmp'})))
				.pipe(gulp.dest(path.html.tmp))
				.pipe(reload({stream: true}));

});



// Watch files and re-build tmp files on change
gulp.task('watch', function(){

	gulp.watch(path.js.src,   ['watch:js'  ]);
	gulp.watch(path.sass.src, ['watch:sass']);
	gulp.watch(path.html.src, ['watch:html']);

});










/*@class htmltasks
 *@desc used to minify and manipulate html files
 */


/* Delete all tmp/*.html files */
gulp.task('clean:html:tmp', function(){
	del([path.html.tmpsrc])
})


/* Re-build files on watch */
gulp.task('watch:html', ['clean:html:tmp'], function(){

	console.log('BUILDING AND INJECTING');
	return	gulp.src(path.html.src)
			.pipe(inject(gulp.src(['./styles/*.css', './scripts/*.js'], {read: false, cwd: __dirname + '/tmp'})))
			.pipe(gulp.dest(path.html.tmp))
			.pipe(reload({stream: true}));
});










/*@class JavascriptTasks
 *@desc used for Javascript concatenation and minification
 */

gulp.task('clean:js:tmp', function(){

	del([path.js.tmpsrc]);

});

gulp.task('build:js:tmp', ['watch:js']);

/* minfiy Javascript files */
gulp.task('uglify', function(){

	return	gulp.src(path.js.src)
			.pipe(uglify())
			.pipe(gulp.dest(path.js.dest));
});

gulp.task('watch:js', ['uglify', 'clean:js:tmp'], function(){

	return	gulp.src(path.js.src)
			.pipe(gulp.dest(path.js.tmp))
			.pipe(reload({stream: true}));
});
















/*@class StyleTasks
 *@desc builds Sass to CSS and handles all Sass/CSS optimization
 */


gulp.task('clean:sass:tmp', function(){
	del([path.sass.tmpsrc]);
})


gulp.task('build:sass:tmp', ['sass', 'watch:sass']);

/* build sass files */
gulp.task('sass', function(){

	return	gulp.src(path.sass.src)
			.pipe(sass({errLogToConsole: true, }))
			.pipe(gulp.dest(path.sass.dest));
});

/* buils sass files for temporary use */
gulp.task('watch:sass', ['clean:sass:tmp'], function(){

	return	gulp.src(path.sass.src)
			.pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(sass({errLogToConsole: true}))
			.pipe(minifyCSS())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.sass.tmp))
			.pipe(reload({stream: true}));

});


