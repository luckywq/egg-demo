'use strict';

const Controller = require('egg').Controller;

const filename = 'rules';

module.exports = class RuleController extends Controller {
  async index() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { company_id } = ctx.query;
    const requestData = { access_token, company_id };
    const res = await ctx.service[filename].index(requestData);
    ctx.body = res;
  }

  async update() {
    const { ctx } = this;
    const { actk: access_token } = ctx.request.headers;
    const { alarmRules } = ctx.request.body;
    const requestData = { access_token, alarmRules };
    const res = await ctx.service[filename].update(requestData);
    ctx.body = res;
  }
};
