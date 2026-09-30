export type RequestType = "issue" | "purchase";

export type RequestStatus = "pending" | "approved" | "rejected" | "completed";

export type RequestItem = {
  id: number;
  product_id: number;
  quantity: string;
};

export type RequestData = {
  id: number;
  request_number: string;
  type: RequestType;
  status: RequestStatus;
  warehouse_id: number;
  requested_by: number;
  decided_by: number | null;
  reason: string;
  decision_comment: string | null;
  decided_at: string | null;
  created_at: string;
  items: RequestItem[];
};

export type RequestsPage = {
  items: RequestData[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateRequestPayload = {
  type: RequestType;
  warehouse_id: number;
  reason: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
};

export type RequestDecisionPayload = {
  status: "approved" | "rejected";
  decision_comment?: string;
};