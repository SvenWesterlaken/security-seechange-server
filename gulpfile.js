const gulp = require('gulp');
const sonarqubeScanner = require('sonarqube-scanner');
const runSequence = require('run-sequence');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');

gulp.task('sonarqube', ['test'], function(callback) {
    sonarqubeScanner({
        serverUrl: "https://sonarqube.com",
        options: {
            "sonar.organization": "matsgemmeke-github",
            "sonar.projectKey": "seechange",
            "sonar.login": "c2ad07a63823c4ccfe2d233c8463ac174d1143ba",
            "sonar.projectName": "seechange",
            "sonar.working.directory": "./.sonar",
            "sonar.tests": "test",
            "sonar.javascript.lcov.reportPath": "coverage/lcov.info",
            "sonar.exclusions": "gulpfile.js, .gitignore, *.md, *.yml, *.sql, *.txt, *.json, node_modules/**, coverage/**, test/**",
            "sonar.verbose": "true"
        }
    }, callback);
});

gulp.task('test', ['pre-test'], function() {
    return gulp.src(['test_genAuth.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports());
});

gulp.task('pre-test', function() {
    return gulp.src(['*.js', 'api/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('default', function() {
    runSequence('sonarqube');
});