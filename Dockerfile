FROM satantime/puppeteer-node:20-slim
ENV NODE_ENV=production
ENV NODE_NO_WARNINGS=1

# Metadata as defined in the OCI image spec annotations
LABEL org.opencontainers.image.authors="Marco Franke <mfranke87@icloud.com>" \
      org.opencontainers.image.description="Adds text to images" \
      org.opencontainers.image.source="https://github.com/Disane87/text2image-nodejs" \
      org.opencontainers.image.title="Text2Image" \
      org.opencontainers.image.version="1.0"

WORKDIR /text2image/

COPY package*.json .

RUN npm install
RUN npm install -g puppeteer

COPY dist/ .

EXPOSE 3000

CMD ["node", "main.js"]