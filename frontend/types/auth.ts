export type AuthSession = {
  access_token: string;
  token_type: string;
};

export type CurrentUser = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "manager" | "warehouse_keeper" | "employee";
  is_active: boolean;
  created_at: string;
};

export type ApiError = {
  detail?: string;
};
export type UserListItem = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "manager" | "warehouse_keeper" | "employee";
  is_active: boolean;
};

export type UsersPage = {
  items: UserListItem[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "warehouse_keeper" | "employee";
};

export type Warehouse = {
  id: number;
  name: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
};

export type WarehousesPage = {
  items: Warehouse[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateWarehousePayload = {
  name: string;
  location: string;
};

