FROM node:8@sha256:a4c4106ddda19c2c228cbdfbc0f0d7a5f27c383b0486f88fc2c2c40153763cf5
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
