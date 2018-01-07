FROM node:8@sha256:6054aa20c5b7d198524d9bd56c7b2d4fde046b6825e8261ccbf441444a5f4d39
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
