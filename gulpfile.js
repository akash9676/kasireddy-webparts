"use strict";

// check if gulp dist was called
if (process.argv.indexOf("dist") !== -1) {
  // add ship options to command call
  process.argv.push("--ship");
}
const gulp = require("gulp");
const build = require("@microsoft/sp-build-web");
const gulpSequence = require("gulp-sequence");
build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);
build.addSuppression(/Warning/gi);
var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);
  result.set("serve", result.get("serve-deprecated"));
  return result;
};
// gulp.task("dist", (done) => {
//   gulp.series("clean");
//   // gulp.series("bundle", () => done());
//   //gulp.series("package-solution");
//   done();
// });
// gulp.task("dist", gulp.series("bundle"));
//gulp.task("dist", gulp.series("clean", "bundle", "package-solution"));
// Create clean distrubution package
// gulp.task("dist", gulpSequence("clean", "bundle", "package-solution"));
// Create clean development package
// gulp.task("dev", gulpSequence("clean", "bundle", "package-solution"));
build.initialize(require("gulp"));
