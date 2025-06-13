// products-service/src/data-access/productsImagesModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from './productsDataAccess.js';

export const ProductsImages = sequelize.define(
  'ProductImage',
  {
    image_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'products_images',
    timestamps: false,
  }
);
