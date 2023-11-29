# Stufe 1: Build-Stage
FROM satantime/puppeteer-node:20-slim as builder
WORKDIR /text2image/

# Kopiere nur die Paketbeschreibungen und installiere Abhängigkeiten
COPY package*.json ./
RUN npm install --production && npm install -g puppeteer

# Kopiere den kompilierten Code und node_modules in die finale Stufe
FROM satantime/puppeteer-node:20-slim
WORKDIR /text2image/

# Metadata as defined in the OCI image spec annotations
LABEL org.opencontainers.image.authors="Marco Franke <mfranke87@icloud.com>" \
      org.opencontainers.image.description="Adds text to images" \
      org.opencontainers.image.source="https://github.com/Disane87/text2image-nodejs" \
      org.opencontainers.image.title="Text2Image" \
      org.opencontainers.image.version="1.0"

# Kopiere node_modules und dist aus der Build-Stufe
COPY --from=builder /text2image/dist/ .
COPY --from=builder /text2image/node_modules/ ./node_modules/

# Kopiere restliche Dateien aus der Build-Stufe
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
