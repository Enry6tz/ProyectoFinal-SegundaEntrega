//conexion a MongoDB
require('./database.js');
//dep
const express = require('express');
const http = require('http')
//const socket = require("socket.io");
const exphbs = require("express-handlebars");
//rutas
const viewsRouter = require("./routes/views.router");
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
//dao
const ProductManager = require('./dao/db/product-manager-db.js')
const CartManager = require('./dao/db/cart-manager-db.js')
const MessageModel = require('./dao/models/message.model.js')

const PORT = 8080;
const app = express()
const server = http.createServer(app)
//const io = socket(server)

// Crea una instancia de productManager y cartManager
const productManager = new ProductManager();
const cartManager = new CartManager();

// Middlewares
// archivos JSON
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// Handlebars
const hbs = exphbs.create({
  runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
  },
})

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set("views", "./src/views")


//archivos estáticos
app.use(express.static("./src/public"));


// Routing
app.use("/",viewsRouter(productManager, cartManager))
// Rutas de productos
app.use('/api/products', productsRouter(productManager))
// Rutas de carritos
app.use('/api/carts', cartsRouter(cartManager, productManager))

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
