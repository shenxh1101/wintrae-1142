export type UserRole = 'student' | 'club_admin' | 'admin';
export type ActivityStatus = 'pending' | 'approved' | 'rejected' | 'ongoing' | 'finished';
export type RegistrationStatus = 'registered' | 'checked_in' | 'absent' | 'leave_approved';
export type MemberRole = 'member' | 'admin';
export type MemberStatus = 'active' | 'pending' | 'removed';
export type PointType = 'earn' | 'spend';
export type FormFieldType = 'text' | 'number' | 'select' | 'textarea';

export interface User {
  id: number;
  name: string;
  studentId: string;
  phone?: string;
  avatar: string;
  role: UserRole;
  points: number;
  createdAt: string;
}

export interface Club {
  id: number;
  name: string;
  logo: string;
  description: string;
  adminId: number;
  memberCount: number;
  followerCount: number;
  isFollowed: boolean;
  createdAt: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Activity {
  id: number;
  title: string;
  coverImage: string;
  description: string;
  clubId: number;
  clubName: string;
  clubLogo: string;
  startTime: string;
  endTime?: string;
  location: string;
  quota: number;
  signedCount: number;
  status: ActivityStatus;
  registrationDeadline: string;
  isRegistered: boolean;
  isCollected: boolean;
  category: string;
  tags: string[];
  formFields: FormField[];
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  activityId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Photo {
  id: number;
  activityId: number;
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface ActivityDetail extends Activity {
  reviews: Review[];
  photos: Photo[];
  statistics: {
    averageRating: number;
    totalReviews: number;
    checkinRate: number;
  };
}

export interface Registration {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  activityId: number;
  formData: Record<string, string>;
  status: RegistrationStatus;
  checkinTime?: string;
  createdAt: string;
}

export interface Waitlist {
  id: number;
  userId: number;
  userName: string;
  activityId: number;
  position: number;
  createdAt: string;
}

export interface Member {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  clubId: number;
  role: MemberRole;
  points: number;
  status: MemberStatus;
  joinedAt: string;
}

export interface PointRecord {
  id: number;
  userId: number;
  activityId?: number;
  clubId?: number;
  points: number;
  type: PointType;
  description: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  userName: string;
  activityId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Checkin {
  id: number;
  userId: number;
  activityId: number;
  qrCode: string;
  checkinTime: string;
  status: 'success' | 'failed';
}

export interface Notification {
  id: number;
  userId: number;
  type: 'activity_reminder' | 'registration_confirm' | 'waitlist_notify' | 'leave_result';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityStatistics {
  date: string;
  registrations: number;
  checkins: number;
}
