FROM node:8@sha256:deb6287c3b94e153933ed9422db4524d2ee41be00b32c88a7cd2d91d17bf8a5e
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
