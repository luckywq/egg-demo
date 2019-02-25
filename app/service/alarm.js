'use strict';

const Service = require('egg').Service;
const pubBuildSql = 'SELECT * FROM bs_alarm_record_t WHERE pub_company_code REGEXP';
const pubWorkerSql = 'SELECT * FROM bs_worker_alarm_t WHERE company_code REGEXP';
const moment = require('moment');

module.exports = class AlarmService extends Service {
  // 获取全部告警历史
  async allHistory(query) {
    const pageSize = Number(query.pageSize);
    const pageNumber = Number(query.pageNumber);
    const pageOffset = (pageNumber - 1) * pageSize;
    const { company_code, build_name, start_time, end_time, filter, worker_name } = query;
    let res;
    let total;
    if (filter === 'build') {
      res = await this.app.mysql.query(`${pubBuildSql} '^${company_code}' AND build_name LIKE '%${build_name}%' AND alarm_time BETWEEN ${start_time} AND ${end_time} ORDER BY alarm_time DESC LIMIT ${pageOffset},${pageSize}`);
      total = await this.app.mysql.query(`${pubBuildSql} '^${company_code}' AND build_name LIKE '%${build_name}%' AND alarm_time BETWEEN ${start_time} AND ${end_time}`);
    } else if (filter === 'worker') {
      res = await this.app.mysql.query(`${pubWorkerSql} '^${company_code}' AND worker_name LIKE '%${worker_name}%' AND alarm_time BETWEEN ${start_time} AND ${end_time} ORDER BY alarm_time DESC LIMIT ${pageOffset},${pageSize}`);
      total = await this.app.mysql.query(`${pubWorkerSql} '^${company_code}' AND worker_name LIKE '%${worker_name}%' AND alarm_time BETWEEN ${start_time} AND ${end_time}`);
    }
    return {
      code: 200,
      message: 'success:get_history',
      result: {
        total: total.length,
        rows: res,
      },
    };
  }

  // 告警统计--时间 次数
  async alarmCount(requestData) {
    const { app } = this;
    const { company_code, start_time, end_time } = requestData;
    const oneDay = 3600 * 24 * 1000;
    const totalTime = Number(end_time) - Number(start_time); // 时间段总共多少毫秒
    const totalDays = Math.ceil(totalTime / oneDay); // 总共请求多少天的数据
    const days = [];
    const res = await app.mysql.query(`${pubBuildSql} '^${company_code}' AND alarm_time BETWEEN ${start_time} AND ${end_time}`);
    for (let i = 0; i < totalDays; i++) {
      const obj = {};
      const everyDay = Number(start_time) + i * oneDay;
      const formatDay = moment(everyDay).format('YYYY-MM-DD');
      obj.date = formatDay;
      const dayDatas = [];
      for (const item of res) {
        const { alarm_time } = item;
        const formatAlarmTime = moment(Number(alarm_time)).format('YYYY-MM-DD');
        if (formatDay === formatAlarmTime) {
          dayDatas.push(item);
        }
      }
      obj.count = dayDatas.length;
      days.push(obj);
    }
    return {
      code: 200,
      message: 'success:get_alarm-count',
      result: {
        rows: days,
      },
    };
  }

  // 获取告警占比
  async alarmProportion(requestData) {
    const { app } = this;
    const { company_code, start_time, end_time } = requestData;
    const allDatas = await app.mysql.query(`${pubBuildSql} '^${company_code}' AND alarm_time BETWEEN ${start_time} AND ${end_time}`);
    const newArr = [];
    const tempArr = [];
    const conpany_names = [];
    const result = [];
    for (let i = 0; i < allDatas.length; i++) {
      conpany_names.push(allDatas[i].company_name);
    }
    for (let j = 0; j < conpany_names.length; j++) {
      if (conpany_names[j] === conpany_names[j + 1]) {
        tempArr.push(allDatas[j]);
      } else {
        tempArr.push(allDatas[j]);
        newArr.push(tempArr.slice(0));
        tempArr.length = 0;
      }
    }
    for (const item of newArr) {
      const obj = {};
      obj.alarm_count = item.length;
      const thing_alarm = [];
      obj.thing_alarm = [];
      for (const one of item) {
        obj.company_name = one.company_name;
        thing_alarm.push(one);
      }
      const buildArr = [];
      const buildTempArr = [];
      const build_names = [];
      for (const thing of thing_alarm) {
        build_names.push(thing.build_name);
      }
      for (let k = 0; k < build_names.length; k++) {
        if (build_names[k] === build_names[k + 1]) {
          buildTempArr.push(build_names[k]);
        } else {
          buildTempArr.push(build_names[k]);
          buildArr.push(buildTempArr.slice(0));
          buildTempArr.length = 0;
        }
      }
      for (const builings of buildArr) {
        const buildAlarm = {};
        for (const build of builings) {
          buildAlarm.thing_name = build;
        }
        buildAlarm.alarm_count = builings.length;
        obj.thing_alarm.push(buildAlarm);
      }
      result.push(obj);
    }
    return {
      code: 200,
      message: 'success:get_alarmProportion',
      result: {
        rows: result,
      },
    };
  }

  // 删除告警记录
  async delRecord(obj) {
    const { app } = this;
    await app.mysql.delete('bs_alarm_record_t', obj);
  }

  // 修改告警记录
  async updateRecord(row, options) {
    const { app } = this;
    await app.mysql.update('bs_alarm_record_t', row, options);
  }
};

