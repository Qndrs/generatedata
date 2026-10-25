# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN npm install --global pnpm@10.31.0 --fetch-retries=5
COPY . .
RUN node -e "const fs=require('fs'); for(const n of ['client','server']) fs.writeFileSync('packages/config/src/'+n+'.config.ts',fs.readFileSync('config/'+n+'.config.ts','utf8').replace('../packages/config/src/types','./types'));"
RUN --mount=type=cache,id=datagenerator-pnpm,target=/pnpm/store pnpm install --store-dir=/pnpm/store --frozen-lockfile --ignore-scripts
# Upstream beta4 omits Node typings from two workspaces.
RUN ln -s ../../../config/node_modules/@types/node packages/tools/node_modules/@types/node && ln -s ../../packages/config/node_modules/@types/node node_modules/@types/node
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm exec turbo run build --filter=@generatedata/client^... --ui=stream
RUN node tools/check-quality.cjs
FROM dependencies AS build
RUN pnpm --filter @generatedata/client build
RUN node --test tools/tests/*.test.cjs
FROM nginx:alpine AS web
COPY apps/server/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
FROM build AS api
CMD ["node", "tools/start-server.cjs"]
