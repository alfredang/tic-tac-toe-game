# Use lightweight Nginx Alpine image to serve static files
FROM nginx:alpine

# Copy custom Nginx config for SPA-friendly serving
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static assets into Nginx's serve directory
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY javascript/ /usr/share/nginx/html/javascript/
COPY assets/ /usr/share/nginx/html/assets/

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
