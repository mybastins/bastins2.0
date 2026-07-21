require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Bastins API running on http://localhost:${PORT}\n`);
});
