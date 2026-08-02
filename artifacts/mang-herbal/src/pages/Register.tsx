import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRegister } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { showWelcomeToast } from '@/lib/welcome';
import logoPath from '@assets/logo_png_be_back_1784753437461.png';

export default function Register() {
  const { t } = useLanguage();
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();
  
  const [errorMsg, setErrorMsg] = useState('');

  const registerSchema = z.object({
    name: z.string().min(2, t('ناو زۆر کورتە', 'الاسم قصير جداً', 'Name is too short')),
    phone: z.string().min(10, t('ژمارەی مۆبایلی دروست بنووسە', 'أدخل رقم هاتف صحيح', 'Enter a valid phone number')),
    email: z.string().min(1, t('ئیمەیڵ داواکراوە', 'البريد الإلكتروني مطلوب', 'Email is required'))
      .email(t('ئیمەیڵێکی دروست بنووسە', 'أدخل بريداً إلكترونياً صحيحاً', 'Enter a valid email address')),
    password: z.string().min(6, t('وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت', 'يجب أن تكون كلمة المرور ٦ أحرف على الأقل', 'Password must be at least 6 characters'))
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phone: '', email: '', password: '' }
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    setErrorMsg('');
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.user, res.token);
        setLocation('/');
        // Registration is always the customer's first time with us.
        showWelcomeToast(t, res.user.name, true);
      },
      onError: (err) => {
        const apiError = (err as any)?.data?.error;
        setErrorMsg(apiError === 'Phone already registered'
          ? t('ئەم ژمارەیە پێشتر تۆمارکراوە', 'هذا الرقم مسجل مسبقاً', 'This phone is already registered')
          : apiError === 'Email already registered'
          ? t('ئەم ئیمەیڵە پێشتر تۆمارکراوە', 'هذا البريد مسجل مسبقاً', 'This email is already registered')
          : t('تۆمارکردن سەرکەوتوو نەبوو', 'فشل إنشاء الحساب', 'Registration failed'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-7 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full border border-primary/30 bg-black flex items-center justify-center mb-3">
            <img src={logoPath} alt="Mang Herbal" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {t('دروستکردنی هەژمار', 'إنشاء حساب جديد', 'Create Account')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {t('بەشداربە لە خێزانی Mang Herbal', 'انضم إلى عائلة Mang Herbal', 'Join the Mang Herbal family')}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ناو', 'الاسم', 'Name')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ژمارەی تەلەفۆن', 'رقم الهاتف', 'Phone Number')}</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" placeholder="0750..." className="bg-background h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ئیمەیڵ', 'البريد الإلكتروني', 'Email')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" dir="ltr" placeholder="name@gmail.com" className="bg-background h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('وشەی نهێنی', 'كلمة المرور', 'Password')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" dir="ltr" className="bg-background h-11" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {t('لانیکەم ٦ پیت', '٦ أحرف على الأقل', 'At least 6 characters')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={registerMutation.isPending} className="w-full h-12 rounded-full text-base mt-3 shadow-lg shadow-primary/20">
              {registerMutation.isPending ? '...' : t('تۆمارکردن', 'تسجيل', 'Register')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          {t('پێشتر هەژمارت هەیە؟', 'لديك حساب مسبقاً؟', 'Already have an account?')}
          <Link href="/login" className="text-primary font-medium mx-2 hover:underline">
            {t('چوونە ژوورەوە', 'تسجيل الدخول', 'Login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
