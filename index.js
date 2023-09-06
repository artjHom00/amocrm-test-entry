let express = require('express')
require('dotenv').config()

let app = express()

app.use('/', require('./routes/api'))

const port = process.env.PORT || 80
app.listen(port, () => {
    console.clear()
    console.log(`[server] started on port ${port}`)
})