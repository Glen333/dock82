const path = require('path');
const fs = require('fs');

// When running from the backend package (e.g. in AWS), load environment variables if present
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
} else {
  require('dotenv').config();
}

// Delegate to the main server implementation
require('./app');

