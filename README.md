# AI-Powered Resume Analyzer - Backend

Backend server for the AI-Powered Resume Analyzer application built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Resume upload and text parsing (PDF, DOCX, TXT)
- AI-powered resume analysis using OpenAI
- Job description matching
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Set a secure JWT secret
   - Add your OpenAI API key

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Resumes
- `POST /api/resumes` - Create a new resume (upload file or paste text)
- `GET /api/resumes` - Get all resumes for the authenticated user
- `GET /api/resumes/:id` - Get a specific resume
- `DELETE /api/resumes/:id` - Delete a resume

### Analyses
- `POST /api/analyses` - Create a new analysis
- `GET /api/analyses` - Get all analyses for the authenticated user
- `GET /api/analyses/:id` - Get a specific analysis
- `DELETE /api/analyses/:id` - Delete an analysis

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `OPENAI_API_KEY` - OpenAI API key for AI analysis

