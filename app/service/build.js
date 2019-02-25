'use strict';

const Service = require('egg').Service;
const build_table = 'bs_buildings_t';
module.exports = class BuildService extends Service {
  // 接口 返回某公司下实体列表 请求参数：company_id 显示数据：该实体所有设备端口当前数据的最大的一条
  async index(requstData) {
    const { type, company_id } = requstData;
    const datas = await this.app.mysql.select(build_table, {
      where: { pub_company_id: company_id, available: true },
      columns: [ 'id', 'name', 'total_floors', 'built_floors', 'spec_floor_count', 'spec_floor_height', 'norm_floor_count', 'norm_floor_height', 'data_status', 'location_a', 'location_b', 'location_c', 'location_d', 'created_at', 'updated_at' ],
    });
    for (const data of datas) {
      const shakes = [],
        tems = [],
        wets = [],
        windSpeeds = [];

      const devices = await this.app.mysql.query('SELECT a.name,b.data_name,c.data_value,c.data_id,c.data_status,c.data_time,b.data_unit FROM bs_devices_t a LEFT JOIN bs_data_config_t b on a.device_id=b.device_id and a.build_id=b.build_id LEFT JOIN bs_current_data_t c on b.data_id=c.data_id WHERE a.build_id=?', [ data.id ]);
      const build_devices = await this.app.mysql.select('bs_devices_t', {
        where: { build_id: data.id },
      });
      data.device_count = build_devices.length;
      if (type === 'config') {
        const data_config = [];
        for (const device of devices) {
          if (device.data_name && device.data_name.includes('振动')) {
            shakes.push(device);
          }
          if (device.data_name && device.data_name.includes('温度')) {
            tems.push(device);
          }
          if (device.data_name && device.data_name.includes('风速')) {
            windSpeeds.push(device);
          }
          if (device.data_name && device.data_name.includes('湿度')) {
            wets.push(device);
          }

        }
        // console.log(shakes);
        data.shakes = shakes;
        data.tems = tems;
        data.wets = wets;
        data.windSpeeds = windSpeeds;
        const maxShake = this.getMax('data_value', shakes);
        const maxWind = this.getMax('data_value', windSpeeds);
        const maxTem = this.getMax('data_value', tems);
        const maxWet = this.getMax('data_value', wets);
        maxShake && data_config.push(maxShake);
        maxWind && data_config.push(maxWind);
        maxTem && data_config.push(maxTem);
        maxWet && data_config.push(maxWet);
        if (data_config.length > 0) {
          data_config.sort((a, b) => {
            return a.data_time - b.data_time;
          });
        }
        data.data_config = data_config;
      }
    }

    return {
      code: 200,
      message: 'success:get_building',
      result: {
        rows: datas,
      },
    };
  }


  // 新增单个实体
  async add(requstData) {
    const { app } = this;
    const { company_id } = requstData;
    let build = requstData.build;
    build.pub_company_id = company_id;
    build.available = 1;
    build = app.addDefaultTime(build);
    const res = await app.mysql.insert(build_table, build);
    // console.log(res);
    return {
      code: res.affectedRows === 1 ? 200 : 400,
      message: 'success:post_build',
      result: {
        id: res.insertId,
      },
    };
  }

  // 批量增加实体  --按规则生成
  async addBuilds(requstData) {
    const { app } = this;
    const { build_count, company_id } = requstData;
    const successInsert = [];
    for (let i = 0; i < build_count; i++) {
      let build = {};
      build.name = i + 1 + '号楼';
      // build.company_code = company_code;
      build.pub_company_id = company_id;
      // build.company_name = company_name;
      build.total_floors = 17;
      build.spec_floor_count = 2;
      build.spec_floor_height = 5;
      build.norm_floor_count = 15;
      build.norm_floor_height = 3.5;
      build.available = 1;
      build.built_floors = 10;
      build = app.addDefaultTime(build);
      const res = await app.mysql.insert(build_table, build);
      if (res.affectedRows === 1) {
        successInsert.push(1);
      }
    }
    if (successInsert.length === build_count) {
      return true;
    }
    return false;
  }

  // 删除实体
  async delete(build_id) {
    const { ctx, app } = this;
    const rows = {
      available: false,
    };
    const options = {
      where: {
        id: build_id,
      },
    };
    const res = await app.mysql.update(build_table, rows, options);
    const row = {
      build_id,
    };
    await ctx.service.alarm.delRecord(row);
    if (res.affectedRows === 1) {
      return {
        code: 200,
        message: 'success:delete_build',
      };
    }
    return {
      message: '删除失败',
    };
  }


  // 批量改变实体是否可用
  async changeBuildVisbale(company_id) {
    const { app } = this;
    const rows = {
      available: false,
    };
    const options = {
      where: {
        pub_company_id: company_id,
      },
    };
    const res = await app.mysql.update(build_table, rows, options);
    return res.affectedRows === 1;
  }

  // 批量修改实体信息
  async update(buildings) {
    const { app, ctx } = this;

    const success = [];
    for (const building of buildings) {
      building.updated_at = Date.now().toString();
      const res = await app.mysql.update(build_table, building);
      // 如果修改了实体名称，则要去更新告警记录表里的实体名称
      if (building.name !== undefined) {
        const recordRow = { build_name: building.name };
        // const recordOpt = { build_id: building.id };
        const recordOpt = {
          where: {
            build_id: building.id,
          },
        };
        await ctx.service.alarm.updateRecord(recordRow, recordOpt);
      }
      if (res.affectedRows === 1) {
        success.push(1);
      }
    }
    if (success.length !== buildings.length) {
      return {
        message: '更新失败',
      };
    }
    return {
      code: 200,
      message: 'success:put_buildings',
    };
  }

  // jsonarray，返回字段值最大的对应元素
  getMax(key, jsonArray) {
    if (jsonArray.length === 1) {
      return jsonArray[0];
    }
    let max = -Math.pow(2, 32);
    for (const json of jsonArray) {
      const value = json[key];
      if (value > max) {
        max = value;
      }
    }
    const res = jsonArray.find(item => item[key] === max);
    return res;
  }

};
