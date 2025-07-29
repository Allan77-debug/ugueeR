# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the production build with a lightweight web server (e.g., Nginx)
FROM nginx:alpine

# Copia la build de producción
COPY --from=builder /app/dist /usr/share/nginx/html

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia tu configuración personalizada
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]