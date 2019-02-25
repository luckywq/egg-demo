'use strict';
const router = app => {
  const { router, controller } = app;
  const filename = 'screen';
  const baseUrl = app.versioning('/' + filename);
  router.get(baseUrl + '/listDatas', controller[filename].listDatas); // 获取某楼盘告警规则
};

module.exports = router;
