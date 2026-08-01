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
      },
      onError: () => {
        setErrorMsg(t('ژمارە یان وشەی تێپەڕ هەڵەیە', 'رقم الهاتف أو كلمة المرور غير صحيحة', 'Phone or password is incorrect'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-primary/30 bg-black flex items-center justify-center mb-4">
            <img src={logoPath} alt="Mang Herbal" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {t('بەخێربێیتەوە', 'أهلاً بك مجدداً', 'Welcome Back')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('چوونە ژوورەوە بۆ هەژمارەکەت', 'تسجيل الدخول إلى حسابك', 'Sign in to your account')}
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
                    <div className="relative">
                      <Input {...field} type={showPassword ? 'text' : 'password'} dir="ltr" className="bg-background h-12 pe-12" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
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

            <Button type="submit" disabled={loginMutation.isPending} className="w-full h-14 rounded-full text-lg mt-4 shadow-lg shadow-primary/20">
              {loginMutation.isPending ? '...' : t('چوونە ژوورەوە', 'تسجيل الدخول', 'Login')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          {t('هەژمارت نییە؟', 'ليس لديك حساب؟', 'Don\'t have an account?')}
          <Link href="/register" className="text-primary font-medium mx-2 hover:underline">
            {t('خۆت تۆمار بکە', 'سجل الآن', 'Register here')}
          </Link>
        </p>
      </div>
    </div>
  );
}
