'use strict';

const Controller = require('egg').Controller;
const fileName = 'version';
module.exports = class VersionController extends Controller {
  async index() {
    const { ctx } = this;
    const res = await ctx.service[fileName].index();
    ctx.body = res;
  }
};
