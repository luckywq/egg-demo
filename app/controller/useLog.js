'use strict';
const Controller = require('egg').Controller;
const filename = 'useLog';
module.exports = class UseLogController extends Controller {
  async create() {
    const { ctx } = this;
    const { logInfo } = ctx.request.body;
    const date = new Date();
    logInfo.date = date;
    const res = await ctx.service[filename].create(logInfo);
    ctx.body = res;
  }
};
