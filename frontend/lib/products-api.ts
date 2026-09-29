import type { ApiError } from "@/types/auth";

export type Product = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  minimum_stock: string;
  is_active: boolean;
  created_at: string;
};

export type ProductsPage = {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateProductPayload = {
  sku: string;
  name: string;
  unit: string;
  minimum_stock: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function getProducts(
  token: string,
  search: string,
): Promise<ProductsPage> {
  const query = new URLSearchParams({
    page: "1",
    page_size: "20",
  });

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const response = await fetch(`${apiUrl}/products?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати список товарів");
  }

  return response.json() as Promise<ProductsPage>;
}

export async function createProduct(
  token: string,
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await fetch(`${apiUrl}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося створити товар");
  }

  return response.json() as Promise<Product>;
}