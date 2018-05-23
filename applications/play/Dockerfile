FROM node:8@sha256:26e4c77f9f797c3993780943239fa79419f011dd93ae4e0097089e2145aeaa24
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
