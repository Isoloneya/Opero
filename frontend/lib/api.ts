import type {
  ApiError,
  AuthSession,
  CreateUserPayload,
  CurrentUser,
  UserListItem,
  UsersPage,
  WarehousesPage,
  CreateWarehousePayload,
  Warehouse,
} from "@/types/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося виконати вхід");
  }

  return response.json() as Promise<AuthSession>;
}

export async function getCurrentUser(token: string): Promise<CurrentUser> {
  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати дані користувача");
  }

  return response.json() as Promise<CurrentUser>;
}

export async function getUsers(token: string): Promise<UsersPage> {
  const response = await fetch(`${apiUrl}/users?page=1&page_size=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати список користувачів");
  }

  return response.json() as Promise<UsersPage>;
}

export async function createUser(
  token: string,
  payload: CreateUserPayload,
): Promise<UserListItem> {
  const response = await fetch(`${apiUrl}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося створити користувача");
  }

  return response.json() as Promise<UserListItem>;
}
export async function updateUserStatus(
  token: string,
  userId: number,
  isActive: boolean,
): Promise<UserListItem> {
  const response = await fetch(`${apiUrl}/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_active: isActive,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося оновити користувача");
  }

  return response.json() as Promise<UserListItem>;
}

export async function getWarehouses(token: string): Promise<WarehousesPage> {
  const response = await fetch(`${apiUrl}/warehouses?page=1&page_size=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати список складів");
  }

  return response.json() as Promise<WarehousesPage>;
}
export async function createWarehouse(
  token: string,
  payload: CreateWarehousePayload,
): Promise<Warehouse> {
  const response = await fetch(`${apiUrl}/warehouses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося створити склад");
  }

  return response.json() as Promise<Warehouse>;
}