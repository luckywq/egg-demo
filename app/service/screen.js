'use strict';

const Service = require('egg').Service;

module.exports = class ScreenService extends Service {
  async listDatas(requestData) {
    const { ctx, app } = this;
    const res = await ctx.service.public.getCompanys(requestData);
    const { rows } = res.result;
    const companies = [];
    for (const row of rows) {
      const datas = await app.mysql.query('SELECT a.id as build_id,a.name as bulid_name,b.name as device_name,b.device_id from bs_buildings_t a LEFT JOIN bs_devices_t b on a.id=b.build_id WHERE a.available=1 AND a.pub_company_id=?', [ row._id ]);
      for (const data of datas) {
        data.company_name = row.company_name;
        data.company_id = row._id;
      }

      companies.push(datas);
    }
    const result = [].concat.apply([], companies);
    for (const item of result) {
      const { build_id, device_id } = item;
      const data_config = await app.mysql.query('SELECT a.data_name,a.data_id,a.data_unit,b.data_value,b.data_status,b.data_time FROM bs_data_config_t a LEFT JOIN bs_current_data_t b on a.data_id=b.data_id WHERE a.device_id=? and a.build_id=?', [ device_id, build_id ]);
      item.data_config = data_config;
    }
    return {
      code: 200,
      message: 'success:get_all',
      result: {
        rows: result,
      },
    };
  }
};
