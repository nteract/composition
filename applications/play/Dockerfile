FROM node:8@sha256:8654f499db990f00f9b670c7d284b210a3c7bc92225947d39532c01e67f53866
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
