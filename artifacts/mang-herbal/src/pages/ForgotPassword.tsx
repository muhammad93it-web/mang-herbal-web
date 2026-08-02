import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResetPassword, useGetSettings } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { normalizeWhatsAppNumber, parseWhatsAppNumbers, buildWaLink } from '@/lib/order-text';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const resetMutation = useResetPassword();
  const { data: settings } = useGetSettings();

  const [errorMsg, setErrorMsg] = useState('');

  const resetSchema = z.object({
    phone: z.string().min(1, t('ژمارەی مۆبایل داواکراوە', 'رقم الهاتف مطلوب', 'Phone number is required')),
    code: z.string().length(6, t('کۆدەکە دەبێت ٦ ژمارە بێت', 'يجب أن يكون الرمز ٦ أرقام', 'Code must be exactly 6 digits')),
    newPassword: z.string().min(6, t('وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت', 'يجب أن تكون كلمة المرور ٦ أحرف على الأقل', 'Password must be at least 6 characters'))
  });

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { phone: '', code: '', newPassword: '' }
  });

  // Shop WhatsApp number for "request a code": first configured order number,
  // falling back to the public WhatsApp / phone settings.
  const getSettingValue = (key: string) => {
    const s = settings?.find((x) => x.key === key);
    return s?.valueEn || s?.valueCkb || s?.valueAr || '';
  };
  const shopWhatsApp =
    parseWhatsAppNumbers(getSettingValue('order_whatsapp_numbers'))
      .map(normalizeWhatsAppNumber)
      .find(Boolean) ||
    normalizeWhatsAppNumber(getSettingValue('social_whatsapp')) ||
    normalizeWhatsAppNumber(getSettingValue('contact_phone'));

  const handleRequestCode = () => {
    const typedPhone = form.getValues('phone').trim();
    const msg = t(
      `سڵاو، وشەی نهێنیم بیرچووەتەوە. تکایە کۆدی گەڕاندنەوەم بۆ بنێرن.${typedPhone ? ` ژمارەی هەژمارەکەم: ${typedPhone}` : ''}`,
      `مرحباً، لقد نسيت كلمة المرور. يرجى إرسال رمز الاستعادة لي.${typedPhone ? ` رقم حسابي: ${typedPhone}` : ''}`,
      `Hi, I forgot my password. Please send me a reset code.${typedPhone ? ` My account phone: ${typedPhone}` : ''}`
    );
    window.open(buildWaLink(shopWhatsApp || null, msg), '_blank', 'noopener,noreferrer');
  };

  const onSubmit = (data: z.infer<typeof resetSchema>) => {
    setErrorMsg('');
    resetMutation.mutate({ data }, {
      onSuccess: () => {
        toast.success(t('وشەی نهێنی بە سەرکەوتوویی گۆڕدرا', 'تم تغيير كلمة المرور بنجاح', 'Password reset successfully'));
        setLocation('/login');
      },
      onError: (err: any) => {
        const apiError = err?.data?.error;
        setErrorMsg(apiError === 'Code expired'
          ? t('کۆدەکە بەسەرچووە — داوای کۆدێکی نوێ بکە', 'انتهت صلاحية الرمز — اطلب رمزاً جديداً', 'Code expired — request a new one')
          : t('کۆدەکە هەڵەیە یان بەسەرچووە', 'الرمز غير صحيح أو منتهي الصلاحية', 'Invalid or expired code'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-7 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/10 text-primary flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground text-center">
            {t('گەڕاندنەوەی وشەی نهێنی', 'استعادة كلمة المرور', 'Reset Password')}
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-[13px] leading-relaxed">
            {t(
              'وشەی نهێنیت بیرچووەتەوە؟ نیگەران مەبە — داوای کۆدی گەڕاندنەوە بکە و ئێمە لە ڕێگەی واتسئاپ یان ئیمەیڵەوە بۆت دەنێرین. پاشان کۆدەکە لێرە بنووسە و وشەی نهێنییەکی نوێ دابنێ.',
              'نسيت كلمة المرور؟ لا تقلق — اطلب رمز الاستعادة وسنرسله إليك عبر واتساب أو البريد الإلكتروني، ثم أدخل الرمز هنا وعيّن كلمة مرور جديدة.',
              "Forgot your password? Don't worry — request a reset code and we'll send it to you via WhatsApp or email, then enter the code here and set a new password."
            )}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleRequestCode}
          className="w-full h-11 rounded-full border-primary/30 text-primary hover:bg-primary/10 mb-4"
        >
          <MessageCircle className="w-4 h-4" />
          {t('داواکردنی کۆد بە واتسئاپ', 'طلب الرمز عبر واتساب', 'Request code via WhatsApp')}
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">
            {t('کۆدەکەت پێ گەیشت؟', 'وصلك الرمز؟', 'Got your code?')}
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ژمارەی تەلەفۆن', 'رقم الهاتف', 'Phone Number')}</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" placeholder="0750..." className="bg-background h-11 text-left" />
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
                    <Input {...field} dir="ltr" maxLength={6} placeholder="123456" className="bg-background h-11 text-center text-lg tracking-[0.5em] font-mono" />
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
                  <FormLabel>{t('وشەی نهێنی نوێ', 'كلمة المرور الجديدة', 'New Password')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" dir="ltr" className="bg-background h-11 text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={resetMutation.isPending} className="w-full h-12 rounded-full text-base mt-2 shadow-lg shadow-primary/20">
              {resetMutation.isPending ? '...' : t('دانانی وشەی نهێنی نوێ', 'تعيين كلمة مرور جديدة', 'Set New Password')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
