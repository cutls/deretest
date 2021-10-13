const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config()
const { ENV } = process.env
fs.writeFileSync('./public/env.json', ENV)
