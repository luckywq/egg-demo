'use strict';


const router = app => {
  const { router, controller } = app;
  const filename = 'dataConfig';
  const baseUrl = app.versioning('/' + filename);

  router.put(baseUrl, controller[filename].update);
};


module.exports = router;
