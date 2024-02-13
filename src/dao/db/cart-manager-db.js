
const CartModel = require('../models/cart.model.js')

class CartManager {
    async createCart() {
       try {
            const newCart = new CartModel({products: []})
            await newCart.save();
            return newCart;
       } catch (error) {
            console.log('error al crear el carrito', error);
            return false;
       }
    }

    async getCarts() {
        try {
            const carts = await CartModel.find()
            return carts;
        } catch (error) {
            console.log('Error al obtener los carritos', error)
        }
    }

    // Método para obtener un carrito por su id
    async getCartsById(id) {
        try {
           const cart = await CartModel.findById(id);
           if(!cart){
                console.log('No existre carrito con el id')
                return null;
           }
            return cart;
       } catch (error) {
            console.log('error al obtener el carrito', error);
            return false;
       }
    }

    async addProductToCart(cartId, productId, quantity = 1, productManager){
        try {
            const cart = await this.getCartsById(cartId);
            if(!cart){
                console.error(`No existe carrito con el id ${cartId}`);
                return null;
            }

            const product = await productManager.getProductById(productId);
            if (!product){
                console.error(`No existe producto con el id ${productId}`)
                return null
            }
            const productExist = cart.products.find(p => p.product.equals(productId))
            if(productExist){
                productExist.quantity += quantity;
            }else{
                cart.products.push({product:productId, quantity});
            }

            //marcar propiedad modificada
            cart.markModified("products");
            await cart.save();
            return cart;
        } catch (error) {
            
        }
    }

    async clearCart(cartId){
        try {
            //objeto plano que representa los datos del carrito, sin las funcionalidades adicionales proporcionadas por Mongoose.
            const cart = await CartModel.findById(cartId).lean().exec()
            if(!cart){
                console.error(`No existe carrito con el id ${cartId}`)
            }
            cart.products = []
            await CartModel.findByIdAndUpdate(cartId, {products: cart.products}).exec()
        } catch (error) {
            console.error("Error al limpiar carrito", error)
            return false;
        }
    }

    async deleteProductFromCart(cartId, productId){
        try {
            // Se Busca el carrito por su ID y se actualiza el array de productos
            const updatedCart = await CartModel.findByIdAndUpdate(
                cartId,
                { $pull: { products: { product: productId } } }, // Se utiliza $pull para eliminar el producto del array
                { new: true } // Nos devuelve el carrito actualizado después de la operación
            )

            if (!updatedCart) {
                console.error(`No existe el carrito con el id ${cartId}`)
                return null
            }

            return updatedCart
        } catch (error) {
            console.error("error al eliminar el producto del carrito", error)
            throw error
        }
    }

    async updateProductQuantityInCart(cartId, productId, newQuantity) {
        try {
            
            //traemos el carrito 
            const cart = await this.getCartById(cartId)
            if (!cart) {
                console.error(`No existe el carrito con el id ${cartId}`)
                return null
            }

            // se verifica si el producto existe en el carrito
            const productToUpdate = cart.products.find(p => p.product.equals(productId))
            if (!productToUpdate) {
                console.error(`No existe producto con el id ${productId}`)
                return null
            }

            // Se actualiza la cantidad del producto
            productToUpdate.quantity = newQuantity

            // Guardar los cambios
            await cart.save()
            return cart
        } catch (error) {
            console.error("Error al actualizar la cantidad en el carrito", error)
            return false;
        }
    }

    async updateCart(cartId, newProducts) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(cartId, { products: newProducts }, { new: true })
            return updatedCart
        } catch (error) {
            console.error("Error al actualizar el carrito:", error)
            throw error;
        }
    }
}

module.exports = CartManager;