# Use official Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose Port 5000
EXPOSE 5000

# Command to start the API
CMD ["npm", "start"]