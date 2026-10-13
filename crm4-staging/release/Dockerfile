# Supply an independently reviewed Node 22 image digest; no floating default.
ARG NODE_IMAGE
FROM ${NODE_IMAGE}
WORKDIR /app
COPY release/package.json release/package-lock.json ./release/
RUN cd release && npm ci --omit=dev --ignore-scripts --no-audit --no-fund
ENV NODE_ENV=production
ENV CRM4_CONFIG_FILE=/app/release/runtime-config.json
ENV NODE_PATH=/app/release/node_modules
COPY backend-sources ./backend-sources
COPY tools ./tools
COPY release ./release
COPY cloud-public ./cloud-public
USER node
EXPOSE 8080
CMD ["node", "release/server.cjs"]
