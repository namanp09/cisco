const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

dotenv.config();
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));

// Webhook route needs raw body
const { handleWebhook } = require('./controllers/user.controller');
app.post('/api/webhooks/user', express.raw({type: 'application/json'}), handleWebhook);

// Use the JSON parser for all other API routes
app.use(express.json());

// Routes
const groupRoutes = require('./routes/group.routes');
const expenseRoutes = require('./routes/expense.routes');

app.use('/api/groups', ClerkExpressWithAuth(), groupRoutes);
app.use('/api/groups', ClerkExpressWithAuth(), expenseRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected to database:', mongoose.connection.name);
    })
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Expense Splitter Service API');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});