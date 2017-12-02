FROM node:8.9.1
ADD . /nteract
WORKDIR /nteract
RUN npm i
# RUN npm run dist:linux64
