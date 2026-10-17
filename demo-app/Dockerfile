FROM node:22-alpine
WORKDIR /app
COPY server.mjs ./
COPY public ./public
ENV NODE_ENV=production PORT=3000
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
# node is PID 1 and handles SIGTERM itself (graceful drain, 10 s cap).
CMD ["node", "server.mjs"]
