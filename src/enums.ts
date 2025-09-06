// enums.ts
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum NotificationType {
  ASSIGNMENT = 'assignment',
  DUE_DATE = 'due_date',
  STATUS_CHANGE = 'status_change',
}
