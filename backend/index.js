const connectToMongo = require('./db');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express()
const port = 5000

dotenv.config()
app.use(express.json())
app.use(cors())

connectToMongo();



// Available routes 
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))


app.listen(port, () => {
  console.log(`iNotebook Backend listening on port ${port}`)
})