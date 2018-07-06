FROM node:8@sha256:38953a117b8f794426429314126af19ff17bbfaa5449c1829b9a8412b8ef4536
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
