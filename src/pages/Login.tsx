import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { validatePhone } from '@/utils/validation';
import { cn } from '@/lib/utils';

type LoginMode = 'user' | 'admin';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('user');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    if (mode === 'admin' && !password) {
      setError('请输入管理员密码');
      return;
    }

    if (mode === 'admin' && password !== 'admin123') {
      setError('密码错误');
      return;
    }

    setLoading(true);
    try {
      const success = await login(phone, mode);
      if (success) {
        navigate(mode === 'admin' ? '/admin' : '/');
      } else {
        setError(mode === 'admin' ? '管理员账号不存在' : '该账号已被列入黑名单');
      }
    } catch (e) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#165DFF]/5 via-white to-[#E34D59]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#165DFF] to-[#0E42D2] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-serif font-bold text-3xl">文</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">
            数字文化馆
          </h1>
          <p className="text-gray-500">文化活动票务管理系统</p>
        </div>

        <Card className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('user')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200',
                mode === 'user'
                  ? 'bg-[#165DFF] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <User className="w-5 h-5" />
              市民登录
            </button>
            <button
              onClick={() => setMode('admin')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200',
                mode === 'admin'
                  ? 'bg-[#165DFF] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Shield className="w-5 h-5" />
              馆员登录
            </button>
          </div>

          {mode === 'admin' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                测试账号：13900139001 / 密码：admin123
              </p>
            </div>
          )}

          {mode === 'user' && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">
                测试手机号：13800138001、13800138002
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="手机号"
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-5 h-5" />}
            />

            {mode === 'admin' && (
              <Input
                label="密码"
                type="password"
                placeholder="请输入管理员密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
              />
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? '登录中...' : '登 录'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <Badge variant="default">免费报名</Badge>
              <Badge variant="default">实名登记</Badge>
              <Badge variant="default">安全便捷</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
