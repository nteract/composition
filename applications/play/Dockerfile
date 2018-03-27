FROM node:8@sha256:d1a97c68e06df6ab34974996fe5479d417316c97d6b333704453fac3549cc08f
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
