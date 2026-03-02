export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

export enum TasksStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TasksPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum NotificationType {
  TEAM_INVITE = 'team_invite',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

export enum TimeFrame {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  OVERDUE = 'overdue',
}
