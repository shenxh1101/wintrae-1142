import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock, QrCode, Heart, Star, Camera, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Badge, Loading } from '../components';
import { useStore } from '../store';
import { getPhotosByActivityId } from '../data/registrations';
import { FormField } from '../types';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    activities,
    user,
    registerActivity,
    cancelRegistration,
    toggleCollectActivity,
    collectedActivities,
    registrations,
    submitLeaveRequest,
    addReview,
    getReviewsByActivity,
  } = useStore();

  const [showQRModal, setShowQRModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [leaveReason, setLeaveReason] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const activity = activities.find(a => a.id === Number(id));
  const reviews = getReviewsByActivity(Number(id));
  const photos = getPhotosByActivityId(Number(id));
  const isCollected = collectedActivities.includes(Number(id));
  const userRegistration = user
    ? registrations.find(r => r.activityId === Number(id) && r.userId === user.id)
    : null;

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="加载中..." />
      </div>
    );
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    activity.formFields.forEach(field => {
      if (field.required && !formData[field.id]?.trim()) {
        errors[field.id] = `请填写${field.label}`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = registerActivity(activity.id, formData);
    setIsSubmitting(false);
    setShowRegisterModal(false);
    alert(result.message);
    if (result.success) {
      setFormData({});
      setFormErrors({});
      navigate(0);
    }
  };

  const handleCancelRegistration = () => {
    if (confirm('确定要取消报名吗?')) {
      cancelRegistration(activity.id);
      navigate(0);
    }
  };

  const handleLeave = async () => {
    if (!leaveReason.trim()) {
      alert('请填写请假原因');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    submitLeaveRequest(activity.id, leaveReason);
    setIsSubmitting(false);
    setShowLeaveModal(false);
    setLeaveReason('');
    alert('请假申请已提交,请等待管理员审核');
    navigate(0);
  };

  const handleReview = async () => {
    if (!reviewComment.trim()) {
      alert('请填写评价内容');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    addReview(activity.id, reviewRating, reviewComment);
    setIsSubmitting(false);
    setShowReviewModal(false);
    setReviewComment('');
    setReviewRating(5);
    alert('评价提交成功');
    navigate(0);
  };

  const renderFormField = (field: FormField) => {
    const handleChange = (value: string) => {
      setFormData({ ...formData, [field.id]: value });
      if (formErrors[field.id]) {
        setFormErrors({ ...formErrors, [field.id]: '' });
      }
    };

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors[field.id] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors[field.id] && (
              <p className="mt-1 text-sm text-red-500">{formErrors[field.id]}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors[field.id] ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">请选择</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {formErrors[field.id] && (
              <p className="mt-1 text-sm text-red-500">{formErrors[field.id]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors[field.id] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors[field.id] && (
              <p className="mt-1 text-sm text-red-500">{formErrors[field.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${activity.coverImage})`,
        }}
      >
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="category">{activity.category}</Badge>
                {activity.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/20 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold mb-4">{activity.title}</h1>
              <div className="flex items-center space-x-4 text-lg">
                <Link to={`/club/${activity.clubId}`} className="flex items-center space-x-2 hover:underline">
                  <img src={activity.clubLogo} alt={activity.clubName} className="w-8 h-8 rounded-full" />
                  <span>{activity.clubName}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">活动详情</h2>
              <div className="prose max-w-none">
                {activity.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Camera className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">照片回顾</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <p className="text-white text-sm text-center px-2">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(reviews.length > 0 || activity.status === 'finished') && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">活动评价</h2>
                    {reviews.length > 0 && (
                      <span className="ml-3 text-sm text-gray-500">({reviews.length}条评价)</span>
                    )}
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-yellow-500">
                        {reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length}/5
                      </span>
                    </div>
                  )}
                </div>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">暂无评价</p>
                    {user && (
                      <p className="text-sm text-blue-600">成为第一个评价者吧!</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-start mb-3">
                          <img 
                            src={review.userAvatar} 
                            alt={review.userName} 
                            className="w-10 h-10 rounded-full mr-3" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{review.userName}</p>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {format(parseISO(review.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activity.status === 'finished' && user && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Star className="w-5 h-5" />
                      <span>{reviews.some(r => r.userId === user.id) ? '修改我的评价' : '发表评价'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{format(parseISO(activity.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{activity.signedCount} / {activity.quota} 人已报名</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>报名截止: {format(parseISO(activity.registrationDeadline), 'MM月dd日 HH:mm', { locale: zhCN })}</span>
                </div>
              </div>

              <div className="space-y-3">
                {!user ? (
                  <Link
                    to="/login"
                    className="block w-full px-6 py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    登录后报名
                  </Link>
                ) : userRegistration ? (
                  <>
                    {userRegistration.status === 'checked_in' ? (
                      <div className="px-6 py-3 bg-green-100 text-green-800 text-center font-medium rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        已签到
                      </div>
                    ) : (
                      <>
                        <div className="px-6 py-3 bg-green-100 text-green-800 text-center font-medium rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          已报名
                        </div>
                        <button
                          onClick={() => setShowQRModal(true)}
                          className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                        >
                          <QrCode className="w-5 h-5 mr-2" />
                          查看签到二维码
                        </button>
                        <button
                          onClick={() => setShowLeaveModal(true)}
                          className="w-full px-6 py-3 border border-orange-600 text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          请假申请
                        </button>
                        <button
                          onClick={handleCancelRegistration}
                          className="w-full px-6 py-3 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          取消报名
                        </button>
                      </>
                    )}
                  </>
                ) : activity.signedCount >= activity.quota ? (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        const result = registerActivity(activity.id, {});
                        alert(result.message);
                        if (result.position) {
                          navigate(0);
                        }
                      }
                    }}
                    className="w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    名额已满,加入候补
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors animate-pulse"
                  >
                    立即报名
                  </button>
                )}

                <button
                  onClick={() => toggleCollectActivity(activity.id)}
                  className={`w-full px-6 py-3 border font-medium rounded-lg transition-colors flex items-center justify-center ${
                    isCollected
                      ? 'border-red-600 text-red-600 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isCollected ? 'fill-current' : ''}`} />
                  {isCollected ? '已收藏' : '收藏活动'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="签到二维码" size="sm">
        <div className="p-6 text-center">
          {user && (
            <>
              <p className="text-gray-600 mb-4">请出示此二维码进行签到</p>
              <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                <QRCodeSVG
                  value={`activity-${activity.id}-user-${user.id}`}
                  size={200}
                  level="H"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">{user.name} - {user.studentId}</p>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="报名参加活动" size="md">
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
            <p className="text-sm text-gray-600">
              {format(parseISO(activity.startTime), 'MM月dd日 HH:mm', { locale: zhCN })} · {activity.location}
            </p>
          </div>

          {activity.formFields.map(field => renderFormField(field))}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                setShowRegisterModal(false);
                setFormErrors({});
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleRegister}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '确认报名'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="请假申请" size="md">
        <div className="p-6">
          <p className="text-gray-600 mb-4">请填写请假原因:</p>
          <textarea
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            placeholder="请输入请假原因..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                setShowLeaveModal(false);
                setLeaveReason('');
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleLeave}
              disabled={!leaveReason.trim() || isSubmitting}
              className="flex-1 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '提交申请'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="活动评价" size="md">
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setReviewRating(rating)}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= reviewRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="分享您的参与体验..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowReviewModal(false);
                setReviewComment('');
                setReviewRating(5);
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReview}
              disabled={!reviewComment.trim() || isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '提交评价'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
