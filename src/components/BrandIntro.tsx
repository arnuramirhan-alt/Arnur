import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Dumbbell, BookOpen, HeartPulse, Check, Sparkles } from 'lucide-react';
import { BRAND_CODE } from '../brandCode';

interface BrandIntroProps {
  onClose?: () => void;
  showDismiss?: boolean;
}

export default function BrandIntro({ onClose, showDismiss = true }: BrandIntroProps) {
  return (
    <div id="brand-intro-section" className="liquid-glass liquid-glass-salad bg-noise rounded-3xl p-6 md:p-8 relative overflow-hidden">
      {/* Decorative gradients for premium quality glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-b from-salad-green/20 via-transparent to-transparent pointer-events-none filter blur-[40px]" />
      <div className="absolute bottom-0 left-0 w-80 h-40 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none filter blur-[40px]" />

      <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
        {/* Animated Brand Logo Container */}
        <div id="brand-logo-container" className="relative flex-shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center bg-gradient-to-tr from-black/50 via-salad-deep/20 to-salad-green/20 border border-salad-green/30 shadow-inner">
          <motion.div
            id="brand-logo-glowing-ring"
            className="absolute inset-0 rounded-full border border-salad-green/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            id="brand-logo-inner-ring"
            className="absolute inset-2 rounded-full border-2 border-dashed border-salad-green/25"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <div className="z-10 flex flex-col items-center justify-center">
            {/* The Associative Logo Visual: Circle + Leaf + AI spark */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-salad-green filter drop-shadow-[0_0_8px_rgba(84,211,27,0.4)]"
              >
                <Leaf className="w-12 h-12 stroke-[1.5]" />
              </motion.div>
              <div className="absolute -top-1 -right-1 text-salad-green animate-pulse">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
            </div>
            <span className="font-display font-bold text-center text-[10px] leading-none tracking-wider mt-2.5 text-white uppercase max-w-[85px]">
              AI Colori
            </span>
          </div>
        </div>

        {/* Brand Mission Description */}
        <div id="brand-mission-info" className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-salad-green/10 border border-salad-green/20 text-salad-green text-xs font-medium font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>БРЕНД-КОД 2026: {BRAND_CODE.name.toUpperCase()}</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
            {BRAND_CODE.tagline}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
            {BRAND_CODE.philosophy.core} Наша цель — развить у тебя здоровые, приятные пищевые привычки 
            и показать, как еда влияет на твою энергию, спортивные результаты и когнитивную выносливость.
          </p>
        </div>
      </div>

      {/* Brand principles grid */}
      <div id="brand-principles-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5 relative z-10">
        {BRAND_CODE.philosophy.principles.map((p, idx) => {
          const colors = [
            'from-salad-green/10 to-salad-green/5 border-salad-green/20 text-salad-green shadow-salad-green/5',
            'from-sky-400/10 to-sky-400/5 border-sky-400/20 text-sky-450 shadow-sky-450/5',
            'from-purple-400/10 to-purple-400/5 border-purple-400/20 text-purple-450 shadow-purple-450/5'
          ];
          const icons = [
            <HeartPulse className="w-5 h-5" />,
            <Sparkles className="w-5 h-5" />,
            <BookOpen className="w-5 h-5" />
          ];
          return (
            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/3 hover:bg-white/5 border border-white/5 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center flex-shrink-0 shadow-sm border ${colors[idx] || 'border-white/5 text-salad-green'}`}>
                {icons[idx] || <Leaf className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-sm text-white">{p.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe Teen Guard statement */}
      <div id="teen-safe-alert-badge" className="mt-6 flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 gap-4 relative z-10">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-3 h-3 rounded-full bg-salad-green animate-ping" />
          <p className="text-xs text-slate-300 leading-relaxed font-mono max-w-xl">
            ✓ <strong>Teen-Safe Протокол:</strong> Приложение полностью адаптировано для подростков. Без токсичных формул похудения, жестких калорийных лимитов и ограничений. Главное — это твое сбалансированное самочувствие.
          </p>
        </div>
        {showDismiss && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold font-mono text-black bg-salad-green hover:bg-salad-green/90 rounded-xl shadow-lg shadow-salad-green/10 transition-all duration-200 cursor-pointer"
          >
            Войти в экосистему
          </button>
        )}
      </div>
    </div>
  );
}
