FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY gateway/package.json ./gateway/
COPY shared/package.json ./shared/
COPY packages/db/package.json ./packages/db/
COPY services/auth/package.json ./services/auth/
COPY services/extinguisher/package.json ./services/extinguisher/
COPY services/inspection/package.json ./services/inspection/
COPY services/reporting/package.json ./services/reporting/
COPY services/notification/package.json ./services/notification/

RUN npm ci --workspace=@fems/extinguisher --include-workspace-root --omit=dev

COPY shared ./shared
COPY packages/db ./packages/db
COPY services/extinguisher ./services/extinguisher

WORKDIR /app/services/extinguisher
ENV NODE_ENV=production
EXPOSE 3002

CMD ["npm", "start"]
