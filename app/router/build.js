'use strict';

const router = app => {
  const { router, controller } = app;
  const filename = 'build';
  const baseUrl = app.versioning('/' + filename);
  router.get(baseUrl, controller[filename].index); // 获取公司下实体列表
  router.get(baseUrl + '/devicesDatas', controller[filename].devicesDatas); // 获取实体下的设备列表
  router.del(baseUrl + '/:build_id', controller[filename].delete); // 删除实体
  router.post(baseUrl, controller[filename].add); // 新增实体
  router.put(baseUrl, controller[filename].update); // 修改实体信息
};

module.exports = router;
