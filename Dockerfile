FROM node:16-alpine
COPY sanitize.ts api.ts util.ts package.json yarn.lock ./
RUN yarn install
CMD yarn run daemon
