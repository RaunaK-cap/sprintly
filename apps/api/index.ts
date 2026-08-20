import express from "express"

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 3000


app.get("/test", (req, res) => {
    res.json({
        message: "api end point is working boossss..."
    })
})

app.post("/data", (req, res) => {
    const body = req.body
    res.json({
        message: body
    })
})


app.listen(PORT, () => {
    console.log(`server is running on http://localhost:{${PORT}}`)
})