'use strict';

const router = app => {
  const { router, controller } = app;
  const filename = 'public';
  const baseUrl = app.versioning('/' + filename);
  router.post(baseUrl + '/login', controller[filename].login); // 登录
  router.get(baseUrl + '/getMenu', controller[filename].getMenus); // 获取权限菜单
  router.get(baseUrl + '/companys', controller[filename].getCompanys); // 获取登录账号子公司菜单
  router.get(baseUrl + '/company', controller[filename].getCompanyInfo); // 获取单个公司信息
  router.post(baseUrl + '/companys', controller[filename].addCompany); // 添加公司（楼盘）
  router.put(baseUrl + '/companys', controller[filename].updateCompany); // 修改公司（楼盘）信息
  router.del(baseUrl + '/companys/:company_code/:company_id', controller[filename].delCompany); // 删除公司
  router.put(baseUrl + '/password', controller[filename].password); // 修改密码
  router.get(baseUrl + '/devices', controller[filename].devices); // 设备信息
  router.get(baseUrl + '/dataConfig', controller[filename].dataConfig); // 端口信息

  router.post(baseUrl + '/users', controller[filename].addUser); // 新增账号
  router.get(baseUrl + '/roles', controller[filename].getRoles); // 获取角色
  router.del(baseUrl + '/users/:customer_id/:user_id', controller[filename].delUser); // 删除账户
  router.put(baseUrl + '/users', controller[filename].updateUser); // 修改账户
  router.get(baseUrl + '/users', controller[filename].getUsers); // 获取账户列表
};
module.exports = router;
