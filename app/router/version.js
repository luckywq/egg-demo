'use strict';

const router = app => {
  const { router, controller } = app;
  const filename = 'version';
  const baseUrl = app.versioning('/' + filename);
  router.get(baseUrl, controller[filename].index);
};

module.exports = router;
