FROM node:20-alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy the build output. The angular.json says output path is dist. 
# Since browser points to "." inside dist, we copy contents of dist.
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
