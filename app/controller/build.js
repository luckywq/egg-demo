'use strict';

const Controller = require('egg').Controller;

const filename = 'build';

module.exports = class BuildController extends Controller {

  // 获取公司下实体列表
  async index() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    if (!access_token) {
      ctx.body = { message: '缺少令牌' };
      return;
    }
    const { company_id, type } = ctx.query;
    const requestData = { company_id, type };
    const res = await ctx.service[filename].index(requestData);
    ctx.body = res;
  }

  // 获取实体下设备列表
  async devicesDatas() {
    const { ctx } = this;
    const { build_id } = ctx.query;
    const res = await ctx.service[filename].devicesDatas(build_id);
    ctx.body = res;
  }

  // 新增实体
  async add() {
    const { ctx } = this;
    const { company_id, build } = ctx.request.body;
    const requestData = { company_id, build };
    const res = await this.service[filename].add(requestData);
    ctx.body = res;
  }

  // 删除实体
  async delete() {
    const { ctx } = this;
    const build_id = ctx.params.build_id;
    const res = await this.service[filename].delete(build_id);
    ctx.body = res;
  }

  // 修改实体信息
  async update() {
    const { ctx } = this;
    const { buildings } = ctx.request.body;
    const res = await this.service[filename].update(buildings);
    ctx.body = res;
  }
};
