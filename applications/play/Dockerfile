FROM node:8@sha256:04986974434fc565529feaac1d62cce4f9fe99ba4906f076ce498000120a45d4
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
