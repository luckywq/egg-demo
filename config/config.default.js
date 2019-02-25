'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1531878852762_4845';

  // add your config here
  // config.middleware = [ 'authorize' ];

  config.serverList = {
    authorizeServer: 'http://121.42.253.149:18866', // 鉴权服务地址
    companiesServer: 'http://121.42.253.149:18825', // 获取子公司服务地址
  };

  config.client = {
    client_id: 'build',
    client_secret: 'build',
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  config.mysql = {
    client: {
      host: '121.42.253.149',
      port: '3307',
      user: 'building_user',
      password: 'finfobuild123',
      database: 'building-safety',
    },
    app: true,
    agent: false,
  };

  config.version = appInfo.pkg.version;
  config.actk = '';

  return config;
};
