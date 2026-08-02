import React from 'react';
import { toast } from 'sonner';
import { Flower2, Sparkles } from 'lucide-react';

type T = (ckb: string, ar: string, en: string) => string;

/** Warm, respectful welcome toasts shown right after login / registration. */
export function showWelcomeToast(t: T, name: string, firstTime: boolean) {
  if (firstTime) {
    toast.success(
      <span className="flex items-center gap-1.5 font-semibold">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        {t(
          `بەخێربێیت بۆ خێزانی مانگ هێرباڵ، بەڕێز ${name}`,
          `أهلاً وسهلاً بك في عائلة مانگ هيربال يا ${name}`,
          `Welcome to the Mang Herbal family, ${name}`
        )}
      </span>,
      {
        description: t(
          'زۆر دڵخۆشین بە بوونت لەگەڵمان. هیوادارین بەرهەمە سروشتییەکانمان جوانی و تەندروستیت پێ ببەخشن.',
          'يسعدنا انضمامك إلينا. نتمنى أن تمنحك منتجاتنا الطبيعية الجمال والصحة.',
          'We are delighted to have you with us. May our natural products bring you beauty and wellness.'
        ),
        duration: 7000,
      }
    );
  } else {
    toast.success(
      <span className="flex items-center gap-1.5 font-semibold">
        {t(`بەخێربێیتەوە بەڕێز ${name}`, `أهلاً بعودتك يا ${name}`, `Welcome back, ${name}`)}
        <Flower2 className="w-4 h-4 text-primary shrink-0" />
      </span>,
      { duration: 5000 }
    );
  }
}
