import { productsService } from '../services/productsService.js';

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    console.log(productData);

    const newProduct = await productsService.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res
      .status(500)
      .json({ message: 'Error creating product', details: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedProduct = await productsService.updateProductById(
      id,
      updateData
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error updating product', details: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsService.deleteProductById(id);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'deleting product failed', details: error.message });
  }
};

export const readProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsService.fetchProductById(id);
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching product.', details: error.message });
  }
};

export const readAllProducts = async (req, res) => {
  try {
    const products = await productsService.fetchAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching all products', details: error.message });
  }
};

export const readAllLeads = async (req, res) => {
  try {
    const leads = await productsService.fetchAllLeads();
    res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch leads', details: error.message });
  }
};
