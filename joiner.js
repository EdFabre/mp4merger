var exec = require('child_process').exec;
var ffmpeg = require('ffmpeg-static');
var fs = require('fs-extra');

module.exports = class Media {

  /**
   * This method merges the video files within a directory to a single file. the
   * program determines which file is part 2 by searching for the text part in
   * filename.
   *
   * @param  {[type]} pathToVideos /path/to/files/dir
   * @param  {[type]} outDir       /path/to/output/dir
   * @param  {[type]} rgx          Enter Regex to pull output name from inputs. Use '\\' instead of '\' when entering escapes.
   * @return {Promise}             Returns promise in form of a string.
   */
  merge(pathToVideos, outDir, rgxStr) {
    var flags = rgxStr.replace(/.*\/([gimy]*)$/, '$1');
    var pattern = rgxStr.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
    var rgx = new RegExp(pattern, flags);

    return new Promise(function(resolve, reject) {
      search(pathToVideos).then(function(sol) {
        var input1,
          input2;

        if (sol[0].toUpperCase.includes("PART")) {
          input1 = `${pathToVideos}${sol[1]}`;
          input2 = `${pathToVideos}${sol[0]}`;
          outDir = `${outDir}${input1.match(rgx)[0].toUpperCase()}.mp4`
        } else {
          input1 = `${pathToVideos}${sol[0]}`;
          input2 = `${pathToVideos}${sol[1]}`;
          outDir = `${outDir}${input1.match(rgx)[0].toUpperCase()}.mp4`
        }

        var cmd1 = `${ffmpeg.path} -i "${input1}" -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate1.ts`;
        var cmd2 = `${ffmpeg.path} -i "${input2}" -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate2.ts`;
        var cmd3 = `${ffmpeg.path} -i "concat:intermediate1.ts|intermediate2.ts" -c copy -bsf:a aac_adtstoasc "${outDir}"`;
        console.log(`Merging ${input1} and ${input2}`);
        exec(cmd1, function(error, stdout, stderr) {
          if (error == null) {
            exec(cmd2, function(err, stdout, stderr) {
              if (err == null) {
                removeparts(input1, input2);
                exec(cmd3, function(er, stdout, stderr) {
                  if (er == null) {
                    removeintermediate();
                    resolve(`File merged to ${outDir}`);
                  } else {
                    reject(er);
                  }
                });
              } else {
                reject(err);
              }
            });
          } else {
            reject(error);
          }
        });
      })
        .catch(function(err) {
          reject(err);
        });
    });
  }
}

/**
 * This method searches the directory for mp4 files, and returns the names of
 * any mp4 files found.
 *
 * @param  {String} path /path/to/files
 * @return {Promie}      Returns a 2-index Array of path to mp4's.
 */
function search(path) {
  return new Promise(function(resolve, reject) {
    fs.readdir(path, function(err, items) {
      if (err) {
        reject(err);
      } else {
        var results = [];
        for (var i = 0; i < items.length; i++) {
          if (items[i].includes(".mp4")) {
            results.push(items[i]);
          }
        }
        if (results.length == 2) {
          resolve(results);
        } else {
          reject(`Found ${results.length} video's within directory. Cannot complete merge.`);
        }
      }
    });
  });
}

/**
 * Removes temporary files.
 *
 * @return {[type]} [description]
 */
function removeintermediate() {
  return new Promise(function(resolve, reject) {
    fs.remove('./intermediate1.ts', function(err) {
      if (err) reject(err)
      fs.remove('./intermediate2.ts', function(err) {
        if (err) reject(err)
        resolve("Removed Temp Files");
      })
    })
  });
}

/**
 * Removes video's from the filesystem.
 *
 * @param  {String} vid1 /path/to/file1.mp4
 * @param  {String} vid2 /path/to/file2.mp4
 * @return {[type]}      [description]
 */
function removeparts(vid1, vid2) {
  return new Promise(function(resolve, reject) {
    fs.remove(vid1, function(err) {
      if (err) reject(err)
      fs.remove(vid2, function(err) {
        if (err) reject(err)
        resolve(`Removed ${vid1} and ${vid2}`);
      })
    })
  });
}
