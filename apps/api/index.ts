import express from "express"

const app = express()

app.use(express.json())

app.get("/test" , (req,res)=>{
    res.json({
        message:"api end point is working boossss..."
    })
})


app.listen(3001 , ()=>{
    console.log(`server is running on http://localhost:3001`)
})