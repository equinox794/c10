FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:3001

# Build the application with verbose output
RUN npm run build --verbose

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]