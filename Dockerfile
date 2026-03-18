FROM node:24-alpine

LABEL org.opencontainers.image.source=https://github.com/treyturner/sabnzbd-sanitizer
LABEL org.opencontainers.image.description="sabnzbd-sanitizer"
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.authors="treyturner@users.noreply.github.com"

COPY sanitize.ts api.ts util.ts package.json yarn.lock /app/
WORKDIR /app
RUN npm install -g corepack \
    && corepack prepare yarn@stable --activate \
    && yarn install --immutable
CMD ["yarn", "run", "daemon"]
