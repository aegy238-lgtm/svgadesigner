
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Bot } from 'lucide-react';
import { getGiftRecommendation } from '../geminiService';
import { Product } from '../types';

interface AIConsultantProps {
  products: Product[];
  lang: 'ar' | 'en';
  onSelectProducts: (ids: string[]) => void;
}

const AIConsultant: React.FC<AIConsultantProps> = ({ products, lang, onSelectProducts }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ar: string, en: string} | null>(null);
  const isAr = lang === 'ar';

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const recommendation = await getGiftRecommendation(input, products);
      setResult({
        ar: recommendation.recommendationAr,
        en: recommendation.recommendationEn
      });
      onSelectProducts(recommendation.productIds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="h-32 w-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {isAr ? 'مساعد GoTher الذكي' : 'GoTher AI Assistant'}
            </h2>
            <p className="text-indigo-200 text-sm">
              {isAr ? 'دع الذكاء الاصطناعي يختار الهدية المثالية لك' : 'Let AI find the perfect animation for you'}
            </p>
          </div>
        </div>

        <form onSubmit={handleConsult} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAr ? 'صف ما تبحث عنه (مثلاً: هدية فخمة لدخول ملكي)...' : 'Describe what you need (e.g., Luxury gift for a royal entry)...'}
            className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/40"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {isAr ? 'اطلب نصيحة' : 'Get Advice'}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10 animate-fade-in">
            <p className="text-lg leading-relaxed">
              {isAr ? result.ar : result.en}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIConsultant;
