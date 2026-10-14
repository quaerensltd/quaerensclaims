# Both stages require independently reviewed immutable digests.
ARG NODE_IMAGE
ARG RUNTIME_IMAGE
FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app
COPY release/package.json release/package-lock.json ./release/
RUN cd release && npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# No npm, shell, package manager or install-stage OS in the runtime.
FROM ${RUNTIME_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV CRM4_CONFIG_FILE=/app/release/runtime-config.json
ENV NODE_PATH=/app/release/node_modules
COPY backend-sources ./backend-sources
COPY tools ./tools
COPY release ./release
COPY --from=dependencies /app/release/node_modules ./release/node_modules
COPY cloud-public ./cloud-public
USER 65532:65532
RUN ["/nodejs/bin/node", "release/runtime-smoke.cjs"]
EXPOSE 8080
ENTRYPOINT ["/nodejs/bin/node"]
CMD ["release/server.cjs"]
