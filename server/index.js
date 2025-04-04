
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data storage path
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECOMMENDATIONS_FILE = path.join(DATA_DIR, 'recommendations.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const ACCESS_REQUESTS_FILE = path.join(DATA_DIR, 'accessRequests.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initDataFile = (filePath, initialData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
  }
};

// Initialize users with admin
initDataFile(USERS_FILE, [{
  id: "1", 
  name: "Sayanth", 
  email: "sayanth@example.com", 
  password: "41421014", 
  role: "admin", 
  isMainAdmin: true
}]);
initDataFile(RECOMMENDATIONS_FILE, []);
initDataFile(CLIENTS_FILE, []);
initDataFile(ACCESS_REQUESTS_FILE, []);
initDataFile(SUBSCRIPTIONS_FILE, [{
  id: "default", 
  name: "Default", 
  description: "Default subscription"
}]);

// Helper functions for data operations
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

// API Routes

// Users API
app.get('/api/users', (req, res) => {
  const users = readData(USERS_FILE);
  // Don't send passwords to client
  const safeUsers = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(safeUsers);
});

app.post('/api/users', (req, res) => {
  const users = readData(USERS_FILE);
  const newUser = {
    ...req.body,
    id: req.body.id || `user-${Date.now()}`
  };
  
  // Check if user with this email already exists
  const existingUser = users.find(u => u.email === newUser.email);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  
  users.push(newUser);
  if (writeData(USERS_FILE, users)) {
    // Don't send password back to client
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } else {
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readData(USERS_FILE);
  
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    // Don't send password back to client
    const { password, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      lastLoginTime: Date.now()
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const users = readData(USERS_FILE);
  
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Preserve the existing password if not provided
  const updatedUser = {
    ...users[index],
    ...req.body,
    password: req.body.password || users[index].password
  };
  
  users[index] = updatedUser;
  
  if (writeData(USERS_FILE, users)) {
    // Don't send password back to client
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } else {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Recommendations API
app.get('/api/recommendations', (req, res) => {
  const recommendations = readData(RECOMMENDATIONS_FILE);
  res.json(recommendations);
});

app.post('/api/recommendations', (req, res) => {
  const recommendations = readData(RECOMMENDATIONS_FILE);
  const newRecommendation = {
    ...req.body,
    id: req.body.id || `rec-${Date.now()}`
  };
  
  recommendations.unshift(newRecommendation); // Add to beginning of array
  
  if (writeData(RECOMMENDATIONS_FILE, recommendations)) {
    res.status(201).json(newRecommendation);
  } else {
    res.status(500).json({ message: 'Failed to create recommendation' });
  }
});

app.put('/api/recommendations/:id', (req, res) => {
  const { id } = req.params;
  const recommendations = readData(RECOMMENDATIONS_FILE);
  
  const index = recommendations.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Recommendation not found' });
  }
  
  const updatedRecommendation = {
    ...recommendations[index],
    ...req.body,
    lastUpdated: new Date().toISOString()
  };
  
  recommendations[index] = updatedRecommendation;
  
  if (writeData(RECOMMENDATIONS_FILE, recommendations)) {
    res.json(updatedRecommendation);
  } else {
    res.status(500).json({ message: 'Failed to update recommendation' });
  }
});

app.delete('/api/recommendations/:id', (req, res) => {
  const { id } = req.params;
  const recommendations = readData(RECOMMENDATIONS_FILE);
  
  const filteredRecommendations = recommendations.filter(r => r.id !== id);
  
  if (writeData(RECOMMENDATIONS_FILE, filteredRecommendations)) {
    res.json({ message: 'Recommendation deleted' });
  } else {
    res.status(500).json({ message: 'Failed to delete recommendation' });
  }
});

// Clients API
app.get('/api/clients', (req, res) => {
  const clients = readData(CLIENTS_FILE);
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const clients = readData(CLIENTS_FILE);
  const newClient = {
    ...req.body,
    id: req.body.id || `client-${Date.now()}`
  };
  
  clients.push(newClient);
  
  if (writeData(CLIENTS_FILE, clients)) {
    res.status(201).json(newClient);
  } else {
    res.status(500).json({ message: 'Failed to create client' });
  }
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const clients = readData(CLIENTS_FILE);
  
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Client not found' });
  }
  
  const updatedClient = {
    ...clients[index],
    ...req.body
  };
  
  clients[index] = updatedClient;
  
  if (writeData(CLIENTS_FILE, clients)) {
    res.json(updatedClient);
  } else {
    res.status(500).json({ message: 'Failed to update client' });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const clients = readData(CLIENTS_FILE);
  
  const filteredClients = clients.filter(c => c.id !== id);
  
  if (writeData(CLIENTS_FILE, filteredClients)) {
    res.json({ message: 'Client deleted' });
  } else {
    res.status(500).json({ message: 'Failed to delete client' });
  }
});

// Access Requests API
app.get('/api/access-requests', (req, res) => {
  const accessRequests = readData(ACCESS_REQUESTS_FILE);
  res.json(accessRequests);
});

app.post('/api/access-requests', (req, res) => {
  const accessRequests = readData(ACCESS_REQUESTS_FILE);
  const newRequest = {
    ...req.body,
    id: req.body.id || `req-${Date.now()}`,
    status: "pending",
    requestDate: new Date().toISOString()
  };
  
  accessRequests.push(newRequest);
  
  if (writeData(ACCESS_REQUESTS_FILE, accessRequests)) {
    res.status(201).json(newRequest);
  } else {
    res.status(500).json({ message: 'Failed to create access request' });
  }
});

app.put('/api/access-requests/:id', (req, res) => {
  const { id } = req.params;
  const accessRequests = readData(ACCESS_REQUESTS_FILE);
  
  const index = accessRequests.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Access request not found' });
  }
  
  const updatedRequest = {
    ...accessRequests[index],
    ...req.body
  };
  
  accessRequests[index] = updatedRequest;
  
  if (writeData(ACCESS_REQUESTS_FILE, accessRequests)) {
    res.json(updatedRequest);
  } else {
    res.status(500).json({ message: 'Failed to update access request' });
  }
});

// Notifications endpoint
app.post('/api/notifications', (req, res) => {
  // This endpoint is for broadcasting notifications
  // In a real app, you would use WebSockets for real-time notifications
  // For now, we'll just return success to simulate it working
  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
