'use strict';
const Controller = require('egg').Controller;
const filename = 'workers';

module.exports = class WorkersController extends Controller {
  // 获取楼盘下所有worker列表
  async index() {
    const { ctx } = this;
    const { company_id, device_id, type } = ctx.query;
    const res = await ctx.service[filename].index(company_id, device_id, type);
    ctx.body = res;
  }

  // 获取单个worker信息
  async worker() {
    const { ctx } = this;
    const { worker_id } = ctx.params;
    const res = await ctx.service[filename].worker(worker_id);
    ctx.body = res;
  }

  // 楼盘绑定工作人员
  async create() {
    const { ctx } = this;
    const { workers } = ctx.request.body;
    // console.log(workers);
    // const requestData = { name, company_id, job, data_configs };
    const res = await ctx.service[filename].create(workers);
    ctx.body = res;
  }

  // 修改楼盘工作人员
  async update() {
    const { ctx } = this;
    const query = ctx.request.query;
    const { workers } = ctx.request.body;
    const res = await ctx.service[filename].update(query, workers);
    ctx.body = res;
  }

};
