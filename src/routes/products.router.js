const express = require('express')
const router = express.Router()
const ProductModel = require("../dao/models/products.model.js")

module.exports = (ProductManager) => {
    // Ruta GET /api/products - se listan todos los productos con paginación, filtros y ordenamiento
    router.get('/', async (req, res) => {
        try {
            let { limit, page, sort, query: filterQuery } = req.query

            // se convierten a números los valores de limit y page
            limit = parseInt(limit) || 10 // Si no se especifica limit, por defecto será 10
            page = parseInt(page) || 1 // Si no se especifica page, por defecto será 1

            // Objeto para opciones de ordenamiento
            let sortOptions = {}
            if (sort) {
                sortOptions.price = (sort === 'asc') ? 1 : -1 // Se Ordena por precio ascendente o descendente según el valor de 'sort'
            }

            // Objeto para opciones de filtrado
            const filterOptions = {}
            if (filterQuery) {
                filterOptions.category = filterQuery // Se Filtra por categoría si se proporciona el parámetro 'query'
            }

            const productsList = await ProductModel.paginate(filterOptions, { limit, page, sort: sortOptions })

            const productsFinalResult = productsList.docs.map(product => {
                const { id, ...rest } = product.toObject()
                return rest
            })

            // Se construyen los enlaces de previo y siguiente
            const prevLink = productsList.hasPrevPage ? `/api/products?limit=${limit}&page=${productsList.prevPage}&sort=${sort}&query=${filterQuery}` : null
            const nextLink = productsList.hasNextPage ? `/api/products?limit=${limit}&page=${productsList.nextPage}&sort=${sort}&query=${filterQuery}` : null

            // Se construye el objeto de respuesta según el formato requerido
            const response = {
                status: 'success',
                payload: productsFinalResult,
                totalDocs: productsList.totalDocs,
                totalPages: productsList.totalPages,
                prevPage: productsList.prevPage,
                nextPage: productsList.nextPage,
                page: productsList.page,
                hasPrevPage: productsList.hasPrevPage,
                hasNextPage: productsList.hasNextPage,
                prevLink,
                nextLink
            }
            // Se envia la respuesta
            res.json(response)
        } catch (error) {
            console.error("Error getting the products", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta GET /api/products/:pid - se obtiene un producto por su id
    router.get('/:pid', async (req, res) => {
        try {
            const productId = req.params.pid
            const product = await ProductManager.getProductById(productId)

            if (!product) {
                res.status(400).json({ error: `A product with the id ${productId} was not found.` })
            } else {
                res.json({ message: "Product found:", product })
            }

        } catch (error) {
            console.error("Error getting the product", error)
            res.status(500).json({ error: `Internal Server Error.` })
        }
    })

    // Ruta POST /api/products - se añade un producto
    router.post('/', async (req, res) => {
        try {
            const newProduct = req.body
            const requiredFields = ["title", "description", "category", "price", "thumbnail", "code", "stock", "status"]
            const missingFields = requiredFields.filter(field => !(field in newProduct) || (typeof newProduct[field] === "string" && newProduct[field].trim() === ""))

            if (missingFields.length > 0) {
                return res.status(400).json({ message: "All fields are mandatory." })
            }

            const products = await ProductManager.getProducts()
            const existingProduct = products.find(product => product.code === newProduct.code)

            if (existingProduct) {
                return res.status(400).json({ message: "A product with that code already exists." })
            }

            await ProductManager.addProduct(newProduct)
            res.json({ message: "Product added successfully", newProduct })
        } catch (error) {
            console.error("Error adding the product", error)
            res.status(500).json({ error: `Internal Server Error.` })
        }
    })

    // Ruta PUT /api/products/:pid - se actualiza un producto
    router.put('/:pid', async (req, res) => {
        try {
            const productId = req.params.pid
            const updatedProduct = req.body
            const productIdToVerify = await ProductManager.getProductById(productId)

            if (productIdToVerify) {
                await ProductManager.updateProduct(productId, updatedProduct)
                return res.json({ message: "Product updated successfully:", updatedProduct })
            } else {
                return res.status(400).json({ error: `A product with the id ${productId} was not found.` })
            }

        } catch (error) {
            console.error("Error updating the product", error)
            res.status(500).json({ error: `Internal Server Error.` })
        }
    })

    // Ruta DELETE /api/products/:pid - se elimina un producto
    router.delete('/:pid', async (req, res) => {
        try {
            const productId = req.params.pid
            const productIdToVerify = await ProductManager.getProductById(productId)

            if (productIdToVerify) {
                const productToDelete = await ProductManager.deleteProduct(productId)
                return res.json({ message: "Product deleted successfully:", productToDelete })
            } else {
                return res.status(400).json({ error: `A Product with the id ${productId} was not found.` })
            }

        } catch (error) {
            console.error("Error deleting the product", error)
            res.status(500).json({ error: `Internal Server Error.` })
        }
    })

    return router
}