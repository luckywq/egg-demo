'use strict';
const Service = require('egg').Service;
const config_table = 'bs_data_config_t';
module.exports = class DataService extends Service {

  async create(datas) {

    for (const data of datas) {
      await this.app.mysql.insert(config_table, data);
    }
    return {
      code: 200,
    };
  }

  async update(device_id) {
    // console.log(device_id);
    const res = await this.app.mysql.query('update bs_data_config_t set standard_value=null where device_id=?', [ device_id ]); //eslint-disable-line
    // console.log(res);
    return {
      code: 200,
      message: 'success:put_dataConfig',
    };
  }
};
