FROM node:18

COPY package*.json ./
COPY . .

RUN npm install
RUN npx prisma generate

CMD ["bash", "-c", "npx prisma migrate dev --name init && npm run db-mock && npm run start"]
