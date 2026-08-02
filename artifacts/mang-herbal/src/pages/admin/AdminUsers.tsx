import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminGetUsers, useAdminCreateResetCode, getAdminGetUsersQueryKey } from '@workspace/api-client-react';
import { formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { KeyRound, Shield, User as UserIcon } from 'lucide-react';

export default function AdminUsers() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminGetUsers();
  const createResetCode = useAdminCreateResetCode();

  const handleGenerateCode = (userId: number) => {
    createResetCode.mutate({ id: userId }, {
      onSuccess: () => {
        toast.success(t('کۆد بە سەرکەوتوویی دروستکرا', 'تم إنشاء الرمز بنجاح', 'Code generated successfully'));
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      },
      onError: () => {
        toast.error(t('هەڵەیەک ڕوویدا', 'حدث خطأ', 'An error occurred'));
      }
    });
  };

  return (
    <AdminLayout title={t('بەکارهێنەران', 'المستخدمين', 'Users')}>
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="p-4 font-semibold text-muted-foreground">ID</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('ناو', 'الاسم', 'Name')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('تەلەفۆن', 'الهاتف', 'Phone')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('ئیمەیڵ', 'البريد الإلكتروني', 'Email')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('ڕۆڵ', 'الدور', 'Role')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('بەرواری تۆماربوون', 'تاريخ التسجيل', 'Join Date')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('کۆدی گۆڕینی وشەی تێپەڕ', 'رمز تغيير كلمة المرور', 'Reset Code')}</th>
                <th className="p-4 font-semibold text-muted-foreground text-right">{t('کردار', 'إجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : users && users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4 font-medium">#{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                          {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-left" dir="ltr">
                      {formatPhone(user.phone)}
                    </td>
                    <td className="p-4 text-sm text-left" dir="ltr">
                      {user.email ? (
                        <a href={`mailto:${user.email}`} className="text-foreground hover:text-primary hover:underline">
                          {user.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">{t('بەڕێوەبەر', 'مدير', 'Admin')}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted text-muted-foreground">{t('کڕیار', 'عميل', 'Customer')}</Badge>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm text-left" dir="ltr">
                      {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="p-4">
                      {user.hasResetCode && user.resetCode ? (
                        <div className="flex flex-col gap-1">
                          <code className="bg-secondary px-2 py-1 rounded text-primary tracking-widest font-bold text-center inline-block w-fit">
                            {user.resetCode}
                          </code>
                          {user.resetCodeExpiresAt && (
                            <span className="text-xs text-muted-foreground">
                              {t('بەسەردەچێت:', 'ينتهي:', 'Expires:')} <span dir="ltr">{format(new Date(user.resetCodeExpiresAt), 'yyyy-MM-dd HH:mm')}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t('نییە', 'لا يوجد', 'None')}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGenerateCode(user.id)}
                        disabled={createResetCode.isPending}
                        className="text-xs border-primary/20 hover:border-primary text-primary hover:bg-primary/10"
                      >
                        <KeyRound className="w-3 h-3 mr-2" />
                        {t('دروستکردنی کۆد', 'إنشاء رمز', 'Generate Code')}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    {t('هیچ بەکارهێنەرێک نەدۆزرایەوە.', 'لم يتم العثور على مستخدمين.', 'No users found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
