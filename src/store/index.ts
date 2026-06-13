import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Activity, Club, Registration, Notification, LeaveRequest, Waitlist, Review } from '../types';
import { mockUsers, defaultUser } from '../data/users';
import { mockActivities } from '../data/activities';
import { mockClubs } from '../data/clubs';
import { mockRegistrations, mockWaitlists, mockReviews } from '../data/registrations';

interface AppState {
  user: User | null;
  activities: Activity[];
  clubs: Club[];
  registrations: Registration[];
  collectedActivities: number[];
  followedClubs: number[];
  notifications: Notification[];
  leaveRequests: LeaveRequest[];
  waitlists: Waitlist[];
  reviews: Review[];

  setUser: (user: User | null) => void;
  login: (studentId: string) => boolean;
  logout: () => void;

  toggleCollectActivity: (activityId: number) => void;
  toggleFollowClub: (clubId: number) => void;

  registerActivity: (activityId: number, formData: Record<string, string>) => { success: boolean; message: string; position?: number };
  cancelRegistration: (activityId: number) => void;

  checkin: (activityId: number, userId: number) => { success: boolean; message: string };

  submitLeaveRequest: (activityId: number, reason: string) => void;
  approveLeaveRequest: (leaveRequestId: number) => { promoted?: boolean; promotedUser?: string };
  rejectLeaveRequest: (leaveRequestId: number) => void;

  getWaitlistsByActivity: (activityId: number) => Waitlist[];
  addToWaitlist: (activityId: number, userId: number) => number;

