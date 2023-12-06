FROM node:16.17.0

WORKDIR /api
COPY . .

RUN npm install
RUN npm run prisma:generate:client
RUN npm run build

CMD ["npm", "run", "start"]