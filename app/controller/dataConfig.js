'use strict';
const Controller = require('egg').Controller;
const filename = 'dataConfig';
module.exports = class ConfigController extends Controller {
  async update() {
    const { ctx } = this;
    const { device_id } = ctx.query;
    const res = await ctx.service[filename].update(device_id);
    ctx.body = res;
  }
};
