'use strict';
const router = app => {
  const { router, controller } = app;
  const filename = 'useLog';
  const baseUrl = app.versioning('/' + filename);
  router.post(baseUrl, controller[filename].create); // 获取某楼盘告警规则
};

module.exports = router;
