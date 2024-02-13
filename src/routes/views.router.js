const express = require('express')
const router = express.Router()
const ProductModel = require("../dao/models/products.model.js")

module.exports = (productManager, cartManager) => {
    // Ruta para la vista home.handlebars
    router.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts() // Se obtiene la lista de productos
            res.render('home', { title: 'Home', products }) // Se pasa la lista de productos a la vista
        } catch (error) {
            console.error('error al obtener productos', error)
            res.status(500).json({ error: 'error interno en el servidor' })
        }
    })


    // Ruta para la vista product.handlebars
    router.get('/products', async (req, res) => {
        const page = req.query.page || 1
        const limit = 5
        try {
            const productsList = await ProductModel.paginate({}, { limit, page })

            const productsFinalResult = productsList.docs.map(product => {
                const { id, ...rest } = product.toObject()
                return rest
            })

            res.render('products', {
                title: 'Products List',
                products: productsFinalResult,
                hasPrevPage: productsList.hasPrevPage,
                hasNextPage: productsList.hasNextPage,
                prevPage: productsList.prevPage,
                nextPage: productsList.nextPage,
                currentPage: productsList.page,
                totalPages: productsList.totalPages
            })
        } catch (error) {
            console.log("Error en la paginacion ", error)
            res.status(500).send("Error interno en el server")
        }
    })

    // Ruta para la vista productDetail.handlebars
    router.get('/products/:productId', async (req, res) => {
        try {
            const productId = req.params.productId
            const product = await productManager.getProductById(productId) // se obtiene el producto por su ID
            res.render('productDetail', { title: 'Product Detail', product }) // Se renderiza la vista 'productDetails' con los detalles del producto
        } catch (error) {
            console.error('Error al obtener detalles del producto', error)
            res.status(500).json({ error: 'Error interno en el server' })
        }
    })

    // Ruta para la vista cart.handlebars
    router.get('/carts/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            const cart = await cartManager.getCartsById(cartId)
            if (!cart) {
                console.error(`No se encontro carrito con el id ${cartId}`)
                return cart
            }

            // Se renderiza la vista de carrito con los productos asociados
            res.render('cart', { cartId, products: cart.products, title: 'Cart' })
        } catch (error) {
            console.error("error al obtener carrito", error)
            res.status(500).json({ error: 'Error interno en el server' })
        }
    })

    return router
}
