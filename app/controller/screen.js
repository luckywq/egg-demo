'use strict';

const Controller = require('egg').Controller;

module.exports = class ScreenService extends Controller {
  async listDatas() {
    const { ctx } = this;
    // const { actk: access_token } = ctx.request.headers;
    const { company_code, actk: access_token } = ctx.request.query;
    const requestData = { access_token, company_code };
    const res = await ctx.service.screen.listDatas(requestData);
    ctx.body = res;
  }
};
