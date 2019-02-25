'use strict';

const router = app => {
  const { router, controller } = app;
  const filename = 'rules';
  const baseUrl = app.versioning('/' + filename);
  router.get(baseUrl, controller[filename].index); // 获取某楼盘告警规则
  router.put(baseUrl, controller[filename].update); // 修改告警规则
};

module.exports = router;
