FROM node:8.9.1@sha256:552348163f074034ae75643c01e0ba301af936a898d778bb4fc16062917d0430
ADD . /nteract
WORKDIR /nteract
RUN npm i
# RUN npm run dist:linux64
