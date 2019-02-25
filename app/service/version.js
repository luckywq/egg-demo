'use strict';

const Service = require('egg').Service;

module.exports = class VersionService extends Service {
  async index() {
    const { app } = this;
    const res = await app.mysql.select('bs_app_version_t', {});
    const data = res[0];
    const { versionName, apkUrl, forceUpdate } = data;
    const result = {
      versionName,
      apkUrl,
      forceUpdate: forceUpdate === 0 ? false : true, // eslint-disable-line
    };
    // return app.standardRes(200, 'success:get_version', result);
    return result;
  }
};
