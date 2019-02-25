'use strict';

const Controller = require('egg').Controller;
const filename = 'devices';

class deviceController extends Controller {

  // 获取实体下的设备信息
  async index() {
    const { ctx } = this;
    const { build_id } = ctx.query;
    const res = await ctx.service[filename].index(build_id);
    ctx.body = res;
  }

  // 获取某设备某端口历史数据
  async history() {
    const { ctx } = this;
    const query = ctx.query;
    // console.log(query);
    const res = await ctx.service[filename].history(query);
    ctx.body = res;
  }

  // 实体绑定设备
  async create() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { build_id, devices } = ctx.request.body;
    const requestData = { access_token, build_id, devices };
    const result = await ctx.service[filename].create(requestData);
    ctx.body = result;
  }
}

module.exports = deviceController;
