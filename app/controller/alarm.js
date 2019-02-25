'use strict';

const Controller = require('egg').Controller;
const filename = 'alarm';
class AlarmController extends Controller {
  // 获取历史告警信息
  async allHistory() {
    const { ctx } = this;
    const query = ctx.query;
    const res = await ctx.service[filename].allHistory(query);
    ctx.body = res;
  }

  // 获取告警统计信息 --次数
  async alarmCount() {
    const { ctx } = this;
    const { company_code, start_time, end_time } = ctx.request.query;
    const requestData = { company_code, start_time, end_time };
    const res = await ctx.service[filename].alarmCount(requestData);
    ctx.body = res;
  }

  // 获取告警统计信息 --占比
  async alarmProportion() {
    const { ctx } = this;
    const { company_code, start_time, end_time } = ctx.request.query;
    const requestData = { company_code, start_time, end_time };
    const res = await ctx.service[filename].alarmProportion(requestData);
    ctx.body = res;
  }
}

module.exports = AlarmController;
