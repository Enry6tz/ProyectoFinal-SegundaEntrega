const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://enrique6tz:MongoDB2024@cluster0.aboroby.mongodb.net/ecommerce?retryWrites=true&w=majority")
.then(()=> {console.log("conexion a mongoDB exitosa")})
.catch((e)=>console.log("ERROR al conectarse a la base de datos",e))


