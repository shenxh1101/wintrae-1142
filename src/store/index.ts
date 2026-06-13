import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Activity, Club, Registration, Notification } from '../types';
import { mockUsers, defaultUser } from '../data/users';
import { mockActivities } from '../data/activities';
import { mockClubs } from '../data/clubs';
import { mockRegistrations } from '../data/registrations';

interface AppState {
  user: User | null;
  activities: Activity[];
  clubs: Club[];
  registrations: Registration[];
  collectedActivities: number[];
  followedClubs: number[];
  notifications: Notification[];

  setUser: (user: User | null) => void;
  login: (studentId: string) => boolean;
  logout: () => void;

  toggleCollectActivity: (activityId: number) => void;
  toggleFollowClub: (clubId: number) => void;

  registerActivity: (activityId: number, formData: Record<string, string>) => { success: boolean; message: string; position?: number };
  cancelRegistration: (activityId: number) => void;

  checkin: (activityId: number, userId: number) => { success: boolean; message: string };

  submitLeaveRequest: (activityId: number, reason: string) => void;
  approveLeaveRequest: (registrationId: number) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: number) => void;

  getUserRegistrations: () => Registration[];
  getActivityRegistrations: (activityId: number) => Registration[];
  getClubActivities: (clubId: number) => Activity[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      activities: mockActivities,
      clubs: mockClubs,
      registrations: mockRegistrations,
      collectedActivities: [1, 2],
      followedClubs: [1, 3],
      notifications: [
        {
          id: 1,
          userId: 1,
          type: 'activity_reminder',
          title: '活动提醒',
          message: '您报名的"社区环境清洁志愿活动"将在明天开始',
          isRead: false,
          createdAt: '2026-06-21T10:00:00Z',
        },
        {
          id: 2,
          userId: 1,
          type: 'registration_confirm',
          title: '报名成功',
          message: '您已成功报名"社区环境清洁志愿活动"',
          isRead: true,
          createdAt: '2026-06-13T10:00:00Z',
        },
      ],

      setUser: (user) => set({ user }),

      login: (studentId) => {
        const user = mockUsers.find(u => u.studentId === studentId);
        if (user) {
          set({ user });
          return true;
        }
        return false;
      },

      logout: () => set({ user: null }),

      toggleCollectActivity: (activityId) => {
        const { collectedActivities } = get();
        const index = collectedActivities.indexOf(activityId);
        if (index > -1) {
          set({ collectedActivities: collectedActivities.filter(id => id !== activityId) });
        } else {
          set({ collectedActivities: [...collectedActivities, activityId] });
        }
      },

      toggleFollowClub: (clubId) => {
        const { followedClubs } = get();
        const index = followedClubs.indexOf(clubId);
        if (index > -1) {
          set({ followedClubs: followedClubs.filter(id => id !== clubId) });
        } else {
          set({ followedClubs: [...followedClubs, clubId] });
        }
      },

      registerActivity: (activityId, formData) => {
        const { user, registrations, activities } = get();
        if (!user) {
          return { success: false, message: '请先登录' };
        }

        const existingRegistration = registrations.find(
          r => r.activityId === activityId && r.userId === user.id
        );
        if (existingRegistration) {
          return { success: false, message: '您已经报过名了' };
        }

        const activity = activities.find(a => a.id === activityId);
        if (!activity) {
          return { success: false, message: '活动不存在' };
        }

        if (activity.signedCount >= activity.quota) {
          return { success: false, message: '名额已满,已加入候补队列', position: 3 };
        }

        const newRegistration: Registration = {
          id: Date.now(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          activityId,
          formData,
          status: 'registered',
          createdAt: new Date().toISOString(),
        };

        set({
          registrations: [...registrations, newRegistration],
          activities: activities.map(a =>
            a.id === activityId
              ? { ...a, signedCount: a.signedCount + 1, isRegistered: true }
              : a
          ),
        });

        return { success: true, message: '报名成功!' };
      },

      cancelRegistration: (activityId) => {
        const { user, registrations, activities } = get();
        if (!user) return;

        set({
          registrations: registrations.filter(
            r => !(r.activityId === activityId && r.userId === user.id)
          ),
          activities: activities.map(a =>
            a.id === activityId
              ? { ...a, signedCount: Math.max(0, a.signedCount - 1), isRegistered: false }
              : a
          ),
        });
      },

      checkin: (activityId, userId) => {
        const { registrations, activities } = get();
        const registration = registrations.find(
          r => r.activityId === activityId && r.userId === userId
        );

        if (!registration) {
          return { success: false, message: '未找到报名记录' };
        }

        if (registration.status === 'checked_in') {
          return { success: false, message: '已经签到过了' };
        }

        set({
          registrations: registrations.map(r =>
            r.id === registration.id
              ? { ...r, status: 'checked_in', checkinTime: new Date().toISOString() }
              : r
          ),
        });

        return { success: true, message: '签到成功!' };
      },

      submitLeaveRequest: (activityId, reason) => {
        const { user, notifications } = get();
        if (!user) return;

        const newNotification: Notification = {
          id: Date.now(),
          userId: user.id,
          type: 'leave_result',
          title: '请假申请已提交',
          message: `您已提交请假申请,原因: ${reason}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set({ notifications: [...notifications, newNotification] });
      },

      approveLeaveRequest: (registrationId) => {
        const { registrations } = get();
        set({
          registrations: registrations.map(r =>
            r.id === registrationId
              ? { ...r, status: 'leave_approved' }
              : r
          ),
        });
      },

      addNotification: (notification) => {
        const { notifications } = get();
        const newNotification: Notification = {
          ...notification,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        set({ notifications: [newNotification, ...notifications] });
      },

      markNotificationRead: (notificationId) => {
        const { notifications } = get();
        set({
          notifications: notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        });
      },

      getUserRegistrations: () => {
        const { user, registrations } = get();
        if (!user) return [];
        return registrations.filter(r => r.userId === user.id);
      },

      getActivityRegistrations: (activityId) => {
        const { registrations } = get();
        return registrations.filter(r => r.activityId === activityId);
      },

      getClubActivities: (clubId) => {
        const { activities } = get();
        return activities.filter(a => a.clubId === clubId);
      },
    }),
    {
      name: 'campus-activities-storage',
      partialize: (state) => ({
        user: state.user,
        collectedActivities: state.collectedActivities,
        followedClubs: state.followedClubs,
        registrations: state.registrations,
        activities: state.activities,
        clubs: state.clubs,
        notifications: state.notifications,
      }),
    }
  )
);
