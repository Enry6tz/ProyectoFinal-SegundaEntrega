
const fs = require("fs").promises;

class ProductManager {
    // Variable para llevar un seguimiento del último id asignado
    static ultId = 0;

    constructor(path) {

        // Inicializa el array de productos y la ruta del archivo
        this.path = path;
        this.products = path ? this.readFile() : [];
        this.initialize();
    
      }
  
    // Método para inicializar la instancia, cargando productos desde el archivo
    async initialize() {
      await this.loadProductsFromDisk();
    }
  
    // Método para cargar productos desde el archivo
    async loadProductsFromDisk() {
      try {
        const data = await fs.readFile(this.path, 'utf-8');
        this.products = JSON.parse(data);
        // Actualiza el último id asignado basándose en los productos cargados
        ProductManager.ultId = this.products.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;
      } catch (error) {
        // Si hay un error al leer o analizar el archivo, se ignora y se continúa con un array vacío
        this.products = [];
      }
    }
    // Método para agregar un nuevo producto al array y guardar en el archivo
    async addProduct(nuevoObjeto) {
        if (!nuevoObjeto) {
            console.error("El objeto es undefined o null");
            return false;
        }

        let { title, description, price, thumbnails, code, stock,status =true,category } = nuevoObjeto;

        // Validaciones
        if (![title, description, price, code, stock, status,category].every(Boolean)) {
            console.error("Todos los campos son obligatorios");
            return false;
        }
        if(!thumbnails){
            thumbnails =[""];
        }
        if (this.products.some(item => item.code === code)) {
            console.error("El código debe ser único");
            return false;
        }

        // Crear nuevo producto con id autoincrementable
        const newProduct = {
            id: ++ProductManager.ultId,
            title,
            description,
            code,
            price,
            stock,
            thumbnails,
            status,
            category
        };

        // Agregar producto al array
        this.products.push(newProduct);

        // Guardar el array actualizado en el archivo
        await this.saveFile();
        console.log("Producto agregado:", newProduct);
        return true;
    }

    // Método para obtener todos los productos
    getProducts() {
        console.log("getProducts:", this.products);
        return this.products;
    }

    // Método para obtener un producto por su id
    async getProductById(id) {
        try {
            const arrayProductos = await this.readFile();
            const buscado = arrayProductos.find(item => item.id === id);

            if (!buscado) {
                console.log("Producto no encontrado");
            } else {
                console.log("Producto encontrado:", buscado);
                return buscado;
            }
        } catch (error) {
            console.log("Error al leer el archivo", error);
        }
    }

    // Método para actualizar un producto por su id
    async updateProduct(id, updatedProduct) {
        try {
            const arrayProductos = await this.readFile();

            const index = arrayProductos.findIndex(item => item.id === id);

            if (index !== -1) {
                updatedProduct = this.reformatProduct(updatedProduct, arrayProductos[index])
                // Utilizo el método de array splice para reemplazar el objeto en la posición del index
                arrayProductos.splice(index, 1, updatedProduct);
                await this.saveFile(arrayProductos);
                console.log("Producto actualizado:", updatedProduct);
                return updatedProduct;
            } else {
                console.log("No se encontró el producto, no se puede actualizar");
                return false;
            }
        } catch (error) {
            console.log("Error al actualizar el producto", error);
        }
    }
    reformatProduct(newParams, oldProduct) {
        const updatedProduct = {
            "id": oldProduct.id,
            "title": newParams.title ?? oldProduct.title,
            "description": newParams.description ?? oldProduct.description,
            "code": newParams.code ?? oldProduct.code,
            "price": newParams.price ?? oldProduct.price,
            "stock": newParams.stock ?? oldProduct.stock,
            "status": newParams.status ?? oldProduct.status,
            "thumbnails": newParams.thumbnails ?? oldProduct.thumbnails,
            "category": newParams.category ?? oldProduct.category,
        };

        return updatedProduct;
    }

    // Método para eliminar un producto por su id
    async deleteProduct(id) {
        try {
            const arrayProductos = await this.readFile();
            id = parseInt(id)
            const index = arrayProductos.findIndex(item => item.id === id);


            if (index !== -1) {
                // Utilizo el método de array splice para eliminar el objeto en la posición del index
                arrayProductos.splice(index, 1);
                await this.saveFile(arrayProductos);
                console.log("Producto eliminado satisfactoriamente");
                return true;
            } else {
                console.log("No se encontró el producto");
                return false;
            }
        } catch (error) {
            console.log("Error al eliminar el producto", error);
        }
    }

    // Método para leer el archivo
    async readFile() {
        try {
            const respuesta = await fs.readFile(this.path, "utf-8");
            const arrayProductos = JSON.parse(respuesta);
            return arrayProductos;
        } catch (error) {
            console.log("Error al leer un archivo", error);
        }
    }
    

    // Método para guardar el array actualizado en el archivo
    async saveFile(arrayProductos = this.products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(arrayProductos, null, 2));
        } catch (error) {
            console.log("Error al guardar el archivo", error);
        }
    }
}

module.exports = ProductManager;