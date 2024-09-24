# Etapa de build do frontend
FROM node:20.9.0 as build
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de certificados SSL autoassinados
FROM docker.io/nginx:latest as certgen
RUN apt-get update && apt-get install -y openssl
RUN mkdir /etc/nginx/ssl
WORKDIR /etc/nginx/ssl
COPY .env .
ENV HOST=localhost
RUN openssl genpkey -algorithm RSA -out private.key
RUN openssl req -new -key private.key -out cert.csr -subj "/C=BR/ST=RN/L=PAR/O=IFRN/CN=${HOST}" \
    -addext 'subjectAltName=DNS:'${HOST}''
RUN openssl x509 -req -days 1826 -in cert.csr -signkey private.key -out cert.crt -text

# Etapa de configuração do Nginx
FROM docker.io/nginx:latest
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build frontend/dist/crud-carros /usr/share/nginx/html
COPY --from=certgen /etc/nginx/ssl/private.key /etc/nginx/ssl/
COPY --from=certgen /etc/nginx/ssl/cert.crt /etc/nginx/ssl/
COPY --from=certgen /etc/nginx/ssl/cert.csr /etc/nginx/ssl/
RUN chown -R nginx:nginx /usr/share/nginx/html/

EXPOSE 80
EXPOSE 443

COPY .env .
ENV HOST=localhost