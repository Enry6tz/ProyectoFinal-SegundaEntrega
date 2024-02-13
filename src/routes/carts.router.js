const express = require('express')
const router = express.Router()

module.exports = (cartManager, productManager) => {
    // Ruta POST /api/carts - se crea un nuevo carrito
    router.post('/', async (req, res) => {
        try {
            const newCart = await cartManager.createCart()
            res.json({ newCart })
        } catch (error) {
            console.error("Error creating a new cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta GET /api/carts/:cid - se listan los productos que pertenecen a determinado carrito
    router.get('/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                res.status(400).json({ error: `No cart exists with the id ${cartId}` })
            } else {
                res.json(cart.products)
            }
        } catch (error) {
            console.error("Error retrieving the cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta POST /api/carts/:cid/product/:pid - se agregan productos a distintos carritos
    router.post('/:cid/product/:pid', async (req, res) => {
        const cartId = req.params.cid
        const productId = req.params.pid
        const quantity = req.body.quantity || 1
        try {
            // Se verifica si el carrito existe en el array de carritos
            const verifyCartId = await cartManager.getCartById(cartId)
            if (!verifyCartId) {
                res.status(400).json({ error: `No cart exists with the id ${cartId}` })
                return cartId
            }

            // Se verifica si el producto existe en el array de productos
            const verifyProductId = await productManager.getProductById(productId)
            if (!verifyProductId) {
                res.status(400).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            const updateCart = await cartManager.addProductToCart(cartId, productId, quantity, productManager)
            res.json(updateCart.products)
        } catch (error) {
            console.error("Error adding a product to the cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })



    // Ruta DELETE /api/carts/:cid - se eliminan todos los productos del carrito (se vacía el mismo)
    router.delete('/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            // se llama a la función clearCart del cartManager para eliminar todos los productos del carrito
            await cartManager.clearCart(cartId)
            // se envía una respuesta exitosa al cliente
            res.status(200).json({ message: 'All products deleted from cart successfully.' })
        } catch (error) {
            console.error("Error deleting products from cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta DELETE /api/carts/:cid/products/:pid - se elimina un producto del carrito
    router.delete('/:cid/product/:pid', async (req, res) => {
        const cartId = req.params.cid
        const productId = req.params.pid

        try {
            // Verificar si el carrito existe
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            // Eliminar el producto del carrito
            await cartManager.deleteProductFromCart(cartId, productId)
            res.json({ message: `Product with id ${productId} removed from cart with id ${cartId}` })
        } catch (error) {
            console.error("Error deleting product from cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta PUT api/carts/:cid/products/:pid - se actualiza la cantidad de un producto especifico en el carrito
    router.put('/:cid/product/:pid', async (req, res) => {
        try {
            const cartId = req.params.cid
            const productId = req.params.pid
            const { quantity } = req.body

            // Se actualiza la cantidad del producto en el carrito
            const updatedCart = await cartManager.updateProductQuantityInCart(cartId, productId, quantity)

            // Se Envia una respuesta con el carrito actualizado
            res.json(updatedCart)
        } catch (error) {
            console.error("Error updating product quantity in cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta PUT api/carts/:cid - se actualiza el carrito con un arreglo de productos
    router.put('/:cid', async (req, res) => {
        const cartId = req.params.cid;
        const newProducts = req.body.products;

        try {
            // se verifica si el carrito existe en el array de carritos
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            // se actualiza el carrito con los nuevos productos
            const updatedCart = await cartManager.updateCart(cartId, newProducts)

            res.json(updatedCart)
        } catch (error) {
            console.error("Error updating cart:", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    return router
}