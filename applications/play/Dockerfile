FROM node:8@sha256:7b65413af120ec5328077775022c78101f103258a1876ec2f83890bce416e896
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
