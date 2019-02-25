'use strict';
const Service = require('egg').Service;
const workerTable = 'bs_workers_t';
module.exports = class WorkerService extends Service {
  // 获取楼盘下所有worker
  async index(company_id, device_id, type) {
    const { app } = this;
    const where = device_id ? { company_id, device_id } : { company_id };
    const workers = await app.mysql.select(workerTable, {
      where,
      columns: [ 'id', 'name', 'company_id', 'job', 'device_id' ],
    });
    if (type === 'config') {
      for (const worker of workers) {
        const { id } = worker;
        const res = await app.mysql.query('SELECT a.data_id,a.data_name,a.data_unit,b.data_value,b.data_time,b.data_status FROM bs_data_config_t a LEFT JOIN bs_current_data_t b on a.data_id=b.data_id WHERE a.worker_id=?', [ id ]);
        worker.data_config = res;
      }
    }
    return {
      code: 200,
      message: 'success:get_workers',
      result: {
        rows: workers,
        total: workers.length,
      },
    };
  }

  // 获取单个worker
  async worker(worker_id) {
    const { app } = this;
    const dataConfig = await app.mysql.query('SELECT a.data_id,a.data_name,a.data_unit,b.data_value,b.data_time,b.data_status FROM bs_data_config_t a LEFT JOIN bs_current_data_t b on a.data_id=b.data_id WHERE a.worker_id=?', [ worker_id ]);
    return {
      code: 200,
      message: 'success:get_worker',
      result: dataConfig,
    };
  }

  async create(workers) {
    const { app, ctx } = this;
    const newWorkers = [];
    for (const worker of workers) {
      const newWorker = {};
      const { name, company_id, job, device_id, data_config } = worker;
      newWorker.name = name;
      let workerData = { name, company_id, job, device_id };
      workerData = app.addDefaultTime(workerData);
      const res = await app.mysql.insert(workerTable, workerData);
      if (res.affectedRows === 1) {
        newWorker.id = res.insertId;
        newWorkers.push(newWorker);
        const workerConfigs = [];
        for (const dataConfig of data_config) {
          const { data_id, data_name, data_unit, port_type, port_name } = dataConfig;
          const workerConfig = { data_id, data_name, data_unit, port_type, port_name };
          workerConfig.worker_id = res.insertId;
          // data_config.worker_id = res.insertId;
          workerConfigs.push(workerConfig);
        }
        await ctx.service.dataConfig.create(workerConfigs);
      }
    }
    return {
      code: 200,
      message: 'success:post_workers',
      result: newWorkers,
    };
  }

  async delWorkers() {
    return {

    };
  }

  async update(query, workers) {
    const { app, ctx } = this;
    // 获取该公司的所有wokerId
    let sql = 'select * from ' + workerTable + ' where company_id = ?';
    const workerList = await app.mysql.query(sql, [ query.companyId ]);
    const workerIdList = [];
    for (const worker of workerList) {
      workerIdList.push(worker.id);
      await ctx.service.alarm.delRecord({
        worker_id: worker.id,
      });
    }
    sql = 'delete from bs_data_config_t where worker_id in (?)';
    await app.mysql.query(sql, [ workerIdList ]);

    sql = 'delete from ' + workerTable + ' where company_id = ?';
    await app.mysql.query(sql, [ query.companyId ]);
    // 新增worker
    for (const worker of workers) {
      const newWorker = {};
      const { name, company_id, job, device_id, data_config } = worker;
      newWorker.name = name;
      let workerData = { name, company_id, job, device_id };
      workerData = app.addDefaultTime(workerData);
      const res = await app.mysql.insert(workerTable, workerData);
      if (res.affectedRows === 1) {
        const workerConfigs = [];
        for (const dataConfig of data_config) {
          const { data_id, data_name, data_unit, port_type, port_name } = dataConfig;
          const workerConfig = { data_id, data_name, data_unit, port_type, port_name };
          workerConfig.worker_id = res.insertId;
          // data_config.worker_id = res.insertId;
          workerConfigs.push(workerConfig);
        }
        await ctx.service.dataConfig.create(workerConfigs);
      }
    }
    console.log('保存workers和data_config');

    return {
      code: 200,
      message: 'success:put_workers',
    };
  }
};
