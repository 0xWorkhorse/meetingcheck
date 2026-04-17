# Build context is the monorepo root, not api/.
# This Dockerfile is wired via api/railway.json → dockerfilePath: "api/Dockerfile"
# with the service's Root Directory set to the repo root.

FROM node:20-alpine AS build
WORKDIR /repo

# Install deps for all workspaces in one npm ci pass.
# We need the detector workspace's source at install time because the api
# depends on @meetingcheck/detector via a workspace reference.
COPY package.json package-lock.json ./
COPY detector/package.json detector/
COPY api/package.json api/

RUN npm ci --workspaces --include-workspace-root

# Copy sources for the workspaces that participate in the API build.
COPY detector detector
COPY api api

RUN npm --workspace @meetingcheck/detector run build \
 && npm --workspace @meetingcheck/api run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /repo/package.json /app/package.json
COPY --from=build /repo/package-lock.json /app/package-lock.json
COPY --from=build /repo/node_modules /app/node_modules
COPY --from=build /repo/detector/package.json /app/detector/package.json
COPY --from=build /repo/detector/dist /app/detector/dist
COPY --from=build /repo/api/package.json /app/api/package.json
COPY --from=build /repo/api/dist /app/api/dist
COPY --from=build /repo/api/migrations /app/api/migrations
ENV NODE_ENV=production
WORKDIR /app/api
EXPOSE 3000
CMD ["node", "dist/index.js"]
