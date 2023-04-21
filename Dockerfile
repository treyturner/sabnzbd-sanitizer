FROM node:16-alpine

LABEL org.opencontainers.image.source=https://github.com/treyturner/sabnzbd-sanitizer
LABEL org.opencontainers.image.description="sabnzbd-sanitizer"
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.authors="treyturner@users.noreply.github.com"

COPY sanitize.ts api.ts util.ts package.json yarn.lock ./
RUN yarn install
CMD yarn run daemon
