import { Registration, Waitlist, Review, Photo, LeaveRequest, PointRecord } from '../types';

export const mockRegistrations: Registration[] = [
  {
    id: 1,
    userId: 1,
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
    activityId: 2,
    formData: {
      '1': '张三',
      '2': '2021001001',
      '3': '13800138001',
    },
    status: 'registered',
    createdAt: '2026-06-13T10:00:00Z',
  },
  {
    id: 2,
    userId: 2,
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiSi',
    activityId: 2,
    formData: {
      '1': '李四',
      '2': '2021001002',
      '3': '13800138002',
    },
    status: 'checked_in',
    checkinTime: '2026-06-22T08:15:00Z',
    createdAt: '2026-06-13T11:00:00Z',
  },
  {
    id: 3,
    userId: 5,
    userName: '孙七',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunQi',
    activityId: 2,
    formData: {
      '1': '孙七',
      '2': '2021001005',
      '3': '13800138005',
    },
    status: 'registered',
    createdAt: '2026-06-13T12:00:00Z',
  },
  {
    id: 4,
    userId: 1,
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
    activityId: 6,
    formData: {
      '1': '张三',
      '2': '2021001001',
      '3': '已阅读',
    },
    status: 'registered',
    createdAt: '2026-06-14T09:00:00Z',
  },
  {
    id: 5,
    userId: 1,
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
    activityId: 10,
    formData: {
      '1': '张三',
      '2': '2021001001',
      '3': '是',
      '4': '歌曲',
    },
    status: 'registered',
    createdAt: '2026-06-14T14:00:00Z',
  },
];

export const mockWaitlists: Waitlist[] = [
  {
    id: 1,
    userId: 3,
    userName: '王五',
    activityId: 9,
    position: 1,
    createdAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 2,
    userId: 4,
    userName: '赵六',
    activityId: 9,
    position: 2,
    createdAt: '2026-06-14T10:30:00Z',
  },
];

export const mockReviews: Review[] = [
  {
    id: 1,
    userId: 2,
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiSi',
    activityId: 1,
    rating: 5,
    comment: '非常棒的培训!讲师讲得很清楚,学到了很多实战技能。感谢科技创新协会组织的这次活动!',
    createdAt: '2026-06-12T20:00:00Z',
  },
  {
    id: 2,
    userId: 5,
    userName: '孙七',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunQi',
    activityId: 1,
    rating: 4,
    comment: '课程内容很实用,适合入门学习。不过节奏有点快,希望下次能给更多练习时间。',
    createdAt: '2026-06-12T21:00:00Z',
  },
  {
    id: 3,
    userId: 3,
    userName: '王五',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangWu',
    activityId: 1,
    rating: 5,
    comment: '强烈推荐!作为已经有基础的参与者,这次培训让我对React有了更深的理解。',
    createdAt: '2026-06-13T10:00:00Z',
  },
];

export const mockPhotos: Photo[] = [
  {
    id: 1,
    activityId: 1,
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    caption: '培训现场座无虚席',
    uploadedAt: '2026-06-12T18:00:00Z',
  },
  {
    id: 2,
    activityId: 1,
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    caption: '认真听讲的同学们',
    uploadedAt: '2026-06-12T18:00:00Z',
  },
  {
    id: 3,
    activityId: 1,
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    caption: '小组讨论环节',
    uploadedAt: '2026-06-12T18:00:00Z',
  },
  {
    id: 4,
    activityId: 1,
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    caption: '讲师演示代码',
    uploadedAt: '2026-06-12T18:00:00Z',
  },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    userId: 1,
    userName: '张三',
    activityId: 2,
    reason: '临时有课,无法参加当天的志愿活动,非常抱歉。',
    status: 'pending',
    createdAt: '2026-06-20T15:00:00Z',
  },
];

export const mockPointRecords: PointRecord[] = [
  {
    id: 1,
    userId: 1,
    activityId: 1,
    points: 100,
    type: 'earn',
    description: '参加Web开发实战训练营',
    createdAt: '2026-06-12T18:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    activityId: 2,
    points: 80,
    type: 'earn',
    description: '参加社区环境清洁志愿活动',
    createdAt: '2026-06-22T12:00:00Z',
  },
  {
    id: 3,
    userId: 1,
    points: 50,
    type: 'spend',
    description: '兑换纪念品',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 4,
    userId: 1,
    activityId: 6,
    points: 60,
    type: 'earn',
    description: '参加《百年孤独》读书分享会',
    createdAt: '2026-06-18T21:00:00Z',
  },
];

export function getRegistrationsByActivityId(activityId: number): Registration[] {
  return mockRegistrations.filter(reg => reg.activityId === activityId);
}

export function getRegistrationsByUserId(userId: number): Registration[] {
  return mockRegistrations.filter(reg => reg.userId === userId);
}

export function getWaitlistsByActivityId(activityId: number): Waitlist[] {
  return mockWaitlists.filter(w => w.activityId === activityId);
}

export function getReviewsByActivityId(activityId: number): Review[] {
  return mockReviews.filter(r => r.activityId === activityId);
}

export function getPhotosByActivityId(activityId: number): Photo[] {
  return mockPhotos.filter(p => p.activityId === activityId);
}

export function getPointRecordsByUserId(userId: number): PointRecord[] {
  return mockPointRecords.filter(p => p.userId === userId);
}
