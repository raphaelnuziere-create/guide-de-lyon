FROM directus/directus:latest

# Set environment variables
ENV KEY=255d861b-5ea1-5996-9aa3-922530ec40b1
ENV SECRET=directus-secret-key-production-guide-lyon
ENV DB_CLIENT=sqlite3
ENV DB_FILENAME=/directus/database.db
ENV ADMIN_EMAIL=admin@guide-lyon.fr
ENV ADMIN_PASSWORD=AdminPassword123!
ENV CORS_ENABLED=true
ENV CORS_ORIGIN=https://www.guide-de-lyon.fr,http://localhost:3000
ENV STORAGE_LOCATIONS=local
ENV STORAGE_LOCAL_DRIVER=local
ENV STORAGE_LOCAL_ROOT=/directus/uploads

# Create directories and set permissions
RUN mkdir -p /directus/uploads /directus/database && \
    chown -R node:node /directus

# Set working directory
WORKDIR /directus

# Expose port
EXPOSE 8055

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8055/server/health || exit 1

# Start Directus
CMD ["npx", "directus", "start"]