FROM node:8@sha256:5afc7736a71bcf24281d9dbff878c771106e0791d56949b1a4e8d27c50424283
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
