const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.json({
        "welcome":"How are you doing today?"
    })
})

app.listen(5000, () => {console.log("Server started on port 5000")})