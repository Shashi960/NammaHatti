# Deployment & Production Architecture

## 1. Environment Configurations
In production, provide the following environment variables:

```bash
# Production MongoDB Cluster URI (Atlas or replica set)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/localmesh?retryWrites=true&w=majority

# Cryptographically Secure JWT Secret (min 32 random characters)
JWT_SECRET=production-secret-random-32-character-crypto-string-here

# Platform Brand
BRAND_NAME=LocalMesh
NEXT_PUBLIC_BRAND_NAME=LocalMesh

# Google Maps API Credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy... (HTTP referrer restricted)
GOOGLE_MAPS_API_KEY=AIzaSy... (IP address restricted)

# Node Environment
NODE_ENV=production
```

---

## 2. Docker / Container Deployment
A simple multi-stage Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 3. Vercel / Railway / Render Deployment
1. Connect repository.
2. Configure environment variables in project settings.
3. Build command: `npm run build`
4. Start command: `npm start`
5. Ensure MongoDB Atlas network access allows outgoing connections from the deployment provider.
