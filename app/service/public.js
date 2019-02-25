'use strict';

const Service = require('egg').Service;
const timeout = 30000;
module.exports = class CurrentService extends Service {
  // 登录
  async login(body) {
    const { ctx, app } = this;
    Object.assign(body, app.config.client);

    const api = app.serializeQuary(`${app.config.serverList.authorizeServer}/authorize/authorize`, body);
    const { data } = await ctx.curl(api, {
      method: 'GET',
      dataType: 'json',
      timeout,
    });

    const { fullname, company_id, access_token, user_id, company_code, customer_id, status, mobile } = data;
    return app.standardRes(
      data.code,
      data.code === 200 ? 'success:post_login' : data.error,
      { fullname, company_id, actk: access_token, user_id, company_code, customer_id, user_status: status, mobile }
    );
  }
  // 获取权限菜单
  async getMenus(body) {
    const { ctx, app } = this;
    const api = app.serializeQuary(`${app.config.serverList.authorizeServer}/v1/menus`, body);
    const { data } = await ctx.curl(api, {
      method: 'GET',
      dataType: 'json',
      timeout,
    });

    const dispose = data.sort((a, b) => {
      return a.index - b.index;
    });

    return app.standardRes(
      200,
      'success:get_menus',
      dispose
    );
  }

  // 获取公司列表
  async getCompanys(requestData) {
    const { ctx, app } = this;
    const { company_code, access_token, customer_id, type } = requestData;
    let allData;
    if (customer_id === undefined) {
      allData = {
        access_token,
        regex: '{"company_code":"^' + company_code + '[0-9]{6}$"}',
      };
    } else if (company_code === undefined) {
      allData = {
        access_token,
        filter: '{"customer_id":"' + customer_id + '"}',
      };
    }
    const companiesApi = `${app.config.serverList.companiesServer}/v1/companies`;
    const data = await ctx.curl(companiesApi, {
      method: 'GET',
      dataType: 'json',
      contentType: 'json',
      data: allData,
      timeout,
    });
    const { rows } = data.data;
    for (const row of rows) {
      const { _id } = row;
      const res = await this.app.mysql.select('bs_buildings_t', {
        where: { pub_company_id: _id, available: true },
      });
      row.build_number = res.length;
      if (type === 'config') {
        const regArguments = {
          type: 'config',
          company_id: row._id,
        };
        const allBuildData = await ctx.service.build.index(regArguments);
        const buildings = allBuildData.result.rows;
        const shakes = [],
          tems = [],
          wets = [],
          windSpeeds = [];
        const data_config = [];
        for (const building of buildings) {

          for (const DATA_CONFIG_BUILD of building.data_config) {
            if (DATA_CONFIG_BUILD.data_name && DATA_CONFIG_BUILD.data_name.includes('振动')) {
              shakes.push(DATA_CONFIG_BUILD);
            }
            if (DATA_CONFIG_BUILD.data_name && DATA_CONFIG_BUILD.data_name.includes('温度')) {
              tems.push(DATA_CONFIG_BUILD);
            }
            if (DATA_CONFIG_BUILD.data_name && DATA_CONFIG_BUILD.data_name.includes('风速')) {
              windSpeeds.push(DATA_CONFIG_BUILD);
            }
            if (DATA_CONFIG_BUILD.data_name && DATA_CONFIG_BUILD.data_name.includes('湿度')) {
              wets.push(DATA_CONFIG_BUILD);
            }
          }
        }
        const maxShake = ctx.service.build.getMax('data_value', shakes);
        const maxWind = ctx.service.build.getMax('data_value', windSpeeds);
        const maxTem = ctx.service.build.getMax('data_value', tems);
        const maxWet = ctx.service.build.getMax('data_value', wets);
        maxShake && data_config.push(maxShake);
        maxWind && data_config.push(maxWind);
        maxTem && data_config.push(maxTem);
        maxWet && data_config.push(maxWet);
        row.data_config = data_config;
      }

    }
    return {
      code: data.status,
      message: data.status === 200 ? 'success:get_Companys' : data.error,
      result: {
        rows,
      },
    };
  }

  // 获取单个公司信息
  async getCompanyInfo(requestData) {
    const { ctx, app } = this;
    const { access_token, company_id } = requestData;
    const companiesApi = `${app.config.serverList.companiesServer}/v1/companies`;
    const single = {
      access_token,
      company_id,
    };
    const data = await ctx.curl(companiesApi, {
      method: 'GET',
      dataType: 'json',
      contentType: 'json',
      data: single,
      timeout,
    });
    const builds = await app.mysql.select('bs_buildings_t', {
      where: {
        pub_company_id: data._id,
        available: true,
      },
    });
    data.build_count = builds.length;
    return {
      code: 200,
      message: 'success:get_company_info',
      result: data,
    };
  }

  // 添加公司
  async addCompany(actk, body) {
    const { app, ctx } = this;
    const companiesApi = `${app.config.serverList.companiesServer}/v1/companies`;
    const { customer_id, parent_code, company_name, address, mobile, alarmRules } = body;
    const res = await ctx.curl(companiesApi, {
      method: 'POST',
      dataType: 'json',
      data: {
        access_token: actk,
        data: `{"customer_id": "${customer_id}","parent_code":"${parent_code}","company_name":"${company_name}","address":"${address}","mobile":"${mobile}"}`,
      },
      timeout,
    });
    const { data } = res;
    let rule;
    let things;

    if (data.code === 200) {
      body.company_id = data._id;
      // 后台管理系统添加公司成功后，需要向本地数据库中批量添加楼盘告警规则，楼盘楼宇
      rule = await ctx.service.rules.add(data._id, alarmRules);
      things = await ctx.service.build.addBuilds(body);
    }
    if (rule && things) {
      return {
        code: data.code,
        message: data.success,
        result: {
          company_id: body.company_id,
        },
      };
    }
  }

  // 修改公司
  async updateCompany(requestData) {
    const { ctx, app } = this;
    const { company_id, customer_id, company_name, company_code, address, access_token } = requestData;
    const companiesApi = `${app.config.serverList.companiesServer}/v1/companies/${company_id}`;

    const res = await ctx.curl(companiesApi, {
      method: 'PUT',
      dataType: 'json',
      data: {
        access_token,
        data: `{"customer_id": "${customer_id}","company_code":"${company_code}","company_name":"${company_name}","address":"${address}"}`,
      },
      timeout,
    });
    // 如果公司名字被修改，则需要更新对应得告警历史中的公司名

    if (res.data.code && company_name) {
      const updateRow = { company_name };
      const options = { where: {
        company_id,
      } };
      await ctx.service.alarm.updateRecord(updateRow, options);
    }
    if (res.data.code) {
      return {
        code: 200,
        message: 'success:put_company',
      };
    }
  }

  // 删除公司
  async delCompany(requestData) {
    const { ctx, app } = this;
    const { company_id, access_token } = requestData;
    const serverAPI = `${app.config.serverList.companiesServer}/v1/companies/${company_id}?access_token=${access_token}`;
    const { data } = await ctx.curl(serverAPI, {
      method: 'DELETE',
      dataType: 'json',
      timeout,
    });
    await ctx.service.rules.del(company_id);
    await ctx.service.build.changeBuildVisbale(company_id);
    await ctx.service.alarm.delRecord({
      company_id,
    });
    return {
      code: data.code,
      message: data.success,
    };
  }

  // 后台管理系统设备
  async devices(requestData) {
    const { app, ctx } = this;
    const { opts = {} } = requestData;
    const { where = {} } = opts;
    if (where && app.superType(where.device_kind) === 'array') {
      requestData.device_kind = where.device_kind.toString();
      delete where.device_kind;
    }
    const serverAPI = app.serializeQuary(`${app.config.serverList.companiesServer}/v1/devices`, app.filterFormater(requestData));
    let { data: { rows } } = await ctx.curl(serverAPI, {
      method: 'GET',
      dataType: 'json',
      timeout,
    });
    rows = rows.map(item => {
      return {
        device_id: item._id,
        name: item.device_name,
        device_kind: item.device_kind,
        customer_id: item.customer_id,
        status: item.status,
      };
    });
    rows = app.columnsFormater(rows, requestData.columns);
    return app.standardRes(
      200,
      'success:get_device',
      rows
    );
  }

  // 端口
  async dataConfig(requestData) {
    const { app, ctx } = this;
    const { opts = {} } = requestData;
    const serverAPI = app.serializeQuary(`${app.config.serverList.companiesServer}/v1/dataConfigs`, app.filterFormater(requestData));
    let { data: { rows } } = await ctx.curl(serverAPI, {
      method: 'GET',
      dataType: 'json',
      timeout,
    });

    rows = rows.map(item => {
      return {
        data_id: item.data_id,
        data_name: item.data_name,
        data_unit: item.data_unit,
        high_battery: item.high_battery,
        low_battery: item.low_battery,
        data_precision: item.data_precision,
        port_type: item.port_type,
        status: item.status,
        port_name: item.port_name,
      };
    });
    rows = app.columnsFormater(rows, opts.columns);
    return app.standardRes(
      200,
      'success:get_device',
      rows
    );
  }

  // 修改密码
  async password(body) {
    const { app, ctx } = this;
    const serverAPI = app.serializeQuary(`${app.config.serverList.companiesServer}/v1/users`, body);
    const { data } = await ctx.curl(serverAPI, {
      method: 'PUT',
      dataType: 'json',
      timeout,
    });
    return app.standardRes(
      data.code,
      data.error ? data.error : 'success:changed_password'
    );
  }

  // 获取角色
  async getRoles(requestData) {
    const { app, ctx } = this;
    const { access_token, customer_id } = requestData;
    const api = `${app.config.serverList.companiesServer}/v1/roles`;
    const { data } = await ctx.curl(api, {
      method: 'GET',
      dataType: 'json',
      timeout,
      data: {
        access_token,
        filter: '{"customer_id":"' + customer_id + '"}',
      },
    });
    return {
      code: 200,
      message: 'success:get_roles',
      result: {
        rows: data.rows,
      },
    };
  }

  // 获取账户列表
  async getUsers(requestData) {
    const { access_token, customer_id } = requestData;
    const { app, ctx } = this;
    const api = `${app.config.serverList.companiesServer}/v1/users`;
    const res = await ctx.curl(api, {
      dataType: 'json',
      data: {
        access_token,
        filter: '{"customer_id":"' + customer_id + '"}',
      },
      timeout,
    });
    return {
      code: 200,
      message: 'success:get_users',
      result: {
        rows: res.data.rows,
      },
    };
  }

  // 新增账号
  async addUser(requestData) {
    const { access_token, roles, company_id, fullname, username, system, password, mobile, status, customer_id } = requestData;
    const { app, ctx } = this;
    const api = `${app.config.serverList.companiesServer}/v1/users`;
    const userdata = "{'company_id':'" + company_id + "','system':" + JSON.stringify(system) + ",'fullname':'" + fullname + "','username':'" + username + "','password':'" + password + "','mobile':'" + mobile + "','status':" + status + ",'customer_id':'" + customer_id + "'}";
    const res = await ctx.curl(api, {
      method: 'POST',
      dataType: 'json',
      data: {
        roles,
        data: userdata,
        access_token,
        filter: '{"customer_id":"' + customer_id + '"}',
      },
      timeout,
    });
    return {
      code: res.data.code,
      message: res.data.success,
      result: {
        user_id: res.data._id,
      },
    };
  }

  // 删除账户
  async delUser(requestData) {
    const { app, ctx } = this;
    const { customer_id, user_id, access_token } = requestData;
    const api = `${app.config.serverList.companiesServer}/v1/users/${user_id}?access_token=${access_token}`;
    const { data } = await ctx.curl(api, {
      dataType: 'json',
      method: 'DELETE',
      data: {
        filter: '{"customer_id":"' + customer_id + '"}',
      },
      timeout,
    });
    return {
      code: data.code,
      message: data.success,
    };
  }

  // 修改账号
  async updateUser(requestData) {
    const { ctx, app } = this;
    const { user_id, access_token, company_id, system, fullname, password, username, mobile, status, customer_id, roles } = requestData;
    const api = `${app.config.serverList.companiesServer}/v1/users/${user_id}`;
    const modifydata = "{'company_id':'" + company_id + "','system':" + JSON.stringify(system) + ",'fullname':'" + fullname + "','username':'" + username + "','password':'" + password + "','mobile':'" + mobile + "','status':" + status + '}';
    const filter = '{"customer_id":"' + customer_id + '"}';
    const res = await ctx.curl(api, {
      method: 'PUT',
      timeout,
      dataType: 'json',
      data: {
        roles,
        data: modifydata,
        access_token,
        filter,
      },
    });

    return {
      code: res.data.code,
      message: res.data.success,
    };
  }
};

