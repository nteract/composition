FROM node:8@sha256:2cd58f1e0ed6bcaa6db33e78a6aad275d323bd2d5a9cb74f9ad32deeb968a76a
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
