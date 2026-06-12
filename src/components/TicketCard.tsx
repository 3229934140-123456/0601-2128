import { useState } from 'react';
import { Calendar, MapPin, Users, QrCode, X, Star } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Ticket, Activity } from '@/types';
import { formatDateTime } from '@/utils/date';
import { maskPhone } from '@/utils/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { useActivityStore } from '@/store/useActivityStore';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket & { activity?: Activity; registration?: any };
  onCancel?: () => void;
  onReview?: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  unused: { label: '待使用', color: 'info' },
  used: { label: '已使用', color: 'success' },
  cancelled: { label: '已取消', color: 'default' },
  expired: { label: '已过期', color: 'warning' },
};

export const TicketCard = ({ ticket, onCancel, onReview }: TicketCardProps) => {
  const [showQR, setShowQR] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const { currentUser } = useAuthStore();
  const { addReview, cancelRegistration } = useActivityStore();

  const status = statusConfig[ticket.status];
  const canCancel = ticket.status === 'unused' && ticket.activity && new Date() < ticket.activity.startTime;
  const canReview = ticket.status === 'used' && currentUser;

  const handleCancel = async () => {
    if (ticket.registration) {
      const success = await cancelRegistration(ticket.registration.id);
      if (success) {
        onCancel?.();
      }
    }
  };

  const handleSubmitReview = () => {
    if (currentUser && ticket.activity) {
      addReview(ticket.activity.id, currentUser.id, rating, reviewContent);
      setShowReview(false);
      setReviewContent('');
      onReview?.();
    }
  };

  return (
    <>
      <Card className={cn(
        'overflow-hidden',
        ticket.status === 'cancelled' && 'opacity-60'
      )}>
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-[#165DFF] to-[#0E42D2] p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="info" className="bg-white/20 text-white border-0">
                  {status.label}
                </Badge>
                <h3 className="font-serif font-semibold text-xl mt-2 line-clamp-1">
                  {ticket.activity?.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 hover:text-white"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="absolute left-0 right-0 bottom-0 flex justify-between">
            <div className="w-4 h-4 bg-white rounded-full -mb-2 -ml-2" />
            <div className="flex-1 border-b-2 border-dashed border-gray-200 mb-0" />
            <div className="w-4 h-4 bg-white rounded-full -mb-2 -mr-2" />
          </div>
        </div>

        <div className="p-4 pt-6">
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#165DFF]" />
              <span>{formatDateTime(ticket.activity?.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#165DFF]" />
              <span className="line-clamp-1">{ticket.activity?.location}</span>
            </div>
            {ticket.registration && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#165DFF]" />
                <span>
                  {currentUser?.name}
                  {ticket.registration.companionCount > 0 && 
                    ` +${ticket.registration.companionCount}人同行`
                  }
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
            <span>票号: {ticket.qrCode.slice(-8)}</span>
            <span>{maskPhone(currentUser?.phone || '')}</span>
          </div>

          <div className="flex gap-2 mt-4">
            {canCancel && (
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                取消报名
              </Button>
            )}
            {canReview && (
              <Button variant="primary" size="sm" className="flex-1" onClick={() => setShowReview(true)}>
                <Star className="w-4 h-4 mr-1" />
                评价活动
              </Button>
            )}
            {ticket.status === 'unused' && (
              <Button variant="primary" size="sm" className="flex-1" onClick={() => setShowQR(true)}>
                <QrCode className="w-4 h-4 mr-1" />
                出示二维码
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="电子票券">
        <div className="text-center">
          <QRCodeDisplay value={ticket.qrCode} size={240} />
          <p className="mt-4 text-sm text-gray-500">请向工作人员出示此二维码</p>
          <p className="mt-2 font-mono text-lg">{ticket.qrCode}</p>
          {ticket.activity && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
              <p className="font-medium">{ticket.activity.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(ticket.activity.startTime)}
              </p>
              <p className="text-sm text-gray-500">{ticket.activity.location}</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="活动评价">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-8 h-8',
                      star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="请分享您的活动体验..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#165DFF] focus:border-transparent resize-none"
              rows={4}
            />
          </div>
          <Button onClick={handleSubmitReview} className="w-full">
            提交评价
          </Button>
        </div>
      </Modal>
    </>
  );
};
