# mp4merger [![Build Status](https://travis-ci.org/EdFabre/mp4merger.png?branch=master)](https://travis-ci.org/EdFabre/mp4merger)

This module is used to merge two mp4 files together.

## Installation

```sh
npm install mp4merger --save
```
## Usage

```sh
  const Media = require('mp4merger');
  const media = new Media();

  var pathToVideos = "C:/videos/location";
  var pathToOutput = "C:/output/location/";
  var rgxStr = "/(.*)/";

  media.merge(pathToVideos, pathToOutput, rgxStr)
    .then(function(sol) {
      console.log(sol);
    })
    .catch(function(err) {
      console.error(err);
    });
```

## Dependencies

- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static): ffmpeg static binaries for Mac OSX and Linux and Windows
- [fs-extra](https://github.com/jprichardson/node-fs-extra): fs-extra contains methods that aren&#39;t included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf.

## License

ISC
