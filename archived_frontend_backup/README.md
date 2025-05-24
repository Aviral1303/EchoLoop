# EchoLoop Frontend

This is the frontend for the EchoLoop email summarization system. It's built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (placeholder for MVP)
- Dashboard with email summaries
- Real-time notifications via WebSocket
- Mobile-responsive design

## Prerequisites

- Node.js 14+
- npm or yarn

## Setup

1. Clone the repository and navigate to the frontend directory

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:8000/api/v1
   REACT_APP_WS_URL=ws://localhost:8000/api/v1/ws
   ```

4. Start the development server:
   ```
   npm start
   ```

5. The application will be available at http://localhost:3000

## Building for Production

To build the application for production, run:
```
npm run build
```

This will create a `build` directory with optimized production files.

## Project Structure

- `src/components/` - Reusable UI components
- `src/contexts/` - React context providers
- `src/layouts/` - Layout components
- `src/pages/` - Page components
- `src/services/` - API services
- `src/types/` - TypeScript type definitions

## Key Components

- **NotificationContext**: Manages notifications and WebSocket connection
- **Dashboard**: Main page for viewing email summaries
- **EmailSummaryCard**: Card component for displaying email summaries
- **Navbar**: Navigation with notification indicator
