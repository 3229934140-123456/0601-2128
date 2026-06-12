import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Clock, AlertTriangle, 
  UserPlus, X, CheckCircle, Star, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useActivityStore } from '@/store/useActivityStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Companion } from '@/types';
import { formatDateTime } from '@/utils/date';
import { validateName, validateIdCard, calculateAge } from '@/utils/validation';
import { cn } from '@/lib/utils';

const categoryConfig: Record<string, { label: string; color: string }> = {
  lecture: { label: '讲座', color: 'info' },
  performance: { label: '演出', color: 'success' },
  'parent-child': { label: '亲子', color: 'warning' },
};

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, registerActivity, joinWaitlist, getReviewsByActivity, loadData } = useActivityStore();
  const { currentUser } = useAuthStore();
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const activity = activities.find(a => a.id === id);
  const reviews = activity ? getReviewsByActivity(activity.id) : [];
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newTicketId, setNewTicketId] = useState<string | null>(null);
  
  const [name, setName] = useState(currentUser?.name || '');
  const [idCard, setIdCard] = useState(currentUser?.idCard || '');
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!activity) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium text-gray-700 mb-2">活动不存在</h2>
        <Button onClick={() => navigate('/')}>返回活动列表</Button>
      </div>
    );
  }

  const category = categoryConfig[activity.category];
  const ticketPercentage = (activity.remainingCapacity / activity.totalCapacity) * 100;
  const isLowTicket = ticketPercentage <= 10 && ticketPercentage > 0;
  const isSoldOut = activity.remainingCapacity <= 0;

  const addCompanion = () => {
    if (companions.length >= 3) return;
    setCompanions([...companions, { name: '', idCard: '' }]);
  };

  const removeCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const updateCompanion = (index: number, field: keyof Companion, value: string) => {
    const updated = [...companions];
    updated[index] = { ...updated[index], [field]: value };
    setCompanions(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!validateName(name)) {
      newErrors.name = '请输入正确的姓名';
    }
    if (!validateIdCard(idCard)) {
      newErrors.idCard = '请输入正确的身份证号';
    }
    
    const age = calculateAge(idCard);
    if (age !== null && (age < activity.minAge || age > activity.maxAge)) {
      newErrors.idCard = `年龄不符合要求，该活动适合${activity.minAge}-${activity.maxAge}岁人群`;
    }
    
    companions.forEach((comp, i) => {
      if (!validateName(comp.name)) {
        newErrors[`companionName${i}`] = '请输入正确的姓名';
      }
      if (!validateIdCard(comp.idCard)) {
        newErrors[`companionIdCard${i}`] = '请输入正确的身份证号';
      }
      const compAge = calculateAge(comp.idCard);
      if (compAge !== null && (compAge < activity.minAge || compAge > activity.maxAge)) {
        newErrors[`companionIdCard${i}`] = `同行人年龄不符合要求`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    if (!validateForm()) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const result = await registerActivity(
        activity.id,
        currentUser.id,
        name,
        idCard,
        companions
      );
      
      if (result.success) {
        if (result.ticket) {
          setNewTicketId(result.ticket.id);
        }
        setShowRegisterModal(false);
        setShowSuccessModal(true);
      } else {
        setErrors({ submit: result.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlist = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const success = await joinWaitlist(activity.id, currentUser.id);
    if (success) {
      alert('已成功加入候补队列，有名额释放时会通知您');
    } else {
      alert('您已在候补队列中或活动还有余票');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={category.color as any}>{category.label}</Badge>
              {activity.notice && (
                <Badge variant="danger">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  有变更
                </Badge>
              )}
            </div>
            <h1 className="font-serif font-bold text-3xl mb-2">{activity.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateTime(activity.startTime)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                约 {Math.round((activity.endTime.getTime() - activity.startTime.getTime()) / 60000)} 分钟
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {activity.location}
              </div>
            </div>
          </div>
        </div>

        {activity.notice && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">活动变更通知</h4>
                <p className="text-yellow-700 text-sm">{activity.notice}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-serif font-semibold text-xl mb-4">活动介绍</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {activity.description}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif font-semibold text-xl">活动评价</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({reviews.length}条评价)</span>
                </div>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pt-4 border-t border-gray-100 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#165DFF] to-[#0E42D2] flex items-center justify-center text-white text-sm font-medium">
                            {review.userId.slice(-1)}
                          </div>
                          <span className="font-medium">匿名用户</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'w-4 h-4',
                                star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.content}</p>
                      <p className="text-gray-400 text-xs mt-1">{formatDateTime(review.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">暂无评价</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-gray-500 text-sm">剩余票数</span>
                  <span className={cn(
                    'font-serif font-bold text-2xl',
                    isSoldOut ? 'text-gray-400' : isLowTicket ? 'text-[#E34D59]' : 'text-[#165DFF]'
                  )}>
                    {isSoldOut ? '已满员' : activity.remainingCapacity}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isSoldOut ? 'bg-gray-400' : isLowTicket ? 'bg-[#E34D59] animate-pulse' : 'bg-[#165DFF]'
                    )}
                    style={{ width: `${100 - ticketPercentage}%` }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  总名额 {activity.totalCapacity} 人
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>年龄限制：{activity.minAge}-{activity.maxAge}岁</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span>活动开始前可取消报名</span>
                </div>
              </div>

              {!isSoldOut ? (
                <Button className="w-full" size="lg" onClick={() => setShowRegisterModal(true)}>
                  立即报名
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="outline"
                  onClick={handleWaitlist}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  加入候补队列
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          setStep(1);
          setErrors({});
        }}
        title="活动报名"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  step >= s
                    ? 'bg-[#165DFF] text-white'
                    : 'bg-gray-200 text-gray-500'
                )}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={cn(
                  'ml-2 text-sm font-medium',
                  step >= s ? 'text-[#165DFF]' : 'text-gray-400'
                )}>
                  {s === 1 ? '报名须知' : '填写信息'}
                </span>
                {s < 2 && <div className="w-16 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">报名须知</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    请如实填写个人信息，入场时需核验身份
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    每个活动每人最多可携带3名同行人
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    活动开始前可取消报名，名额将释放给候补用户
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    活动当天请提前30分钟到场，凭电子票二维码入场
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">活动信息</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>活动名称：{activity.title}</p>
                  <p>活动时间：{formatDateTime(activity.startTime)}</p>
                  <p>活动地点：{activity.location}</p>
                  <p>年龄限制：{activity.minAge}-{activity.maxAge}岁</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">报名人信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="姓名"
                  placeholder="请输入真实姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="身份证号"
                  placeholder="请输入身份证号"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  error={errors.idCard}
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">同行人信息</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCompanion}
                    disabled={companions.length >= 3}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    添加同行人
                  </Button>
                </div>
                
                {companions.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    暂无同行人，可添加最多3名同行人
                  </p>
                )}
                
                {companions.map((comp, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl mb-4 relative">
                    <button
                      onClick={() => removeCompanion(i)}
                      className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                    <h5 className="font-medium text-gray-700 mb-3">同行人 {i + 1}</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="姓名"
                        placeholder="请输入姓名"
                        value={comp.name}
                        onChange={(e) => updateCompanion(i, 'name', e.target.value)}
                        error={errors[`companionName${i}`]}
                      />
                      <Input
                        label="身份证号"
                        placeholder="请输入身份证号"
                        value={comp.idCard}
                        onChange={(e) => updateCompanion(i, 'idCard', e.target.value)}
                        error={errors[`companionIdCard${i}`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {step === 2 && (
              <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                上一步
              </Button>
            )}
            <Button className="flex-1" onClick={handleRegister} disabled={loading}>
              {loading ? '提交中...' : step === 1 ? '下一步' : '确认报名'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/my-tickets', { state: { newTicketId } });
        }}
        title="报名成功"
        size="md"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">报名成功！</h3>
          <p className="text-gray-500 mb-6">
            电子票已生成，请在活动当天凭二维码入场
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/activities')}>
              继续浏览
            </Button>
            <Button className="flex-1" onClick={() => navigate('/my-tickets', { state: { newTicketId } })}>
              查看我的票券
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
