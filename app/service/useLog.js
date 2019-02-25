'use strict';
const Service = require('egg').Service;
const log_table = 'bs_use_log_t';
module.exports = class UseLogService extends Service {
  async create(requsetData) {
    const row = requsetData;
    const { app } = this;
    const res = await app.mysql.insert(log_table, row);
    if (res.affectedRows === 1) {
      return {
        code: 200,
        message: 'success:post_logs',
      };
    }
  }
};
