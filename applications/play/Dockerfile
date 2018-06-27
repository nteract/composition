FROM node:8@sha256:625d0b446f63b2d051c7b2a468f6cee63536dec716f09afcf9ae1c575d9b953a
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
