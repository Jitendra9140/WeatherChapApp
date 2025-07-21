# Weather Chat App

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jitendras-projects-9a1ad583/v0-weather-agent-chat-interface)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/pkDTfOJaXpt)

## Overview

This application integrates weather data into a chat interface, allowing users to request and view current weather information for any location. The app features a responsive design with animated weather displays, unit conversion options, and data caching for improved performance.

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Authentication System

This application includes a complete authentication system with user registration, login, and protected routes using MongoDB for data storage and JWT for authentication tokens.

### Features

- User registration with name, email, and password
- User login with email and password
- JWT-based authentication
- Protected API routes
- User profile access

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/weatherchatapp
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
```

Replace the `MONGODB_URI` with your MongoDB connection string and set a secure random string for `JWT_SECRET`.

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
  - Body: `{ name, email, password }`
  - Returns: User data and JWT token

- **POST /api/auth/login** - Login a user
  - Body: `{ email, password }`
  - Returns: User data and JWT token

- **GET /api/auth/me** - Get current user profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: User data

## Deployment

Your project is live at:

**[https://vercel.com/jitendras-projects-9a1ad583/v0-weather-agent-chat-interface](https://vercel.com/jitendras-projects-9a1ad583/v0-weather-agent-chat-interface)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/pkDTfOJaXpt](https://v0.dev/chat/projects/pkDTfOJaXpt)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
