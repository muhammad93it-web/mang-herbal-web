import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useAdminGetSettings,
  getAdminGetSettingsQueryKey,
  useAdminUpdateSettings,
  useAdminTestWhatsApp,
  getGetSettingsQueryKey,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseWhatsAppNumbers, parseWhatsAppKeyPairs, serializeWhatsAppKeyPairs, normalizeWhatsAppNumber } from '@/lib/order-text';
import { Plus, Trash2, Send, Copy, Check, Download } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

const REQUIRED_KEYS = [
  'hero_badge',
  'hero_title_1',
  'hero_title_2',
  'hero_subtitle',
  'hero_image',
  'footer_about',
  'contact_address',
  'contact_phone',
  'contact_email',
  'social_instagram',
  'social_facebook',
  'social_whatsapp',
  'order_whatsapp_numbers',
  'order_whatsapp_apikeys'
];

const ACTIVATION_MESSAGE = 'I allow callmebot to send me messages';
const CALLMEBOT_NUMBER = '+34 644 78 33 97';

export default function AdminSettings() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useAdminGetSettings({
    query: { queryKey: getAdminGetSettingsQueryKey() },
  });
  const updateSettings = useAdminUpdateSettings();
  const testWhatsApp = useAdminTestWhatsApp();

  const [formData, setFormData] = useState<Record<string, { key: string, valueCkb: string, valueAr: string, valueEn: string }>>({});
  const [newWaNumber, setNewWaNumber] = useState('');
  const [newWaKey, setNewWaKey] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [testingNumber, setTestingNumber] = useState<string | null>(null);
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  // Downloads the full-database backup file. Manual fetch (not the generated
  // client) because this is a file download, not a JSON API call.
  const handleDownloadBackup = async () => {
    setDownloadingBackup(true);
    try {
      const token = localStorage.getItem('mang_token');
      const res = await fetch('/api/admin/backup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mang-herbal-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke later — revoking immediately can race the download start on
      // some browsers (Safari/iOS).
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success(t('فایلی باکئاپ داگیرا — لە شوێنێکی سەلامەت هەڵیبگرە', 'تم تنزيل النسخة الاحتياطية — احفظها في مكان آمن', 'Backup downloaded — keep it somewhere safe'));
    } catch {
      toast.error(t('داگرتنی باکئاپ سەرنەکەوت', 'فشل تنزيل النسخة الاحتياطية', 'Backup download failed'));
    } finally {
      setDownloadingBackup(false);
    }
  };

  useEffect(() => {
    if (settings) {
      const initial: typeof formData = {};
      REQUIRED_KEYS.forEach(key => {
        const found = settings.find(s => s.key === key);
        initial[key] = {
          key,
          valueCkb: found?.valueCkb || '',
          valueAr: found?.valueAr || '',
          valueEn: found?.valueEn || '',
        };
      });
      setFormData(initial);
    }
  }, [settings]);

  const handleChange = (key: string, lang: 'Ckb' | 'Ar' | 'En', value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`value${lang}`]: value
      }
    }));
  };

  const handleSave = () => {
    const payload = Object.values(formData);
    updateSettings.mutate({ data: { settings: payload } }, {
      onSuccess: () => {
        toast.success(t('ڕێکخستنەکان پاشەکەوتکران', 'تم حفظ الإعدادات', 'Settings saved'));
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
      },
      onError: () => {
        toast.error(t('هەڵەیەک ڕوویدا', 'حدث خطأ', 'An error occurred'));
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title={t('ڕێکخستنەکان', 'الإعدادات', 'Settings')}>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  const renderFieldGroup = (key: string, label: string) => {
    const field = formData[key] || { valueCkb: '', valueAr: '', valueEn: '' };
    return (
      <div className="bg-card border border-border/50 p-4 md:p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold text-lg text-foreground border-b border-border/50 pb-2">{label} <span className="text-xs text-muted-foreground ml-2 font-mono bg-secondary px-2 py-0.5 rounded">{key}</span></h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('کوردی', 'كردي', 'Kurdish')}</Label>
            <Input value={field.valueCkb} onChange={e => handleChange(key, 'Ckb', e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label>{t('عەرەبی', 'عربي', 'Arabic')}</Label>
            <Input value={field.valueAr} onChange={e => handleChange(key, 'Ar', e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label>{t('ئینگلیزی', 'إنجليزي', 'English')}</Label>
            <Input value={field.valueEn} onChange={e => handleChange(key, 'En', e.target.value)} className="bg-background" />
          </div>
        </div>
      </div>
    );
  };

  const renderSingleField = (key: string, label: string) => {
    const field = formData[key] || { valueCkb: '', valueAr: '', valueEn: '' };
    return (
      <div className="bg-card border border-border/50 p-4 md:p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold text-lg text-foreground border-b border-border/50 pb-2">{label} <span className="text-xs text-muted-foreground ml-2 font-mono bg-secondary px-2 py-0.5 rounded">{key}</span></h3>
        <div className="space-y-2">
          <Label>{t('بەها', 'القيمة', 'Value')}</Label>
          <Input 
            value={field.valueEn} 
            onChange={e => {
              handleChange(key, 'En', e.target.value);
              handleChange(key, 'Ar', e.target.value);
              handleChange(key, 'Ckb', e.target.value);
            }} 
            className="bg-background text-left" 
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">{t('هەمان بەها بۆ هەموو زمانەکان بەکاردێت.', 'تستخدم نفس القيمة لجميع اللغات.', 'Same value used for all languages.')}</p>
        </div>
      </div>
    );
  };

  const renderHeroImage = () => {
    const field = formData['hero_image'] || { key: 'hero_image', valueCkb: '', valueAr: '', valueEn: '' };
    const preview = getImageUrl(field.valueEn || 'hero.jpg');
    return (
      <div className="bg-card border border-border/50 p-4 md:p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold text-lg text-foreground border-b border-border/50 pb-2">
          {t('وێنەی بەشی سەرەکی', 'صورة القسم الرئيسي', 'Hero Image')}
          <span className="text-xs text-muted-foreground ml-2 font-mono bg-secondary px-2 py-0.5 rounded">hero_image</span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-24 aspect-[4/5] rounded-xl overflow-hidden border border-border/50 bg-secondary/30 shrink-0">
            {preview && <img src={preview} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 w-full space-y-2">
            <Label>{t('لینکی وێنە یان ناوی فایل', 'رابط الصورة أو اسم الملف', 'Image link or file name')}</Label>
            <Input
              value={field.valueEn}
              onChange={e => {
                handleChange('hero_image', 'En', e.target.value);
                handleChange('hero_image', 'Ar', e.target.value);
                handleChange('hero_image', 'Ckb', e.target.value);
              }}
              dir="ltr"
              placeholder="hero.jpg"
              className="bg-background text-left"
            />
            <p className="text-xs text-muted-foreground">
              {t('بەتاڵی بهێڵەوە بۆ وێنە بنەڕەتییەکە، یان لینکی وێنەیەک دابنێ (https://...).', 'اتركه فارغاً للصورة الافتراضية، أو ضع رابط صورة (https://...).', 'Leave empty for the default image, or paste an image link (https://...).')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderWhatsappOrderNumbers = () => {
    const numbersField = formData['order_whatsapp_numbers'] || { key: 'order_whatsapp_numbers', valueCkb: '', valueAr: '', valueEn: '' };
    const keysField = formData['order_whatsapp_apikeys'] || { key: 'order_whatsapp_apikeys', valueCkb: '', valueAr: '', valueEn: '' };
    const numbers = parseWhatsAppNumbers(numbersField.valueEn);
    // keyMap is keyed by the normalized international number ("964…"),
    // matching how the server looks keys up — always access it via norm().
    const keyMap = parseWhatsAppKeyPairs(keysField.valueEn);
    const norm = (n: string) => normalizeWhatsAppNumber(n) || n;

    const setBoth = (nums: string[], keys: Record<string, string>) => {
      const nv = nums.join(',');
      const kv = serializeWhatsAppKeyPairs(keys);
      (['En', 'Ar', 'Ckb'] as const).forEach(l => {
        handleChange('order_whatsapp_numbers', l, nv);
        handleChange('order_whatsapp_apikeys', l, kv);
      });
    };

    const addNumber = () => {
      const cleaned = newWaNumber.replace(/[^\d+]/g, '');
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        toast.error(t('ژمارەکە دروست نییە', 'الرقم غير صحيح', 'Invalid number'));
        return;
      }
      if (numbers.some(n => norm(n) === norm(cleaned))) {
        toast.error(t('ئەم ژمارەیە پێشتر زیادکراوە', 'هذا الرقم مضاف مسبقاً', 'Number already added'));
        return;
      }
      const keys = { ...keyMap };
      if (newWaKey.trim()) keys[norm(cleaned)] = newWaKey.trim().replace(/\s/g, '');
      setBoth([...numbers, cleaned], keys);
      setNewWaNumber('');
      setNewWaKey('');
    };

    const removeNumber = (num: string) => {
      const keys = { ...keyMap };
      delete keys[norm(num)];
      setBoth(numbers.filter(n => n !== num), keys);
    };

    const setKey = (num: string, key: string) => {
      const keys = { ...keyMap };
      const cleaned = key.trim().replace(/\s/g, '');
      if (cleaned) keys[norm(num)] = cleaned; else delete keys[norm(num)];
      setBoth(numbers, keys);
    };

    const testSend = (num: string) => {
      const apiKey = keyMap[norm(num)];
      if (!apiKey) return;
      setTestingNumber(num);
      testWhatsApp.mutate({ data: { phone: num, apiKey } }, {
        onSuccess: (r) => {
          setTestingNumber(null);
          if (r.success) {
            toast.success(t('نامەی تاقیکردنەوە نێردرا — واتساپەکەت بپشکنە', 'تم إرسال رسالة الاختبار — تحقق من واتساب', 'Test message sent — check your WhatsApp'));
          } else {
            toast.error(t('ناردن سەرنەکەوت: ', 'فشل الإرسال: ', 'Send failed: ') + (r.detail || ''));
          }
        },
        onError: () => {
          setTestingNumber(null);
          toast.error(t('هەڵە لە ناردن', 'خطأ في الإرسال', 'Send error'));
        }
      });
    };

    const copyActivation = () => {
      navigator.clipboard.writeText(ACTIVATION_MESSAGE).then(() => {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2000);
      });
    };

    return (
      <div className="bg-card border border-primary/30 p-4 md:p-6 rounded-2xl space-y-5">
        <p className="text-sm text-muted-foreground">
          {t(
            'کاتێک کڕیارێک داواکاری تەواو دەکات، داواکارییەکە بە شێوەی ئۆتۆماتیک بۆ ئەم ژمارانە دەنێردرێت لە واتساپ (ئەگەر کلیلی API دانرابێت). هەروەها کڕیار خۆشی دەتوانێت بە یەک دوگمە بینێرێت.',
            'عند إكمال العميل طلبه، يُرسل الطلب تلقائياً إلى هذه الأرقام عبر واتساب (إذا وُضع مفتاح API). كما يمكن للعميل إرساله بضغطة واحدة.',
            'When a customer completes an order, it is sent automatically to these numbers on WhatsApp (if an API key is set). The customer can also send it with one tap.'
          )}
        </p>

        {/* Configured numbers */}
        <div className="space-y-3">
          {numbers.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('هیچ ژمارەیەک زیاد نەکراوە.', 'لم يضف أي رقم.', 'No numbers added.')}</p>
          )}
          {numbers.map(num => {
            const hasKey = !!keyMap[norm(num)];
            return (
              <div key={num} className="bg-background/60 border border-border/50 rounded-xl p-3 md:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span dir="ltr" className="font-bold text-foreground">{num}</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${hasKey ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {hasKey
                        ? t('ناردنی ئۆتۆماتیک چالاکە', 'الإرسال التلقائي مفعّل', 'Auto-send active')
                        : t('بێ کلیل — تەنها دەستی', 'بدون مفتاح — يدوي فقط', 'No key — manual only')}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNumber(num)}
                      className="w-8 h-8 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors text-muted-foreground"
                      aria-label={t('سڕینەوە', 'حذف', 'Remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Input
                    value={keyMap[norm(num)] || ''}
                    onChange={e => setKey(num, e.target.value)}
                    dir="ltr"
                    placeholder={t('کلیلی API لێرە بنووسە', 'اكتب مفتاح API هنا', 'Enter API key here')}
                    className="bg-background text-left flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!hasKey || testWhatsApp.isPending}
                    onClick={() => testSend(num)}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    {testingNumber === num && testWhatsApp.isPending
                      ? t('دەنێردرێت...', 'جاري الإرسال...', 'Sending...')
                      : t('تاقیکردنەوە', 'اختبار', 'Test')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add a new number */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <Input
            value={newWaNumber}
            onChange={e => setNewWaNumber(e.target.value)}
            dir="ltr"
            placeholder="07501234567"
            className="bg-background text-left"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNumber(); } }}
          />
          <Input
            value={newWaKey}
            onChange={e => setNewWaKey(e.target.value)}
            dir="ltr"
            placeholder={t('کلیلی API (ئارەزوومەندانە)', 'مفتاح API (اختياري)', 'API key (optional)')}
            className="bg-background text-left"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNumber(); } }}
          />
          <Button type="button" variant="outline" onClick={addNumber} className="shrink-0">
            <Plus className="w-4 h-4" />
            {t('زیادکردن', 'إضافة', 'Add')}
          </Button>
        </div>

        {/* CallMeBot activation guide */}
        <div className="bg-secondary/20 border border-border/40 rounded-xl p-4 space-y-3 text-sm">
          <p className="font-semibold text-foreground">
            {t('چۆن ناردنی ئۆتۆماتیک چالاک بکەیت؟ (خۆڕاییە)', 'كيف تفعّل الإرسال التلقائي؟ (مجاني)', 'How to activate auto-send? (free)')}
          </p>
          <ol className="list-decimal ps-5 space-y-2 text-muted-foreground leading-relaxed">
            <li>
              {t('ئەم ژمارەیە وەک پەیوەندییەک خەزن بکە: ', 'احفظ هذا الرقم كجهة اتصال: ', 'Save this number as a contact: ')}
              <span dir="ltr" className="font-bold text-foreground whitespace-nowrap">{CALLMEBOT_NUMBER}</span>
            </li>
            <li>
              {t('لە واتساپەوە ئەم نامەیەی بۆ بنێرە:', 'أرسل له هذه الرسالة من واتساب:', 'Send it this message on WhatsApp:')}
              <span className="flex items-center gap-2 mt-1.5 flex-wrap">
                <code dir="ltr" className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-foreground text-xs">{ACTIVATION_MESSAGE}</code>
                <Button type="button" size="sm" variant="ghost" onClick={copyActivation} className="h-8">
                  {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMsg ? t('کۆپی کرا', 'تم النسخ', 'Copied') : t('کۆپی', 'نسخ', 'Copy')}
                </Button>
              </span>
            </li>
            <li>{t('لە ماوەی ٢ خولەکدا وەڵامێکت بۆ دێت کە کلیلی API ی تێدایە (ژمارەیەکە).', 'خلال دقيقتين تصلك رسالة تحتوي مفتاح API (رقم).', 'Within 2 minutes you receive a reply containing your API key (a number).')}</li>
            <li>{t('کلیلەکە لە خانەی سەرەوە بنووسە بۆ ژمارەکەت، پاشەکەوت بکە و دوگمەی «تاقیکردنەوە» دابگرە.', 'اكتب المفتاح في الحقل أعلاه لرقمك، احفظ ثم اضغط زر «اختبار».', 'Enter the key in the field above for your number, save, then press "Test".')}</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            {t('ئەگەر وەڵام نەهاتەوە، دوای ٢٤ کاتژمێر دووبارە هەوڵبدەرەوە. تەنانەت بەبێ کلیلیش، هەموو داواکارییەکان لە پانێڵی بەڕێوەبردن دەردەکەون.', 'إذا لم يصل الرد، حاول مجدداً بعد ٢٤ ساعة. حتى بدون مفتاح، تظهر كل الطلبات في لوحة الإدارة.', 'If no reply arrives, try again after 24 hours. Even without a key, all orders still appear in the admin panel.')}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {t('دوای گۆڕانکاری، دوگمەی پاشەکەوتکردن دابگرە.', 'بعد التغيير اضغط زر الحفظ.', 'Press Save after making changes.')}
        </p>
      </div>
    );
  };

  return (
    <AdminLayout title={t('ڕێکخستنەکانی سایت', 'إعدادات الموقع', 'Site Settings')}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-end mb-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending} className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20">
            {updateSettings.isPending ? t('چاوەڕوان بە...', 'جاري الحفظ...', 'Saving...') : t('پاشەکەوتکردن', 'حفظ التغييرات', 'Save Changes')}
          </Button>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-primary">{t('ژمارەکانی واتساپ بۆ داواکارییەکان', 'أرقام واتساب للطلبات', 'WhatsApp Numbers for Orders')}</h2>
            {renderWhatsappOrderNumbers()}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-primary">{t('بەشی سەرەکی', 'القسم الرئيسي', 'Hero Section')}</h2>
            {renderFieldGroup('hero_badge', t('باجی سەرەکی', 'شارة البداية', 'Hero Badge'))}
            {renderFieldGroup('hero_title_1', t('دێڕی یەکەمی ناونیشان', 'العنوان الأول', 'Hero Title Line 1'))}
            {renderFieldGroup('hero_title_2', t('دێڕی دووەمی ناونیشان', 'العنوان الثاني', 'Hero Title Line 2'))}
            {renderFieldGroup('hero_subtitle', t('ژێرناونیشان', 'العنوان الفرعي', 'Hero Subtitle'))}
            {renderHeroImage()}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-primary">{t('بەشی خوارەوە', 'تذييل الموقع', 'Footer Section')}</h2>
            {renderFieldGroup('footer_about', t('دەربارە', 'نبذة عنا', 'About Text'))}
            {renderFieldGroup('contact_address', t('ناونیشان', 'العنوان', 'Address'))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-primary">{t('پەیوەندی و سۆشیاڵ', 'التواصل والشبكات الاجتماعية', 'Contact & Socials')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {renderSingleField('contact_phone', t('تەلەفۆن', 'الهاتف', 'Phone'))}
              {renderSingleField('contact_email', t('ئیمەیڵ', 'البريد الإلكتروني', 'Email'))}
              {renderSingleField('social_instagram', t('ئینستاگرام', 'انستغرام', 'Instagram URL'))}
              {renderSingleField('social_facebook', t('فەیسبووک', 'فيسبوك', 'Facebook URL'))}
              {renderSingleField('social_whatsapp', t('وەتسئەپ (ژمارە)', 'واتساب (رقم)', 'WhatsApp Number'))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-primary">{t('باکئاپی داتابەیس', 'النسخة الاحتياطية', 'Database Backup')}</h2>
            <div className="bg-card border border-border/50 p-4 md:p-6 rounded-2xl space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  'فایلێک دادەگریت کە هەموو داتاکانی فرۆشگاکەی تێدایە: بەرهەمەکان، بەشەکان، داواکارییەکان، هەژمارەکان و ڕێکخستنەکان. ماوە ماوە دایبگرە و لە شوێنێکی سەلامەت هەڵیبگرە — ئەگەر ڕۆژێک کێشەیەک ڕوویدا، بەم فایلە هەموو شتێک دەگەڕێتەوە.',
                  'يُنزّل ملفاً يحتوي كل بيانات المتجر: المنتجات والأقسام والطلبات والحسابات والإعدادات. نزّله من وقت لآخر واحفظه في مكان آمن — إذا حدثت مشكلة يوماً ما، يعيد هذا الملف كل شيء.',
                  'Downloads a file containing all your store data: products, categories, orders, accounts and settings. Download it from time to time and keep it somewhere safe — if anything ever goes wrong, this file brings everything back.'
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadBackup}
                disabled={downloadingBackup}
                className="h-11 rounded-full"
              >
                <Download className="w-4 h-4" />
                {downloadingBackup
                  ? t('چاوەڕوان بە...', 'انتظر...', 'Please wait...')
                  : t('داگرتنی باکئاپ', 'تنزيل النسخة الاحتياطية', 'Download Backup')}
              </Button>
            </div>
          </section>
        </div>

        <div className="flex justify-end mt-8 pb-12">
          <Button onClick={handleSave} disabled={updateSettings.isPending} className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20">
            {updateSettings.isPending ? t('چاوەڕوان بە...', 'جاري الحفظ...', 'Saving...') : t('پاشەکەوتکردن', 'حفظ التغييرات', 'Save Changes')}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
