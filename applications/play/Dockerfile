FROM node:8@sha256:aa231490fa207f5d255007d3187a3b4e2671eb596837d84b5138505c0095267a
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
