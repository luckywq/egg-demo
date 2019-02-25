'use strict';

const router = app => {
  const { router, controller } = app;
  const filename = 'alarm';
  const baseUrl = app.versioning('/' + filename);

  router.get(baseUrl + '/allHistory', controller[filename].allHistory); // 获取实体下的设备列表
  router.get(baseUrl + '/alarmCount', controller[filename].alarmCount); // 获取告警次数
  router.get(baseUrl + '/alarmProportion', controller[filename].alarmProportion); // 获取告警占比
};

module.exports = router;
