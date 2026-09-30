export type AuditLogData = {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string | null;
  created_at: string;
};

export type AuditLogsPage = {
  items: AuditLogData[];
  total: number;
  page: number;
  page_size: number;
};