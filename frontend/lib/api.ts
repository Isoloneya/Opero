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
import type {
  CreateStockMovementPayload,
  InventoryBalance,
  ProductListItem,
  ProductsPage,
  StockMovement,
} from "@/types/inventory";

import type {
  CreateRequestPayload,
  RequestData,
  RequestDecisionPayload,
  RequestsPage,
} from "@/types/request";

import type {
  CreateTaskPayload,
  TaskData,
  TasksPage,
  UpdateTaskStatusPayload,
} from "@/types/task";

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

export async function getProducts(token: string): Promise<ProductsPage> {
  const response = await fetch(`${apiUrl}/products?page=1&page_size=100`, {
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

export async function getInventoryBalances(
  token: string,
  warehouseId: number,
): Promise<InventoryBalance[]> {
  const response = await fetch(
    `${apiUrl}/inventory-balances?warehouse_id=${warehouseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати залишки");
  }

  return response.json() as Promise<InventoryBalance[]>;
}

export async function createStockMovement(
  token: string,
  payload: CreateStockMovementPayload,
): Promise<StockMovement> {
  const response = await fetch(`${apiUrl}/stock-movements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося створити рух товару");
  }

  return response.json() as Promise<StockMovement>;
}

export async function getRequests(token: string): Promise<RequestsPage> {
  const response = await fetch(`${apiUrl}/requests?page=1&page_size=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати список заявок");
  }

  return response.json() as Promise<RequestsPage>;
}

export async function createRequest(
  token: string,
  payload: CreateRequestPayload,
): Promise<RequestData> {
  const response = await fetch(`${apiUrl}/requests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося створити заявку");
  }

  return response.json() as Promise<RequestData>;
}

export async function decideRequest(
  token: string,
  requestId: number,
  payload: RequestDecisionPayload,
): Promise<RequestData> {
  const response = await fetch(`${apiUrl}/requests/${requestId}/decision`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося оновити заявку");
  }

  return response.json() as Promise<RequestData>;
}

export async function completeRequest(
  token: string,
  requestId: number,
): Promise<RequestData> {
  const response = await fetch(`${apiUrl}/requests/${requestId}/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося виконати заявку");
  }

  return response.json() as Promise<RequestData>;
}

export async function getTasks(token: string): Promise<TasksPage> {
  const response = await fetch(`${apiUrl}/tasks?page=1&page_size=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося отримати список задач");
  }

  return response.json() as Promise<TasksPage>;
}

export async function createTask(
  token: string,
  payload: CreateTaskPayload,
): Promise<TaskData> {
  const response = await fetch(`${apiUrl}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося створити задачу");
  }

  return response.json() as Promise<TaskData>;
}

export async function updateTaskStatus(
  token: string,
  taskId: number,
  payload: UpdateTaskStatusPayload,
): Promise<TaskData> {
  const response = await fetch(`${apiUrl}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.detail ?? "Не вдалося оновити статус задачі");
  }

  return response.json() as Promise<TaskData>;
}