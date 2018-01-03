FROM node:8@sha256:cd7d53e0bd8983ebee507b1e050c0dc6738bf20ea1eb7e39b9b5a4febd7f3e8c
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
