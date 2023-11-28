FROM satantime/puppeteer-node:20-slim
ENV NODE_ENV=production

# Metadata as defined in the OCI image spec annotations
LABEL org.opencontainers.image.authors="Marco Franke <mfranke87@icloud.com>" \
      org.opencontainers.image.description="Adds text to images" \
      org.opencontainers.image.source="https://github.com/Disane87/text2image-nodejs" \
      org.opencontainers.image.title="Text2Image" \
      org.opencontainers.image.version="1.0"

WORKDIR /text2image/

# RUN apk add --update --no-cache \
#     make \
#     g++ \
#     jpeg-dev \
#     cairo-dev \
#     giflib-dev \
#     pango-dev \
#     libtool \
#     autoconf \
#     automake

COPY package*.json ./

RUN npm install
RUN npm install -g puppeteer

COPY dist/ ./dist/

EXPOSE 3000

CMD ["npm", "start"]