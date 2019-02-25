'use strict';
const Service = require('egg').Service;
const device_table = 'bs_devices_t';
module.exports = class deviceService extends Service {
  // 获取某实体下的所有设备及其信息  请求参数：build_id
  async index(build) {
    const devices = await this.app.mysql.select(device_table, {
      where: { build_id: build },
      columns: [ 'id', 'name', 'pos_floor', 'pos_direction', 'device_id', 'data_status' ],
    });

    for (const device of devices) {
      const { pos_floor, pos_direction, device_id } = device;

      device.position = `${pos_floor}-${pos_direction}`;
      const devicesDatas = await this.app.mysql.query('SELECT a.data_name,a.data_id,a.data_unit,b.data_value,b.data_status,b.data_time FROM bs_data_config_t a LEFT JOIN bs_current_data_t b on a.data_id=b.data_id WHERE a.device_id=? and a.build_id=?', [ device_id, build ]);

      device.data_config = devicesDatas;
    }

    return {
      code: 200,
      message: 'success:get_devices_datas',
      result: {
        rows: devices,
      },
    };
  }

  // 获取某设备某端口某是时间段内数据
  async history(query) {
    const { start_time, end_time, data_id } = query;
    const res = await this.app.mysql.query(`SELECT data_value,data_time FROM bs_realtime_datas_t WHERE data_time BETWEEN ${start_time} AND ${end_time} AND data_id=${data_id}`);
    return {
      code: 200,
      message: 'success:get_historyData',
      result: {
        rows: res,
      },
    };
  }


  // 创建设备  --实体绑定设备--楼宇
  async create(requestData) {
    const { app, ctx } = this;
    const { build_id, devices, access_token } = requestData;
    await this.delete(build_id);
    const success = [];
    for (const device of devices) {
      const { device_id, name } = device;
      const row = {
        build_id,
        name,
        device_id,
        data_status: 1,
        // device_kind: pub_device_kind,
      };
      const res = await app.mysql.insert(device_table, row);
      if (res.affectedRows === 1) {
        // 获取设备端口
        const allDatas = await ctx.service.public.dataConfig({
          access_token,
          value_flag: false,
          opts: { where: { device_id } },
        });
        const dataConfigs = [];
        for (const data of allDatas.result.rows) {
          const config = {
            device_id,
            data_name: data.data_name,
            data_unit: data.data_unit,
            port_type: data.port_type,
            data_id: data.data_id,
            data_status: data.status,
            port_name: data.port_name,
            build_id,
          };

          if (config.data_status === 1) {
            dataConfigs.push(config);
          }
        }
        // 将设备端口保存到本地数据库
        await ctx.service.dataConfig.create(dataConfigs);
        success.push(1);
      }
    }
    if (success.length === devices.length) {
      return {
        code: 200,
        message: 'success:post_devices',
      };
    }
  }

  // 删除设备
  async delete(id) {
    const { app } = this;
    const build_devices = await app.mysql.select('bs_devices_t', {
      where: { build_id: id },
    });
    for (const build_device of build_devices) {
      // console.log(build_device.device_id);
      await app.mysql.delete('bs_data_config_t', {
        device_id: build_device.device_id,
        build_id: id,
      });
    }
    const res = await app.mysql.delete(device_table, {
      build_id: id,
    });

    if (res.affectedRows === 1) {
      return true;
    }
    return false;
  }

  // 更新设备信息（地理位置信息）
  async update(requestData) {
    console.log(requestData);
  }
};
