import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  Sliders, 
  Sparkles, 
  Droplets, 
  Flame, 
  Utensils, 
  BookOpen, 
  User, 
  RefreshCw, 
  ChevronRight, 
  Info, 
  X, 
  MessageSquare, 
  Heart, 
  Smile,
  Check,
  AlertCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_CODE } from './brandCode';
import BrandIntro from './components/BrandIntro';
import { MealLog, UserProfile, FoodAnalysisResult, Ingredient } from './types';
import { GoogleGenAI } from '@google/generative-ai';

// Подтягиваем ключ из GitHub Secrets
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const aiInstance = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

const INITIAL_LOGS: MealLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    mealType: 'breakfast',
    mealName: 'Цельнозерновая овсянка с ягодами и семенами',
    estimatedWeight: '320г',
    calories: 380,
    proteins: 12,
    fats: 10,
    carbs: 58,
    ingredients: [
      { name: 'Овсяные хлопья хлопья', amount: '60г', calories: 210 },
      { name: 'Свежая малина и черника', amount: '50г', calories: 25 },
      { name: 'Семена чиа и тыквы', amount: '10г', calories: 55 },
      { name: 'Миндальное молоко', amount: '150мл', calories: 90 }
    ],
    advice: "Завтрак богат медленными углеводами и антиоксидантами. Это идеальное топливо для твоего мозга, которое поддержит концентрацию внимания на учебе в первой половине дня без резких скачков усталости."
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    mealType: 'lunch',
    mealName: 'Боул с киноа, запеченным лососем и авокадо',
    estimatedWeight: '350г',
    calories: 520,
    proteins: 28,
    fats: 22,
    carbs: 52,
    ingredients: [
      { name: 'Киноа отварной', amount: '150г', calories: 180 },
      { name: 'Филе лосося запеченное', amount: '100г', calories: 200 },
      { name: 'Половинка спелого авокадо', amount: '60г', calories: 100 },
      { name: 'Заправка лимонная с каплей масла', amount: '10г', calories: 40 }
    ],
    advice: "Невероятно сбалансированное блюдо! Омега-3 жирные кислоты из лосося и авокадо очень полезны для эластичности твоей кожи и укрепления нервной системы, а качественный белок поможет в быстром восстановлении мышц."
  }
];

const renderAvatarImg = (avatar: string | undefined, name: string, className: string = "w-10 h-10") => {
  if (avatar?.startsWith('preset:')) {
    const type = avatar.replace('preset:', '');
    let emoji = '🔮';
    let gradient = 'from-indigo-500 to-purple-500';
    if (type === 'fox') { emoji = '🦊'; gradient = 'from-orange-500 to-amber-400'; }
    else if (type === 'panda') { emoji = '🐼'; gradient = 'from-slate-700 to-zinc-500'; }
    else if (type === 'avocado') { emoji = '🥑'; gradient = 'from-emerald-500 to-teal-400'; }
    return (
      <div className={`${className} rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-sm shadow-sm flex-shrink-0 select-none overflow-hidden`}>
        <span className="leading-none scale-125">{emoji}</span>
      </div>
    );
  } else if (avatar) {
    return (
      <img src={avatar} alt={name} className={`${className} rounded-full object-cover border border-white/10 flex-shrink-0`} referrerPolicy="no-referrer" />
    );
  } else {
    const letter = name ? name.charAt(0).toUpperCase() : 'A';
    return (
      <div className={`${className} rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-semibold font-mono flex-shrink-0 select-none`}>
        {letter}
      </div>
    );
  }
};

const getAgeSuffix = (age: number) => {
  if (age >= 11 && age <= 14) return 'лет';
  const lastDigit = age % 10;
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
};

