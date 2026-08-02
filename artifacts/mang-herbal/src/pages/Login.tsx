import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';
import { showWelcomeToast } from '@/lib/welcome';
import logoPath from '@assets/logo_png_be_back_1784753437461.png';

export default function Login() {
  const { t } = useLanguage();
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login must never gate on password length — only require non-empty fields.
  const loginSchema = z.object({
    phone: z.string().min(1, t('ژمارەی مۆبایل داواکراوە', 'رقم الهاتف مطلوب', 'Phone number is required')),
    password: z.string().min(1, t('وشەی تێپەڕ داواکراوە', 'كلمة المرور مطلوبة', 'Password is required'))
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' }
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setErrorMsg('');
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.user, res.token);
        setLocation('/');
        showWelcomeToast(t, res.user.name, !!res.firstLogin);
      },
      onError: () => {
        setErrorMsg(t('ژمارە یان وشەی تێپەڕ هەڵەیە', 'رقم الهاتف أو كلمة المرور غير صحيحة', 'Phone or password is incorrect'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-7 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full border border-primary/30 bg-black flex items-center justify-center mb-3">
            <img src={logoPath} alt="Mang Herbal" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {t('بەخێربێیتەوە', 'أهلاً بك مجدداً', 'Welcome Back')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {t('چوونە ژوورەوە بۆ هەژمارەکەت', 'تسجيل الدخول إلى حسابك', 'Sign in to your account')}
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('وشەی تێپەڕ', 'كلمة المرور', 'Password')}</FormLabel>
                  <FormControl>
                    <div className="relative" dir="ltr">
                      <Input {...field} type={showPassword ? 'text' : 'password'} dir="ltr" className="bg-background h-11 pe-12" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword
                          ? t('شاردنەوەی وشەی تێپەڕ', 'إخفاء كلمة المرور', 'Hide password')
                          : t('پیشاندانی وشەی تێپەڕ', 'إظهار كلمة المرور', 'Show password')}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                {t('وشەی تێپەڕت لەبیرچووە؟', 'نسيت كلمة المرور؟', 'Forgot Password?')}
              </Link>
            </div>

            <Button type="submit" disabled={loginMutation.isPending} className="w-full h-12 rounded-full text-base mt-2 shadow-lg shadow-primary/20">
              {loginMutation.isPending ? '...' : t('چوونە ژوورەوە', 'تسجيل الدخول', 'Login')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          {t('هەژمارت نییە؟', 'ليس لديك حساب؟', 'Don\'t have an account?')}
          <Link href="/register" className="text-primary font-medium mx-2 hover:underline">
            {t('خۆت تۆمار بکە', 'سجل الآن', 'Register here')}
          </Link>
        </p>
      </div>
    </div>
  );
}
