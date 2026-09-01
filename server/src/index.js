require('dotenv').config();
const app = require('./app');
const connectDB = require('./db');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

connectDB().catch((err) => console.error('MongoDB connection failed:', err));