  addReview: (activityId: number, rating: number, comment: string) => void;
  getReviewsByActivity: (activityId: number) => Review[];
  hasUserReviewedActivity: (activityId: number) => boolean;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: number) => void;

  getUserRegistrations: () => Registration[];
  getActivityRegistrations: (activityId: number) => Registration[];
  getClubActivities: (clubId: number) => Activity[];
  getUserLeaveRequests: () => LeaveRequest[];
  getUserWaitlistEntry: (activityId: number) => Waitlist | undefined;
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
      leaveRequests: [],
      waitlists: [],
      reviews: mockReviews,

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
        const { user, registrations, activities, notifications } = get();
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
          const position = get().addToWaitlist(activityId, user.id);
          set({
            notifications: [
              {
                id: Date.now(),
                userId: user.id,
                type: 'waitlist_notify',
                title: '已加入候补队列',
                message: `您已加入"${activity.title}"的候补队列,当前排位: 第${position}位`,
                isRead: false,
                createdAt: new Date().toISOString(),
              },
              ...notifications,
            ],
          });
          return { success: false, message: `已加入候补队列,当前排位: 第${position}位`, position };
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
          notifications: [
            {
              id: Date.now(),
              userId: user.id,
              type: 'registration_confirm',
              title: '报名成功',
              message: `您已成功报名"${activity.title}"`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...notifications,
          ],
        });

        return { success: true, message: '报名成功!' };
      },

      cancelRegistration: (activityId) => {
        const { user, registrations, activities, waitlists, notifications } = get();
        if (!user) return;

        const activity = activities.find(a => a.id === activityId);
        const activityWaitlists = waitlists
          .filter(w => w.activityId === activityId)
          .sort((a, b) => a.position - b.position);
        const firstWaitlist = activityWaitlists[0];

        if (firstWaitlist) {
          const promotedUser = mockUsers.find(u => u.id === firstWaitlist.userId);

          const updatedWaitlists = waitlists
            .filter(w => !(w.activityId === activityId && w.id === firstWaitlist.id))
            .map(w => {
              if (w.activityId !== activityId) return w;
              return {
                ...w,
                position: w.position - 1,
              };
            });

          const newRegistration: Registration = {
            id: Date.now(),
            userId: firstWaitlist.userId,
            userName: firstWaitlist.userName,
            userAvatar: promotedUser?.avatar || '',
            activityId,
            formData: {},
            status: 'registered',
            createdAt: new Date().toISOString(),
          };

          set({
            registrations: [
              ...registrations.filter(r => !(r.activityId === activityId && r.userId === user.id)),
              newRegistration,
            ],
            activities: activities.map(a =>
              a.id === activityId
                ? { ...a, isRegistered: true }
                : a
            ),
            waitlists: updatedWaitlists,
            notifications: [
              {
                id: Date.now(),
                userId: firstWaitlist.userId,
                type: 'waitlist_notify',
                title: '候补转正通知',
                message: `恭喜!您在"${activity?.title}"的候补队列中已成功转正,请注意查看。`,
                isRead: false,
                createdAt: new Date().toISOString(),
              },
              ...notifications,
            ],
          });

          return;
        }

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
        const { registrations } = get();
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
        const { user, leaveRequests, notifications, activities } = get();
        if (!user) return;

        const existingRequest = leaveRequests.find(
          lr => lr.activityId === activityId && lr.userId === user.id
        );
        if (existingRequest) {
          return;
        }

        const activity = activities.find(a => a.id === activityId);
        const newLeaveRequest: LeaveRequest = {
          id: Date.now(),
          userId: user.id,
          userName: user.name,
          activityId,
          reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set({
          leaveRequests: [...leaveRequests, newLeaveRequest],
          notifications: [
            {
              id: Date.now(),
              userId: user.id,
              type: 'leave_result',
              title: '请假申请已提交',
              message: `您已提交"${activity?.title}"的请假申请,请等待管理员审核`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...notifications,
          ],
        });
      },

      approveLeaveRequest: (leaveRequestId) => {
        const { leaveRequests, registrations, activities, waitlists, notifications } = get();
        const leaveRequest = leaveRequests.find(lr => lr.id === leaveRequestId);
        if (!leaveRequest) return {};

        const activity = activities.find(a => a.id === leaveRequest.activityId);
        const registration = registrations.find(
          r => r.activityId === leaveRequest.activityId && r.userId === leaveRequest.userId
        );

        const activityWaitlists = waitlists
          .filter(w => w.activityId === leaveRequest.activityId)
          .sort((a, b) => a.position - b.position);
        const firstWaitlist = activityWaitlists[0];

        const newNotifications: Notification[] = [
          {
            id: Date.now(),
            userId: leaveRequest.userId,
            type: 'leave_result',
            title: '请假申请已通过',
            message: `您的请假申请已通过,已从活动报名名单中移除`,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...notifications,
        ];

        if (firstWaitlist) {
          const promotedUser = mockUsers.find(u => u.id === firstWaitlist.userId);
          const updatedWaitlists = waitlists
            .filter(w => !(w.activityId === leaveRequest.activityId && w.id === firstWaitlist.id))
            .map(w => {
              if (w.activityId !== leaveRequest.activityId) return w;
              return {
                ...w,
                position: w.position - 1,
              };
            });

          const newRegistration: Registration = {
            id: Date.now(),
            userId: firstWaitlist.userId,
            userName: firstWaitlist.userName,
            userAvatar: promotedUser?.avatar || '',
            activityId: leaveRequest.activityId,
            formData: {},
            status: 'registered',
            createdAt: new Date().toISOString(),
          };

          set({
            leaveRequests: leaveRequests.map(lr =>
              lr.id === leaveRequestId ? { ...lr, status: 'approved' } : lr
            ),
            registrations: [
              ...registrations.filter(r => r.id !== registration?.id),
              newRegistration,
            ],
            activities: activities.map(a =>
              a.id === leaveRequest.activityId
                ? { ...a }
                : a
            ),
            waitlists: updatedWaitlists,
            notifications: [
              {
                id: Date.now() + 1,
                userId: firstWaitlist.userId,
                type: 'waitlist_notify',
                title: '候补转正通知',
                message: `恭喜!您在"${activity?.title}"的候补队列中已成功转正,请注意查看。`,
                isRead: false,
                createdAt: new Date().toISOString(),
              },
              ...newNotifications,
            ],
          });

          return { promoted: true, promotedUser: firstWaitlist.userName };
        }

        set({
          leaveRequests: leaveRequests.map(lr =>
            lr.id === leaveRequestId ? { ...lr, status: 'approved' } : lr
          ),
          registrations: registrations.map(r =>
            r.id === registration?.id ? { ...r, status: 'leave_approved' } : r
          ),
          activities: activities.map(a =>
            a.id === leaveRequest.activityId
              ? { ...a, signedCount: Math.max(0, a.signedCount - 1) }
              : a
          ),
          notifications: newNotifications,
        });

        return {};
      },

      rejectLeaveRequest: (leaveRequestId) => {
        const { leaveRequests, notifications } = get();
        const leaveRequest = leaveRequests.find(lr => lr.id === leaveRequestId);
        if (!leaveRequest) return;

        set({
          leaveRequests: leaveRequests.map(lr =>
            lr.id === leaveRequestId ? { ...lr, status: 'rejected' } : lr
          ),
          notifications: [
            {
              id: Date.now(),
              userId: leaveRequest.userId,
              type: 'leave_result',
              title: '请假申请被拒绝',
              message: `您的请假申请被拒绝,请联系管理员了解详情`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...notifications,
          ],
        });
      },

      getWaitlistsByActivity: (activityId) => {
        return get().waitlists
          .filter(w => w.activityId === activityId)
          .sort((a, b) => a.position - b.position);
      },

      addToWaitlist: (activityId, userId) => {
        const { waitlists, user } = get();
        const userData = mockUsers.find(u => u.id === userId);
        const existingWaitlist = waitlists.find(
          w => w.activityId === activityId && w.userId === userId
        );
        if (existingWaitlist) {
          return existingWaitlist.position;
        }

        const activityWaitlists = waitlists.filter(w => w.activityId === activityId);
        const position = activityWaitlists.length + 1;

        const newWaitlist: Waitlist = {
          id: Date.now(),
          userId,
          userName: userData?.name || '未知用户',
          activityId,
          position,
          createdAt: new Date().toISOString(),
        };

        set({ waitlists: [...waitlists, newWaitlist] });
        return position;
      },

      addReview: (activityId, rating, comment) => {
        const { user, reviews, notifications, activities } = get();
        if (!user) return;

        const existingReview = reviews.find(
          r => r.activityId === activityId && r.userId === user.id
        );
        if (existingReview) {
          set({
            reviews: reviews.map(r =>
              r.id === existingReview.id
                ? { ...r, rating, comment, createdAt: new Date().toISOString() }
                : r
            ),
          });
          return;
        }

        const activity = activities.find(a => a.id === activityId);
        const newReview: Review = {
          id: Date.now(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          activityId,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        };

        set({
          reviews: [newReview, ...reviews],
          notifications: [
            {
              id: Date.now(),
              userId: user.id,
              type: 'registration_confirm',
              title: '评价已提交',
              message: `感谢您对"${activity?.title}"的评价`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...notifications,
          ],
        });
      },

      getReviewsByActivity: (activityId) => {
        return get().reviews
          .filter(r => r.activityId === activityId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      hasUserReviewedActivity: (activityId) => {
        const { user, reviews } = get();
        if (!user) return false;
        return reviews.some(r => r.activityId === activityId && r.userId === user.id);
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

      getUserLeaveRequests: () => {
        const { user, leaveRequests } = get();
        if (!user) return [];
        return leaveRequests.filter(lr => lr.userId === user.id);
      },

      getUserWaitlistEntry: (activityId) => {
        const { user, waitlists } = get();
        if (!user) return undefined;
        return waitlists.find(w => w.activityId === activityId && w.userId === user.id);
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
        leaveRequests: state.leaveRequests,
        waitlists: state.waitlists,
        reviews: state.reviews,
      }),
    }
  )
);
