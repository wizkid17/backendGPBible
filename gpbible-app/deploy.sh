#!/bin/bash

# Detener la aplicación actual
pm2 stop gpbible-app || true

# Instalar dependencias
npm install

# Construir la aplicación
npm run build

# Iniciar la aplicación con PM2
pm2 start ecosystem.config.js

# Guardar la configuración de PM2
pm2 save

# Reiniciar Nginx
sudo systemctl restart nginx 