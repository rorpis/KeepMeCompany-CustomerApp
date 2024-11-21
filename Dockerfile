# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose the port on which the app will run
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
