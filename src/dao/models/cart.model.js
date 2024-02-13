const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    
    products: [
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'Products',
                require:true,
            },
            quantity:{
                type: Number,
                required:true,
            }
        }
    ]

})

//Utiliza el método populate de Mongoose para cargar documentos referenciados en lugar de solo los ID
cartSchema.pre("findOne", function (next) {
    this.populate('products.product')
    next()
})

const CartModel = mongoose.model("carts", cartSchema)

module.exports = CartModel;