export default function App() {
  const [logs, setLogs] = useState<MealLog[]>(() => {
    const local = localStorage.getItem('nutra_logs');
    return local ? JSON.parse(local) : INITIAL_LOGS;
  });
  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const local = localStorage.getItem('nutra_water');
    return local ? Number(local) : 750;
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const local = localStorage.getItem('nutra_profile');
    if (local) { try { return JSON.parse(local); } catch (e) {} }
    return { name: "Алекс", age: 17, gender: 'unspecified', activityLevel: 'moderate', waterGoalML: 2000, waterIntakeML: 750 };
  });

  const [waterGoal, setWaterGoal] = useState<number>(() => Number(localStorage.getItem('nutra_water_goal')) || 2000);
  const [caloriesTarget, setCaloriesTarget] = useState<number>(() => Number(localStorage.getItem('nutra_calories_target')) || 2200);
  const [proteinTarget, setProteinTarget] = useState<number>(() => Number(localStorage.getItem('nutra_protein_target')) || 85);
  const [fatTarget, setFatTarget] = useState<number>(() => Number(localStorage.getItem('nutra_fat_target')) || 70);
  const [carbTarget, setCarbTarget] = useState<number>(() => Number(localStorage.getItem('nutra_carb_target')) || 290);

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showBrandIntro, setShowBrandIntro] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
    { sender: 'ai', text: 'Привет! Рад тебя видеть в NÚTRA. 🌿 Напиши мне любой вопрос о питании, энергии, спорте или витаминах. Мои рекомендации абсолютно безопасны, одобрены для твоего возраста, без жестких диет и вины за еду.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [safeAlert, setSafeAlert] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAvatarCameraOpen, setIsAvatarCameraOpen] = useState(false);
  const [avatarCameraError, setAvatarCameraError] = useState<string | null>(null);

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try { const local = localStorage.getItem('nutra_achievements'); return local ? JSON.parse(local) : []; } catch (e) { return []; }
  });
  const [activeAchievement, setActiveAchievement] = useState<{ type: 'water' | 'protein'; text: string } | null>(null);
  const [isFetchingAchievement, setIsFetchingAchievement] = useState(false);

  useEffect(() => { localStorage.setItem('nutra_achievements', JSON.stringify(unlockedAchievements)); }, [unlockedAchievements]);
  useEffect(() => { localStorage.setItem('nutra_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('nutra_water', String(waterIntake)); }, [waterIntake]);
  useEffect(() => { localStorage.setItem('nutra_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('nutra_water_goal', String(waterGoal)); }, [waterGoal]);
  useEffect(() => { localStorage.setItem('nutra_calories_target', String(caloriesTarget)); }, [caloriesTarget]);
  useEffect(() => { localStorage.setItem('nutra_protein_target', String(proteinTarget)); }, [proteinTarget]);
  useEffect(() => { localStorage.setItem('nutra_fat_target', String(fatTarget)); }, [fatTarget]);
  useEffect(() => { localStorage.setItem('nutra_carb_target', String(carbTarget)); }, [carbTarget]);

  const triggerAchievementCelebration = async (type: 'water' | 'protein') => {
    setIsFetchingAchievement(true);
    setActiveAchievement({ type, text: "NÚTRA AI настраивает персональный триггер вдохновения..." });
    try {
      if (!aiInstance) throw new Error("No AI");
      const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Ты — бережный ИИ-нутрициолог в приложении NÚTRA. Напиши краткое (1-2 предложения) поздравление для подростка по имени ${profile.name} (${profile.age} лет). Он выполнил норму по направлению: ${type === 'water' ? 'Вода' : 'Белок'}. Тон теплый, поддерживающий.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) { setActiveAchievement({ type, text: text.trim() }); } else { throw new Error("Empty"); }
    } catch (e) {
      setActiveAchievement({
        type,
        text: type === 'water' 
          ? `Ура! Ты достиг своей нормы воды за сегодня (${waterGoal} мл). 💧` 
          : `Супер! Дневная норма белка (${proteinTarget}г) восполнена. 🧠🏋️`
      });
    } finally { setIsFetchingAchievement(false); }
  };

  useEffect(() => {
    if (waterIntake >= waterGoal && !unlockedAchievements.includes('water')) {
      setUnlockedAchievements(prev => [...prev, 'water']); triggerAchievementCelebration('water');
    } else if (waterIntake < waterGoal && unlockedAchievements.includes('water')) {
      setUnlockedAchievements(prev => prev.filter(x => x !== 'water'));
    }
  }, [waterIntake, waterGoal]);

  useEffect(() => {
    const calcPro = logs.reduce((sum, log) => sum + log.proteins, 0);
    if (calcPro >= proteinTarget && !unlockedAchievements.includes('protein')) {
      setUnlockedAchievements(prev => [...prev, 'protein']); triggerAchievementCelebration('protein');
    } else if (calcPro < proteinTarget && unlockedAchievements.includes('protein')) {
      setUnlockedAchievements(prev => prev.filter(x => x !== 'protein'));
    }
  }, [logs, proteinTarget]);

  const startWebcam = async () => {
    stopAvatarCamera(); setIsWebcamOpen(true); setCapturedImage(null); setApiError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch (err) { setApiError("Камера недоступна."); setIsWebcamOpen(false); }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; }
    setIsWebcamOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current; canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); setCapturedImage(canvas.toDataURL('image/jpeg', 0.85)); stopWebcam(); }
    }
  };

  const startAvatarCamera = async () => {
    stopWebcam(); setIsAvatarCameraOpen(true); setAvatarCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 320 } });
      if (avatarVideoRef.current) { avatarVideoRef.current.srcObject = stream; avatarVideoRef.current.play(); }
    } catch (err) { setAvatarCameraError("Ошибка камеры аватара."); }
  };

  const stopAvatarCamera = () => {
    if (avatarVideoRef.current && avatarVideoRef.current.srcObject) { (avatarVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); avatarVideoRef.current.srcObject = null; }
    setIsAvatarCameraOpen(false);
  };

  const captureAvatarPhoto = () => {
    if (avatarVideoRef.current && avatarCanvasRef.current) {
      const size = Math.min(avatarVideoRef.current.videoWidth, avatarVideoRef.current.videoHeight) || 300;
      avatarCanvasRef.current.width = size; avatarCanvasRef.current.height = size;
      const ctx = avatarCanvasRef.current.getContext('2d');
      if (ctx) {
        const sx = (avatarVideoRef.current.videoWidth - size) / 2; const sy = (avatarVideoRef.current.videoHeight - size) / 2;
        ctx.drawImage(avatarVideoRef.current, sx, sy, size, size, 0, 0, size, size);
        setProfile(prev => ({ ...prev, avatar: avatarCanvasRef.current!.toDataURL('image/jpeg', 0.85) }));
        stopAvatarCamera(); setSafeAlert("📸 Аватар обновлен."); setTimeout(() => setSafeAlert(null), 3000);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { setCapturedImage(reader.result as string); setApiError(null); }; reader.readAsDataURL(file); }
  };

  const handleSelectPresetDemo = (presetName: string, description: string) => { setSelectedQuickPreset(presetName); setTextDescription(description); setCapturedImage(null); };

  const handleAnalyzeFood = async () => {
    setIsAnalyzing(true); setApiError(null); setAnalysisResult(null);
    try {
      if (!aiInstance) throw new Error('API ключ не активен.');
      const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
      const prompt = `Ты — ИИ-анализатор еды NÚTRA. Проанализируй блюдо: "${textDescription || selectedQuickPreset}". Верни СТРОГО JSON-объект:
      {"mealName": "Название", "estimatedWeight": "300г", "calories": 450, "proteins": 20, "fats": 15, "carbs": 55, "ingredients": [{"name": "Продукт", "amount": "100г", "calories": 120}], "teenFriendlyAdvice": "Совет без диет."}`;
      const result = await model.generateContent(prompt);
      setAnalysisResult(JSON.parse(result.response.text()));
    } catch (err) {
      setApiError('Использован локальный демо-анализ.');
      setAnalysisResult({
        mealName: textDescription || selectedQuickPreset || "Сбалансированное блюдо", estimatedWeight: "290г", calories: 430, proteins: 18, fats: 14, carbs: 52,
        ingredients: [{ name: "Свежие ингредиенты", amount: "200г", calories: 250 }],
        teenFriendlyAdvice: "Прекрасный выбор! Кушай с удовольствием и не забудь про воду."
      });
    } finally { setIsAnalyzing(false); }
  };

  const handleSaveMealToLog = () => {
    if (!analysisResult) return;
    const newLog: MealLog = { id: Date.now().toString(), timestamp: new Date().toISOString(), mealType, imageUrl: capturedImage || undefined, mealName: analysisResult.mealName, estimatedWeight: analysisResult.estimatedWeight, calories: analysisResult.calories, proteins: analysisResult.proteins, fats: analysisResult.fats, carbs: analysisResult.carbs, ingredients: analysisResult.ingredients, advice: analysisResult.teenFriendlyAdvice };
    setLogs([newLog, ...logs]); setAnalysisResult(null); setCapturedImage(null); setTextDescription(""); setSelectedQuickPreset(null);
  };

  const handleDeleteLog = (id: string) => setLogs(logs.filter(log => log.id !== id));

  const handleAddQuickCustom = (calories: number, name: string) => {
    const newLog: MealLog = { id: Date.now().toString(), timestamp: new Date().toISOString(), mealType: 'snack', mealName: name, estimatedWeight: '150г', calories, proteins: Math.round(calories * 0.05), fats: Math.round(calories * 0.03), carbs: Math.round(calories * 0.1), ingredients: [{ name, amount: "1 порция", calories }], advice: "Легкий перекус дает отличный заряд бодрости." };
    setLogs([newLog, ...logs]);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!chatInput.trim()) return;
    const userMsg = chatInput.trim(); setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]); setChatInput(""); setIsChatLoading(true);
    try {
      if (!aiInstance) throw new Error();
      const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Ответь на вопрос подростка о питании: "${userMsg}". Тон поддерживающий, краткий, без диет и ограничений.`;
      const result = await model.generateContent(prompt);
      setChatMessages(prev => [...prev, { sender: 'ai', text: result.response.text().trim() }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Отличный вопрос! Помни, что еда — это энергия, а разнообразие продуктов дарит силы для всех твоих планов. 🌿" }]);
    } finally { setIsChatLoading(false); }
  };

  const handleAutoCalculateGoals = () => {
    const activity = profile.activityLevel; const isMale = profile.gender === 'male';
    let kcal = 2200; let b = 95; let j = 72; let u = 290; let water = 2000;
    if (activity === 'low') { kcal = isMale ? 1850 : 1700; b = isMale ? 85 : 75; j = isMale ? 60 : 55; u = isMale ? 240 : 220; water = isMale ? 1800 : 1600; }
    else if (activity === 'high') { kcal = isMale ? 2600 : 2300; b = isMale ? 115 : 95; j = isMale ? 85 : 75; u = isMale ? 345 : 310; water = isMale ? 2800 : 2400; }
    setCaloriesTarget(kcal); setProteinTarget(b); setFatTarget(j); setCarbTarget(u); setWaterGoal(water); setProfile(prev => ({ ...prev, waterGoalML: water }));
    setSafeAlert(`✨ Нормы рассчитаны! Дневная цель: ${kcal} ккал.`); setTimeout(() => setSafeAlert(null), 4000);
  };

  const handleResetWater = () => { setWaterIntake(0); setSafeAlert("💧 Лог воды сброшен."); setTimeout(() => setSafeAlert(null), 3000); };
  const handleResetMeals = () => { setLogs([]); setSafeAlert("🥗 Дневник очищен."); setTimeout(() => setSafeAlert(null), 3000); };
  const handleResetAllData = () => { setLogs(INITIAL_LOGS); setWaterIntake(750); setWaterGoal(2000); setProfile({ name: "Алекс", age: 17, gender: 'unspecified', activityLevel: 'moderate', waterGoalML: 2000, waterIntakeML: 750 }); setCaloriesTarget(2200); setProteinTarget(85); setFatTarget(70); setCarbTarget(290); setShowResetConfirm(false); setSafeAlert("🌿 Все данные сброшены."); setTimeout(() => setSafeAlert(null), 3000); };

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const totalProteins = logs.reduce((sum, log) => sum + log.proteins, 0);
  const totalFats = logs.reduce((sum, log) => sum + log.fats, 0);
  const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);

  return (
    <div id="main-application-viewport" className="min-h-screen bg-[#050506] text-slate-100 flex flex-col font-sans">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[#050506]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-black text-xs">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{BRAND_CODE.name}</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Экосистема осознанного образа жизни 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBrandIntro(!showBrandIntro)} className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/5 text-white/65 hover:bg-white/10">Инфо</button>
          <button onClick={() => setShowSettings(!showSettings)} className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/5 text-white/65 hover:bg-white/10">Цели</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <AnimatePresence>{showBrandIntro && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><BrandIntro onClose={() => setShowBrandIntro(false)} showDismiss={true} /></motion.div>}</AnimatePresence>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="font-bold text-white">Настройки целей</h3>
                <button onClick={() => setShowSettings(false)} className="px-4 py-1.5 bg-emerald-500 text-black rounded-full text-xs font-bold">Готово</button>
              </div>
              {safeAlert && <div className="text-xs text-emerald-400 p-2 bg-emerald-500/10 rounded-xl">{safeAlert}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/60">Имя: <input type="text" value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} className="bg-black/40 border border-white/10 p-1.5 rounded-xl ml-2 text-white" /></label>
                  <div className="text-xs text-white/60">Возраст: {profile.age} <input type="range" min="12" max="21" value={profile.age} onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))} className="w-full accent-emerald-500" /></div>
                  <div className="flex gap-2 pt-2"><button onClick={handleResetWater} className="px-3 py-1 bg-white/5 text-xs rounded-lg">Сбросить воду</button><button onClick={handleResetMeals} className="px-3 py-1 bg-white/5 text-xs rounded-lg text-red-400">Очистить еду</button></div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-white/60">Цель калорий: {caloriesTarget} ккал <input type="range" min="1600" max="3200" step="50" value={caloriesTarget} onChange={(e) => setCaloriesTarget(Number(e.target.value))} className="w-full accent-emerald-500" /></div>
                  <div className="text-xs text-white/60">Цель воды: {waterGoal} мл <input type="range" min="1000" max="4000" step="100" value={waterGoal} onChange={(e) => setWaterGoal(Number(e.target.value))} className="w-full accent-emerald-500" /></div>
                  <button onClick={handleAutoCalculateGoals} className="w-full py-2 bg-white/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">Рассчитать нормы NÚTRA ✨</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-5 text-center">
              <span className="text-xs font-mono text-white/40 block uppercase">Калории за день</span>
              <span className="text-4xl font-bold text-white block my-2">{totalCalories}</span>
              <span className="text-xs font-mono text-white/40">из {caloriesTarget} ккал</span>
              <div className="mt-4 text-left text-xs space-y-1.5 font-mono text-white/60">
                <div>Б: {totalProteins}г / {proteinTarget}г</div>
                <div>Ж: {totalFats}г / {fatTarget}г</div>
                <div>У: {totalCarbs}г / {carbTarget}г</div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-5">
              <div className="flex justify-between items-center text-xs font-mono text-white/60 mb-2"><span>Вода:</span><span>{waterIntake} / {waterGoal} мл</span></div>
              <div className="flex gap-2"><button onClick={() => setWaterIntake(p => p + 250)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono">+250 мл</button><button onClick={() => setWaterIntake(p => p + 500)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono">+500 мл</button></div>
            </div>
          </aside>

          <section className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-xl font-bold text-white">ИИ-сканирование блюда</h2>
                <div className="flex bg-white/5 p-0.5 rounded-full text-xs">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(t => (
                    <button key={t} onClick={() => setMealType(t)} className={`px-2.5 py-1 rounded-full text-[10px] ${mealType === t ? 'bg-emerald-500 text-black font-bold' : 'text-white/60'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-[24px] p-4 text-center">
                {capturedImage ? (
                  <div className="relative"><img src={capturedImage} className="w-full h-40 object-cover rounded-xl" /><button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 bg-black p-1 rounded-full text-white">X</button></div>
                ) : (
                  <div className="text-xs text-white/40 py-4">
                    <button onClick={startWebcam} className="px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 text-white mr-2">Включить камеру</button>
                    <label className="px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 text-white cursor-pointer">Загрузить файл<input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" /></label>
                  </div>
                )}
                {isWebcamOpen && <div className="mt-2"><video ref={videoRef} className="w-full rounded-xl bg-black" playsInline /><button onClick={capturePhoto} className="mt-2 px-4 py-1.5 bg-emerald-500 text-black font-bold rounded-lg text-xs">Сделать снимок</button></div>}
              </div>

              <textarea placeholder="Опиши тарелку своими словами..." rows={2} value={textDescription} onChange={(e) => setTextDescription(e.target.value)} className="w-full bg-black/30 rounded-xl border border-white/5 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              
              <div className="flex gap-1.5 overflow-x-auto pb-1"><button onClick={() => handleSelectPresetDemo("Изумрудный Салат", "Свежий салат с перепелиными яйцами и авокадо")} className="px-2.5 py-1 bg-white/5 text-[10px] font-mono rounded-full text-white/60">🥗 Салат</button><button onClick={() => handleSelectPresetDemo("Овсяная Каша", "Овсяная каша с медом и бананом")} className="px-2.5 py-1 bg-white/5 text-[10px] font-mono rounded-full text-white/60">🥣 Овсянка</button></div>

              <button onClick={handleAnalyzeFood} disabled={isAnalyzing || (!capturedImage && !textDescription.trim() && !selectedQuickPreset)} className="w-full py-3.5 bg-emerald-500 text-black rounded-full font-bold text-xs hover:bg-emerald-400 disabled:opacity-30">
                {isAnalyzing ? "Нейросеть распознает..." : "Запустить ИИ-анализ"}
              </button>
              {apiError && <div className="text-[11px] text-red-400 bg-red-500/5 p-2 rounded-xl text-center">{apiError}</div>}
            </div>

            {analysisResult && (
              <div className="bg-white/[0.02] border border-emerald-500/20 rounded-[32px] p-5 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40 block">ИИ Распознал:</span>
                  <h4 className="text-base font-bold text-white">{analysisResult.mealName} ({analysisResult.estimatedWeight})</h4>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center bg-black/20 p-2 rounded-xl text-xs font-mono">
                  <div><div>Ккал</div><div className="font-bold text-white">{analysisResult.calories}</div></div>
                  <div><div>Б</div><div className="font-bold text-blue-400">{analysisResult.proteins}г</div></div>
                  <div><div>Ж</div><div className="font-bold text-amber-400">{analysisResult.fats}г</div></div>
                  <div><div>У</div><div className="font-bold text-teal-400">{analysisResult.carbs}г</div></div>
                </div>
                <div className="text-xs bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-slate-300"><strong className="text-emerald-400 block mb-1">Совет NÚTRA:</strong>{analysisResult.teenFriendlyAdvice}</div>
                <div className="flex gap-2"><button onClick={handleSaveMealToLog} className="flex-1 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl">Сохранить</button><button onClick={() => setAnalysisResult(null)} className="px-4 py-2 bg-white/5 text-xs rounded-xl">Сбросить</button></div>
              </div>
            )}

            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-5 flex flex-col gap-3">
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest">Чат-поддержка Colori AI</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto text-xs pr-1">
                {chatMessages.map((msg, i) => <div key={i} className={`p-2 rounded-xl max-w-[85%] ${msg.sender === 'ai' ? 'bg-white/5 text-slate-300 self-start' : 'bg-emerald-500/10 text-white ml-auto'}`}>{msg.text}</div>)}
                {isChatLoading && <div className="text-white/40 italic">Обдумываю ответ...</div>}
              </div>
              <form onSubmit={handleSendChatMessage} className="flex gap-2"><input type="text" placeholder="Задать вопрос..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-black/40 rounded-xl px-3 py-2 text-xs border border-white/5 text-white" /><button type="submit" disabled={!chatInput.trim() || isChatLoading} className="px-4 bg-emerald-500 text-black text-xs font-bold rounded-xl">Спросить</button></form>
            </div>
          </section>

          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-5 flex flex-col min-h-[300px]">
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest pb-2 border-b border-white/5 mb-2">Дневник еды</h3>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-60 text-xs">
                {logs.length === 0 ? <div className="text-white/20 text-center pt-8 font-mono">Пусто</div> : logs.map(log => (
                  <div key={log.id} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                    <div><div className="font-bold text-white max-w-[150px] truncate">{log.mealName}</div><div className="text-[10px] text-white/40 font-mono">{log.calories} ккал • Б:{log.proteins} Ж:{log.fats} У:{log.carbs}</div></div>
                    <button onClick={() => handleDeleteLog(log.id)} className="text-white/20 hover:text-red-400 p-1 font-mono">X</button>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-1 gap-1.5"><button onClick={() => handleAddQuickCustom(150, "Яблоко и Творог")} className="p-1.5 bg-white/5 text-[10px] text-left font-mono rounded-lg">🍎 Перекус (150 ккал)</button></div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="h-14 px-6 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-mono">
        <div>AI COLORI TRACKER • 2026</div>
      </footer>

      <AnimatePresence>
        {activeAchievement && (
          <div className="fixed inset-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-[#16161A] border border-white/10 rounded-[32px] p-6 max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">🏆</div>
              <h4 className="text-base font-bold text-white">Достижение!</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{activeAchievement.text}</p>
              <button onClick={() => setActiveAchievement(null)} className="w-full py-2.5 bg-emerald-500 text-black text-xs font-bold rounded-xl">Принять 😊</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
