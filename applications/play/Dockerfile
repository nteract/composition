FROM node:8@sha256:5c52c5f4deac879e4be47ae07e4271c16a449280337d8830064464b286d011a8
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
