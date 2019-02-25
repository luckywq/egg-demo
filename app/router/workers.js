'use strict';

const router = app => {
  const { router, controller } = app;
  const filename = 'workers';
  const baseUrl = app.versioning('/' + filename);
  router.get(baseUrl, controller[filename].index); // 获取楼盘工作人员--all
  router.get(baseUrl + '/:worker_id', controller[filename].worker); // 获取楼盘工作人员--single
  router.post(baseUrl, controller[filename].create); // 新增工作人员
  router.put(baseUrl, controller[filename].update); // 修改工作人员
};

module.exports = router;
