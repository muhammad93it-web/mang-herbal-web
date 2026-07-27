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
    password: z.string().min(6, t('وشەی تێپەڕ دەبێت لانیکەم ٦ پیت بێت', 'يجب أن تكون كلمة المرور ٦ أحرف على الأقل', 'Password must be at least 6 characters'))
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phone: '', password: '' }
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    setErrorMsg('');
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.user, res.token);
        setLocation('/');
      },
      onError: (err) => {
        const apiError = (err as any)?.data?.error;
        setErrorMsg(apiError === 'Phone already registered'
          ? t('ئەم ژمارەیە پێشتر تۆمارکراوە', 'هذا الرقم مسجل مسبقاً', 'This phone is already registered')
          : t('تۆمارکردن سەرکەوتوو نەبوو', 'فشل إنشاء الحساب', 'Registration failed'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-primary/30 bg-black flex items-center justify-center mb-4">
            <img src={logoPath} alt="Mang Herbal" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {t('دروستکردنی هەژمار', 'إنشاء حساب جديد', 'Create Account')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('بەشداربە لە خێزانی Mang Herbal', 'انضم إلى عائلة Mang Herbal', 'Join the Mang Herbal family')}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ناو', 'الاسم', 'Name')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background h-12" />
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
                    <Input {...field} dir="ltr" placeholder="0750..." className="bg-background h-12" />
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
                  <FormLabel>{t('وشەی تێپەڕ', 'كلمة المرور', 'Password')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" dir="ltr" className="bg-background h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={registerMutation.isPending} className="w-full h-14 rounded-full text-lg mt-4 shadow-lg shadow-primary/20">
              {registerMutation.isPending ? '...' : t('تۆمارکردن', 'تسجيل', 'Register')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          {t('پێشتر هەژمارت هەیە؟', 'لديك حساب مسبقاً؟', 'Already have an account?')}
          <Link href="/login" className="text-primary font-medium mx-2 hover:underline">
            {t('چوونە ژوورەوە', 'تسجيل الدخول', 'Login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
