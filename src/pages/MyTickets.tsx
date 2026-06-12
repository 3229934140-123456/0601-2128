import { useState, useEffect, useMemo } from 'react';
import { Ticket, Clock, AlertTriangle, X, ListFilter, Hourglass } from 'lucide-react';
import { TicketCard } from '@/components/TicketCard';
import { VenueMode } from '@/components/VenueMode';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAuthStore } from '@/store/useAuthStore';
import { useActivityStore } from '@/store/useActivityStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/utils/date';

type FilterStatus = 'all' | 'unused' | 'used' | 'cancelled';

export default function MyTickets() {
  const { currentUser } = useAuthStore();
  const { getUserTickets, getUserWaitlists, loadData, leaveWaitlist, confirmWaitlistRegistration } = useActivityStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [venueModeTicket, setVenueModeTicket] = useState<any>(null);
  const [highlightedTicketId, setHighlightedTicketId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadData();
    const state = location.state as any;
    if (state?.newTicketId) {
      setHighlightedTicketId(state.newTicketId);
      window.history.replaceState({}, document.title);
    }
  }, [refreshKey, location.state]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const tickets = useMemo(() => {
    return getUserTickets(currentUser.id).sort((a: any, b: any) => {
      if (highlightedTicketId && a.id === highlightedTicketId) return -1;
      if (highlightedTicketId && b.id === highlightedTicketId) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [getUserTickets, currentUser.id, refreshKey, highlightedTicketId]);

  const waitlists = getUserWaitlists(currentUser.id).filter(w => w.status !== 'cancelled');

  const filteredTickets = tickets.filter((ticket: any) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const activeWaitlists = waitlists.filter(w => w.status === 'waiting' || w.status === 'notified');

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setHighlightedTicketId(null);
  };

  const handleLeaveWaitlist = (waitlistId: string) => {
    if (confirm('确定要退出候补队列吗？')) {
      leaveWaitlist(waitlistId);
      handleRefresh();
    }
  };

  const getWaitlistCountdown = (notifiedAt?: Date) => {
    if (!notifiedAt) return null;
    const deadline = new Date(notifiedAt.getTime() + 24 * 60 * 60 * 1000);
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return { expired: true, text: '已过期' };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { expired: false, text: `${hours}时${minutes}分${seconds}秒` };
  };

  const handleConfirmWaitlist = async (waitlistId: string, activityId: string) => {
    if (confirm('确认要候补转报名吗？确认后将生成电子票。')) {
      const result = await confirmWaitlistRegistration(waitlistId);
      if (result.success) {
        const updatedTickets = getUserTickets(currentUser.id);
        const newTicket = updatedTickets.find((t: any) => 
          t.registration?.activityId === activityId && t.status === 'unused'
        );
        if (newTicket) {
          navigate('/my-tickets', { state: { newTicketId: newTicket.id } });
        }
        handleRefresh();
      } else {
        alert(result.message);
      }
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'unused', label: '待使用' },
    { key: 'used', label: '已使用' },
    { key: 'cancelled', label: '已取消' },
  ];

  return (
    <>
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif font-bold text-2xl text-gray-900">我的票券</h1>
              <p className="text-gray-500 mt-1">管理您的活动票券和候补订单</p>
            </div>
            <Button onClick={handleRefresh}>
              <ListFilter className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>

          {activeWaitlists.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-800 mb-2">候补队列 ({activeWaitlists.length})</h4>
                  <div className="space-y-2">
                    {activeWaitlists.map((item: any) => {
                      const countdown = getWaitlistCountdown(item.notifiedAt);
                      const isNotified = item.status === 'notified';
                      const isExpired = countdown?.expired;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 bg-white rounded-lg ${
                            isNotified && !isExpired ? 'ring-2 ring-green-200' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.activity?.title}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span>候补顺位：第 {item.position} 位</span>
                              {isNotified && !isExpired && (
                                <Badge variant="success">有名额释放</Badge>
                              )}
                              {isExpired && (
                                <Badge variant="danger">已过期</Badge>
                              )}
                            </p>
                            {isNotified && !isExpired && (
                              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                                <Hourglass className="w-3.5 h-3.5" />
                                确认倒计时：<span className="font-mono font-medium">{countdown?.text}</span>
                              </p>
                            )}
                            {isNotified && isExpired && (
                              <p className="text-sm text-red-500 mt-1">
                                候补名额已过期，如需报名请重新候补
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {isNotified && !isExpired && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmWaitlist(item.id, item.activityId)}
                              >
                                确认报名
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLeaveWaitlist(item.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              退出候补
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-[#165DFF] font-serif">{tickets.length}</p>
              <p className="text-sm text-gray-500 mt-1">全部票券</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-500 font-serif">
                {tickets.filter((t: any) => t.status === 'unused').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">待使用</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500 font-serif">
                {tickets.filter((t: any) => t.status === 'used').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">已使用</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-400 font-serif">
                {tickets.filter((t: any) => t.status === 'cancelled').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">已取消</p>
            </Card>
          </div>

          <Card className="p-6">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket: any) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          onCancel={handleRefresh}
                          onReview={handleRefresh}
                          autoOpenQR={ticket.id === highlightedTicketId}
                          onEnterVenue={() => setVenueModeTicket(ticket)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Ticket className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          {tab.key === 'all' ? '暂无票券' : `暂无${tab.label}票券`}
                        </h3>
                        {tab.key === 'all' && (
                          <>
                            <p className="text-gray-500 mb-4">您还没有报名任何活动</p>
                            <Button onClick={() => navigate('/activities')}>浏览活动</Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>

      {venueModeTicket && (
        <VenueMode
          ticket={venueModeTicket}
          onClose={() => setVenueModeTicket(null)}
        />
      )}
    </>
  );
}
