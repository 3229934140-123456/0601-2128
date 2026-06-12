import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, QrCode, RefreshCw, CheckCircle } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Button } from './ui/Button';
import { Ticket, Activity } from '@/types';
import { formatDateTime } from '@/utils/date';
import { useAuthStore } from '@/store/useAuthStore';
import { useActivityStore } from '@/store/useActivityStore';

interface VenueModeProps {
  ticket: Ticket & { activity?: Activity; registration?: any };
  onClose: () => void;
}

export const VenueMode = ({ ticket, onClose }: VenueModeProps) => {
  const { currentUser } = useAuthStore();
  const { loadData, getUserTickets } = useActivityStore();
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(ticket.checkedInAt || null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      loadData();
      const updatedTickets = getUserTickets(currentUser?.id || '');
      const updated = updatedTickets.find(t => t.id === ticket.id);
      if (updated) {
        setCurrentStatus(updated.status);
        if (updated.checkedInAt) {
          setCheckedInAt(updated.checkedInAt);
        }
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [ticket.id, loadData, getUserTickets, currentUser?.id]);

  useEffect(() => {
    if (!ticket.activity) return;

    const updateCountdown = () => {
      const now = new Date();
      const startTime = new Date(ticket.activity!.startTime);
      const diff = startTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('活动已开始');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}天 ${hours}小时 ${minutes}分`);
      } else if (hours > 0) {
        setCountdown(`${hours}小时 ${minutes}分 ${seconds}秒`);
      } else {
        setCountdown(`${minutes}分 ${seconds}秒`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [ticket.activity]);

  const isUsed = currentStatus === 'used';

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0E42D2] via-[#165DFF] to-[#0E42D2] flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md">
        <div className="text-center text-white mb-6">
          {isUsed ? (
            <div className="flex items-center justify-center gap-2 text-green-300 mb-2">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-medium">已核销入场</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-white/80 mb-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">自动检测核销状态</span>
            </div>
          )}
          <h2 className="text-3xl font-serif font-bold mb-1">
            {ticket.activity?.title}
          </h2>
          <p className="text-white/70">
            距活动开始：<span className="font-mono text-yellow-300">{countdown}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className={`p-6 ${isUsed ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-[#165DFF] to-[#0E42D2]'}`}>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-2xl shadow-inner">
                <QRCodeDisplay value={ticket.qrCode} size={220} />
              </div>
            </div>
            <div className="text-center text-white">
              <p className="text-sm opacity-80 mb-1">票券编号</p>
              <p className="font-mono text-2xl tracking-widest">{ticket.qrCode}</p>
            </div>
          </div>

          <div className="flex justify-between -mt-2 relative z-10">
            <div className="w-6 h-6 bg-[#0E42D2] rounded-full -ml-3" style={{ clipPath: 'inset(0 50% 0 0)' }} />
            <div className="flex-1 border-b-2 border-dashed border-gray-200" />
            <div className="w-6 h-6 bg-[#0E42D2] rounded-full -mr-3" style={{ clipPath: 'inset(0 0 0 50%)' }} />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#165DFF]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">活动时间</p>
                <p className="font-medium text-gray-900">{formatDateTime(ticket.activity?.startTime)}</p>
                {ticket.activity && (
                  <p className="text-sm text-gray-500">
                    时长约 {Math.round((ticket.activity.endTime.getTime() - ticket.activity.startTime.getTime()) / 60000)} 分钟
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#165DFF]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">活动地点</p>
                <p className="font-medium text-gray-900">{ticket.activity?.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#165DFF]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">入场人员</p>
                <p className="font-medium text-gray-900">
                  {currentUser?.name}
                  {ticket.registration?.companionCount > 0 && (
                    <span className="text-[#165DFF]"> +{ticket.registration.companionCount}人同行</span>
                  )}
                </p>
                {ticket.registration?.companionInfo?.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    同行人：{ticket.registration.companionInfo.map((c: any) => c.name).join('、')}
                  </p>
                )}
              </div>
            </div>

            {checkedInAt && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">核销时间</p>
                  <p className="font-medium text-green-800">{formatDateTime(checkedInAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm mb-3">
            请向工作人员出示此页面进行扫码核销
          </p>
          <Button
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            onClick={onClose}
          >
            退出入场模式
          </Button>
        </div>
      </div>
    </div>
  );
};
