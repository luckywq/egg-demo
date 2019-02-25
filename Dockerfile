FROM finfosoft/nodejs8-alpine-httpserver
# 设置私服
RUN npm config set registry http://10.30.147.48:8081/repository/finfosoft-npm-group/
#维护者信息
MAINTAINER niuzhifa "1944044667@qq.com"

ADD ff-bs-api-test.tar /home/app/webapps/

WORKDIR /home/app/webapps/ff-bs-api-test

RUN npm install --production

RUN npm i egg-scripts --save

EXPOSE 7001

CMD ["npm","start"]