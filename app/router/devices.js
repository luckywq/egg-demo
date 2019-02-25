'use strict';


const router = app => {
  const { router, controller } = app;
  const filename = 'devices';
  const baseUrl = app.versioning('/' + filename);

  router.get(baseUrl, controller[filename].index); // 获取公司下实体列表
  router.get(baseUrl + '/historys', controller[filename].history);
  router.post(baseUrl, controller[filename].create);
};


module.exports = router;
