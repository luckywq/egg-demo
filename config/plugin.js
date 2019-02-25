'use strict';

// had enabled by egg
// exports.static = true;
const plugins = {
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  // validate: {
  //   enable: true,
  //   package: 'egg-validate',
  // },
};

module.exports = plugins;
