
# Kulstock CRM Server

This is a simple Express server for the Kulstock CRM application. It provides REST API endpoints for managing users, recommendations, clients, and access requests.

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone this repository
2. Navigate to the server directory

```bash
cd server
```

3. Install dependencies

```bash
npm install
```

4. Start the server

```bash
npm run dev
```

The server will start on port 5000 by default. You can change this by setting the PORT environment variable.

## API Endpoints

### Authentication
- POST /api/login - Login with email and password
- POST /api/users - Register a new user

### Users
- GET /api/users - Get all users
- PUT /api/users/:id - Update a user

### Recommendations
- GET /api/recommendations - Get all recommendations
- POST /api/recommendations - Create a new recommendation
- PUT /api/recommendations/:id - Update a recommendation
- DELETE /api/recommendations/:id - Delete a recommendation

### Clients
- GET /api/clients - Get all clients
- POST /api/clients - Create a new client
- PUT /api/clients/:id - Update a client
- DELETE /api/clients/:id - Delete a client

### Access Requests
- GET /api/access-requests - Get all access requests
- POST /api/access-requests - Create a new access request
- PUT /api/access-requests/:id - Update an access request
