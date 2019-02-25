'use strict';

module.exports = options => {
  return async function authority(ctx, next) {

    const { actk } = ctx.headers;

    // 缺少令牌或令牌不合法
    if (!actk) {
      ctx.body = { message: '缺少令牌或令牌不合法' };
      return;
    }

    // 鉴权
    const { server } = options;
    const url = `${server}?access_token=${actk}`;
    const { data } = await ctx.curl(url, {
      dataType: 'json',
    });

    if (data.code === 200) { // 鉴权通过
      const { user_object_id: uid, company_code: ccode } = data.result;
      ctx.set('actk', actk);
      uid && ctx.set('uid', uid);
      ccode && ctx.set('ccode', ccode);
      await next();
    } else { // 鉴权不通过
      ctx.body = data;
    }

  };
};
