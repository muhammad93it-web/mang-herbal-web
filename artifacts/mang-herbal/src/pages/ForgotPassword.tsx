import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResetPassword } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const resetMutation = useResetPassword();
  
  const [errorMsg, setErrorMsg] = useState('');

  const resetSchema = z.object({
    phone: z.string().min(1, t('ژمارەی مۆبایل داواکراوە', 'رقم الهاتف مطلوب', 'Phone number is required')),
    code: z.string().length(6, t('کۆدەکە دەبێت ٦ ژمارە بێت', 'يجب أن يكون الرمز ٦ أرقام', 'Code must be exactly 6 digits')),
    newPassword: z.string().min(6, t('وشەی تێپەڕ دەبێت لانیکەم ٦ پیت بێت', 'يجب أن تكون كلمة المرور ٦ أحرف على الأقل', 'Password must be at least 6 characters'))
  });

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { phone: '', code: '', newPassword: '' }
  });

  const onSubmit = (data: z.infer<typeof resetSchema>) => {
    setErrorMsg('');
    resetMutation.mutate({ data }, {
      onSuccess: () => {
        toast.success(t('وشەی تێپەڕ بە سەرکەوتوویی گۆڕدرا', 'تم تغيير كلمة المرور بنجاح', 'Password reset successfully'));
        setLocation('/login');
      },
      onError: (err: any) => {
        const apiError = err?.data?.error;
        setErrorMsg(apiError === 'Code expired'
          ? t('کۆدەکە بەسەرچووە، داوای کۆدێکی نوێ بکە لە بەڕێوەبەر', 'انتهت صلاحية الرمز، اطلب رمزاً جديداً من الإدارة', 'Code expired — request a new one from the administrator')
          : t('کۆدەکە هەڵەیە یان بەسەرچووە', 'الرمز غير صحيح أو منتهي الصلاحية', 'Invalid or expired code'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground text-center">
            {t('گۆڕینی وشەی تێپەڕ', 'تغيير كلمة المرور', 'Reset Password')}
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            {t('تکایە ئەو کۆدە بنووسە کە لەلایەن بەڕێوەبەرەوە پێت دراوە', 'يرجى إدخال الرمز الذي حصلت عليه من الإدارة', 'Please enter the code provided by the administrator')}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ژمارەی تەلەفۆن', 'رقم الهاتف', 'Phone Number')}</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" placeholder="0750..." className="bg-background h-12 text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('کۆدی ٦ ژمارەیی', 'الرمز المكون من 6 أرقام', '6-Digit Code')}</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" maxLength={6} placeholder="123456" className="bg-background h-12 text-center text-xl tracking-[0.5em] font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('وشەی تێپەڕی نوێ', 'كلمة المرور الجديدة', 'New Password')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" dir="ltr" className="bg-background h-12 text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={resetMutation.isPending} className="w-full h-14 rounded-full text-lg mt-4 shadow-lg shadow-primary/20">
              {resetMutation.isPending ? '...' : t('گۆڕین', 'تغيير', 'Reset')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
