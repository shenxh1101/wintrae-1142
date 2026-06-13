import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: '张三',
    studentId: '2021001001',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
    role: 'student',
    points: 850,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 2,
    name: '李四',
    studentId: '2021001002',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiSi',
    role: 'student',
    points: 1200,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 3,
    name: '王五',
    studentId: '2021001003',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangWu',
    role: 'club_admin',
    points: 2100,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 4,
    name: '赵六',
    studentId: '2021001004',
    phone: '13800138004',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoLiu',
    role: 'admin',
    points: 3500,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 5,
    name: '孙七',
    studentId: '2021001005',
    phone: '13800138005',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunQi',
    role: 'student',
    points: 680,
    createdAt: '2024-09-02T08:00:00Z',
  },
  {
    id: 6,
    name: '周八',
    studentId: '2021001006',
    phone: '13800138006',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouBa',
    role: 'club_admin',
    points: 1750,
    createdAt: '2024-09-02T08:00:00Z',
  },
];

export const defaultUser = mockUsers[0];

export function getUserById(id: number): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getUserByStudentId(studentId: string): User | undefined {
  return mockUsers.find(user => user.studentId === studentId);
}
