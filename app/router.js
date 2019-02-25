'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./router/public')(app); // 公共接口合集
  require('./router/build')(app);
  require('./router/devices')(app);
  require('./router/alarm')(app);
  require('./router/rules')(app);
  require('./router/useLog')(app);
  require('./router/screen')(app); // 电子大屏数据接口集合
  require('./router/workers')(app);
  require('./router/dataConfig')(app);
  require('./router/version')(app);
};
