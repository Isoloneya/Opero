export type InventoryBalance = {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: string;
  updated_at: string;
};

export type ProductListItem = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  minimum_stock: string;
  is_active: boolean;
};

export type ProductsPage = {
  items: ProductListItem[];
  total: number;
  page: number;
  page_size: number;
};