'use strict';

const Service = require('egg').Service;
const rule_table = 'bs_alarm_rule_t';
module.exports = class RuleService extends Service {
  async index(body) {
    const { app } = this;
    const { company_id } = body;
    const res = await app.mysql.select(rule_table, {
      where: { company_id },
    });

    return {
      code: 200,
      message: 'success:get_company_rules',
      result: {
        rows: res,
      },
    };
  }

  // 修改告警规则信息
  async update(requestData) {
    const { alarmRules: rules } = requestData;
    const { app } = this;
    const success = [];
    for (const rule of rules) {
      const { id, rule_name, first_compare, first_value, sec_compare, sec_value } = rule;
      const row = {
        rule_name,
        // company_id,
        first_compare,
        first_value,
        sec_compare,
        sec_value,
      };
      const options = {
        where: {
          id,
        },
      };
      const res = await app.mysql.update(rule_table, row, options);
      if (res.affectedRows === 1) {
        success.push(1);
      }
    }
    if (rules.length === success.length) {
      return {
        code: 200,
        message: 'success:put_rules',
      };
    }
    // return false;
  }

  // 新增告警规则，添加公司后调用
  async add(company_id, alarmRules) {

    const res = [];
    for (const alarmRule of alarmRules) {
      const { rule_name, first_compare, first_value, sec_compare, sec_value } = alarmRule;
      const result = await this.app.mysql.query(`insert into ${rule_table} (company_id, rule_name,first_compare,first_value,sec_compare,sec_value) values ("${company_id}", "${rule_name}", "${first_compare}", "${first_value}", "${sec_compare}", "${sec_value}")`);
      if (result.affectedRows === 1) {
        res.push(1);
      }
    }
    if (res.length === alarmRules.length) {
      return true;
    }
    return false;
  }

  async del(company_id) {
    const res = await this.app.mysql.delete(rule_table, { // eslint-disable-line
      company_id,
    });
  }

};
