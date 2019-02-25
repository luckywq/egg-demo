'use strict';


const Controller = require('egg').Controller;

const filename = 'public';

module.exports = class CurrentController extends Controller {
  // d登录
  async login() {
    const { ctx } = this;
    const { body } = ctx.request;
    const res = await this.ctx.service[filename].login(body);
    ctx.body = res;
  }

  // 获取权限菜单
  async getMenus() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const requestData = { access_token };
    const res = await this.ctx.service[filename].getMenus(requestData);
    ctx.body = res;
  }

  // 获取公司列表
  async getCompanys() {
    const { ctx } = this;
    const { company_code, customer_id, type } = ctx.query;
    const { actk: access_token } = ctx.request.headers;
    const requestData = { company_code, customer_id, access_token, type };
    const res = await ctx.service[filename].getCompanys(requestData);
    ctx.body = res;
  }

  // 获取单个公司信息
  async getCompanyInfo() {
    const { ctx } = this;
    const { company_id } = ctx.query;
    const { actk: access_token } = ctx.request.headers;
    const requestData = { company_id, access_token };
    const res = await ctx.service[filename].getCompanyInfo(requestData);
    ctx.body = res;
  }

  // 添加公司
  async addCompany() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { parent_code, customer_id, company_name, address, mobile, build_count, alarmRules } = ctx.request.body;
    const requestData = { parent_code, customer_id, company_name, address, mobile, build_count, alarmRules };
    const res = await ctx.service[filename].addCompany(access_token, requestData);
    ctx.body = res;
  }

  // 修改公司信息
  async updateCompany() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { company_id, customer_id, company_name, company_code, address } = ctx.request.body;
    const requestData = { access_token, company_id, customer_id, company_name, company_code, address };
    const res = await ctx.service[filename].updateCompany(requestData);
    ctx.body = res;
  }

  // 删除公司
  async delCompany() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { company_id, company_code } = ctx.params;
    const requestData = { access_token, company_id, company_code };
    const res = await ctx.service[filename].delCompany(requestData);
    ctx.body = res;
  }

  // 修改密码
  async password() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { old_password, new_password } = ctx.request.body;
    const confirm_password = new_password;
    const requestData = { access_token, old_password, new_password, confirm_password };
    const res = await ctx.service[filename].password(requestData);
    ctx.body = res;
  }

  // 获取设备
  async devices() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { opts = '{}' } = ctx.query;
    const requestData = { access_token, opts: JSON.parse(opts) };
    const result = await ctx.service[filename].devices(requestData);
    ctx.body = result;
  }

  // 获取数据
  async dataConfig() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { opts = '{}' } = ctx.query;
    const requestData = { access_token, opts: JSON.parse(opts) };
    const result = await ctx.service[filename].dataConfig(requestData);
    ctx.body = result;
  }

  // 获取角色
  async getRoles() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { customer_id } = ctx.query;
    const requestData = { access_token, customer_id };
    const res = await ctx.service[filename].getRoles(requestData);
    ctx.body = res;
  }

  // 获取账户列表
  async getUsers() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { customer_id } = ctx.query;
    const requestData = { access_token, customer_id };

    const res = await ctx.service[filename].getUsers(requestData);
    ctx.body = res;
  }

  // 添加账号（用户）
  async addUser() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { roles, company_id, fullname, username, system, password, mobile, status, customer_id } = ctx.request.body.userInfo;
    const requestData = { access_token, roles, company_id, fullname, username, system, password, mobile, status, customer_id };
    const res = await this.service[filename].addUser(requestData);
    ctx.body = res;
  }

  // 删除账户
  async delUser() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { user_id, customer_id } = ctx.params;
    const requestData = { access_token, user_id, customer_id };
    const res = await ctx.service[filename].delUser(requestData);
    ctx.body = res;
  }

  // 修改账户
  async updateUser() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { _id: user_id, company_id, system, fullname, password, username, mobile, status, customer_id, roles } = ctx.request.body.userInfo;
    const requestData = { user_id, access_token, company_id, system, fullname, password, username, mobile, status, customer_id, roles };
    const res = await ctx.service[filename].updateUser(requestData);
    ctx.body = res;
  }
};

