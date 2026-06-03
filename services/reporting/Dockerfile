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

RUN npm ci --workspace=@fems/reporting --include-workspace-root --omit=dev

COPY shared ./shared
COPY packages/db ./packages/db
COPY services/reporting ./services/reporting

WORKDIR /app/services/reporting
ENV NODE_ENV=production
EXPOSE 3004

CMD ["npm", "start"]
