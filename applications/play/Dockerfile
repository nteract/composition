FROM node:8@sha256:7c8290a50527205b67f1ef743285d827eba2b3a726f4dedbd166175c7a39ed05
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
