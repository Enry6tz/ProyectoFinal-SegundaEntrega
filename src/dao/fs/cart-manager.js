
const fs = require("fs").promises;

class CartManager {
  // Variable para llevar un seguimiento del último id asignado
  static ultId = 0;

  constructor(path) {

    // Inicializa el array de productos y la ruta del archivo
    this.path = path;
    this.carts = path ? this.readFile() : [];
    this.initialize();

  }

  // Método para inicializar la instancia, cargando productos desde el archivo
  async initialize() {
    await this.loadCartsFromDisk();
  }

  // Método para cargar productos desde el archivo
  async loadCartsFromDisk() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
      // Actualiza el último id asignado basándose en los productos cargados
      CartManager.ultId = this.carts.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;
    } catch (error) {
      // Si hay un error al leer o analizar el archivo, se ignora y se continúa con un array vacío
      this.carts = [];
    }
  }
  
  async createCart() {
    const newCart = {
      id: ++CartManager.ultId,
      products: []
    };

    this.carts.push(newCart);
    await this.saveFile();
    console.log("Producto agregado:", newCart);
  }

  getCarts() {
    console.log("getCarts:", this.carts);
    return this.carts;
  }
  // Método para obtener un carrito por su id
  async getCartsById(id) {
    try {
      const arrCarts = await this.readFile();
      const buscado = arrCarts.find(item => item.id === id);

      if (!buscado) {
        console.log("Producto no encontrado");
        return false;
      } else {
        console.log("Producto encontrado:", buscado);
        return buscado;
      }
    } catch (error) {
      console.log("Error al leer el archivo", error);
    }
  }

// Método para actualizar un producto por su id
async updateProduct(cartId, proId, quantity) {
  try {
      const carts = await this.readFile();
      const indexCart = carts.findIndex(item => item.id === cartId);
      if (indexCart !== -1) {
          const products = carts[indexCart].products;
          const indexProduct = products.findIndex(item => item.product === proId);

          let updatedProducts;
          if (indexProduct !== -1) {
              updatedProducts = this.reformatProduct(proId, quantity, products);
          } else {
              updatedProducts = [...products, { product: proId, quantity }];
          }
          //se sobrescribe la posicion en el array
          carts[indexCart].products = updatedProducts;
          await this.saveFile(carts);
          console.log("Producto actualizado:", updatedProducts);
          return updatedProducts;
      } else {
          console.log("No se encontró el carrito, no se puede actualizar");
          return false;
      }
  } catch (error) {
      console.log("Error al actualizar el producto", error);
  }
}

reformatProduct(proId, quantity, products) {
  const index = products.findIndex(item => item.product === proId);
  const updatedProduct = {
      "product": proId,
      "quantity": index !== -1 ? quantity : 1,
  };

  if (index !== -1) {
      // Si el producto ya existe, actualiza la cantidad
      products.splice(index, 1, updatedProduct);
  } else {
      // Si el producto no existe, agrégalo
      products.push(updatedProduct);
  }

  return products;
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
  async saveFile(arrayProductos = this.carts) {
    try {
      await fs.writeFile(this.path, JSON.stringify(arrayProductos, null, 2));
    } catch (error) {
      console.log("Error al guardar el archivo", error);
    }
  }
}

module.exports = CartManager;