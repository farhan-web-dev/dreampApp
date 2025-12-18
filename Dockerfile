# ---------- Build Stage ----------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Production Stage ----------
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

# Copy only the built files
COPY --from=build /app/dist ./dist

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l $PORT"]
