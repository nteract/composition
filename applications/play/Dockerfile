FROM node:8@sha256:da5ce3229e1e2b7776be77bbdf679d2c8c2df66396e8cfd16e1007ddb2a9e855
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
