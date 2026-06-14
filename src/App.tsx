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

// Hardcoded initial preset meals so the tracker looks populated and exquisite from the start
const INITIAL_LOGS: MealLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours ago
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
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
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

// Helper to render Avatar visually
const renderAvatarImg = (avatar: string | undefined, name: string, className: string = "w-10 h-10") => {
  if (avatar?.startsWith('preset:')) {
    const type = avatar.replace('preset:', '');
    let emoji = '🔮';
    let gradient = 'from-indigo-500 to-purple-500';
    if (type === 'fox') {
      emoji = '🦊';
      gradient = 'from-orange-500 to-amber-400';
    } else if (type === 'panda') {
      emoji = '🐼';
      gradient = 'from-slate-700 to-zinc-500';
    } else if (type === 'avocado') {
      emoji = '🥑';
      gradient = 'from-emerald-500 to-teal-400';
    }
    return (
      <div className={`${className} rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-sm shadow-sm flex-shrink-0 select-none overflow-hidden`}>
        <span className="leading-none scale-125">{emoji}</span>
      </div>
    );
  } else if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${className} rounded-full object-cover border border-white/10 flex-shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  } else {
    // Default letter
    const letter = name ? name.charAt(0).toUpperCase() : 'A';
    return (
      <div className={`${className} rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-semibold font-mono flex-shrink-0 select-none`}>
        {letter}
      </div>
    );
  }
};

// Russian suffix helper for Age tracker
const getAgeSuffix = (age: number) => {
  if (age >= 11 && age <= 14) return 'лет';
  const lastDigit = age % 10;
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
};

export default function App() {
  // Application states
  const [logs, setLogs] = useState<MealLog[]>(() => {
    const local = localStorage.getItem('nutra_logs');
    return local ? JSON.parse(local) : INITIAL_LOGS;
  });

  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const local = localStorage.getItem('nutra_water');
    return local ? Number(local) : 750;
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const local = localStorage.getItem('nutra_profile');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: "Алекс",
      age: 17,
      gender: 'unspecified',
      activityLevel: 'moderate',
      waterGoalML: 2000,
      waterIntakeML: 750
    };
  });

  const [waterGoal, setWaterGoal] = useState<number>(() => {
    const local = localStorage.getItem('nutra_water_goal');
    return local ? Number(local) : 2000;
  });

  const [caloriesTarget, setCaloriesTarget] = useState<number>(() => {
    const local = localStorage.getItem('nutra_calories_target');
    return local ? Number(local) : 2200;
  });
  const [proteinTarget, setProteinTarget] = useState<number>(() => {
    const local = localStorage.getItem('nutra_protein_target');
    return local ? Number(local) : 85;
  });
  const [fatTarget, setFatTarget] = useState<number>(() => {
    const local = localStorage.getItem('nutra_fat_target');
    return local ? Number(local) : 70;
  });
  const [carbTarget, setCarbTarget] = useState<number>(() => {
    const local = localStorage.getItem('nutra_carb_target');
    return local ? Number(local) : 290;
  });

  // Interface view & flags
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showBrandIntro, setShowBrandIntro] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Quick helper custom meal text triggers to help simulation / use-cases
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<string | null>(null);

  // Active analysis results
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);

  // Nutrition AI supportive chat advisor
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
    { sender: 'ai', text: 'Привет! Рад тебя видеть в NÚTRA. 🌿 Напиши мне любой вопрос о питании, энергии, спорте или витаминах. Мои рекомендации абсолютно безопасны, одобрены для твоего возраста, без жестких диет и вины за еду.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Safe notification alerts
  const [safeAlert, setSafeAlert] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Webcam elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // User Profile Avatar Camera states and refs
  const [isAvatarCameraOpen, setIsAvatarCameraOpen] = useState(false);
  const [avatarCameraError, setAvatarCameraError] = useState<string | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Micro-achievements state
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem('nutra_achievements');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeAchievement, setActiveAchievement] = useState<{ type: 'water' | 'protein'; text: string } | null>(null);
  const [isFetchingAchievement, setIsFetchingAchievement] = useState(false);

  // Sync achievements list to localStorage
  useEffect(() => {
    localStorage.setItem('nutra_achievements', JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  // Persists states
  useEffect(() => {
    localStorage.setItem('nutra_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('nutra_water', String(waterIntake));
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem('nutra_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutra_water_goal', String(waterGoal));
  }, [waterGoal]);

  useEffect(() => {
    localStorage.setItem('nutra_calories_target', String(caloriesTarget));
  }, [caloriesTarget]);

  useEffect(() => {
    localStorage.setItem('nutra_protein_target', String(proteinTarget));
  }, [proteinTarget]);

  useEffect(() => {
    localStorage.setItem('nutra_fat_target', String(fatTarget));
  }, [fatTarget]);

  useEffect(() => {
    localStorage.setItem('nutra_carb_target', String(carbTarget));
  }, [carbTarget]);

  // Trigger custom AI congratulations and active overlay
  const triggerAchievementCelebration = async (type: 'water' | 'protein') => {
    setIsFetchingAchievement(true);
    setActiveAchievement({
      type,
      text: "NÚTRA AI настраивает персональный триггер вдохновения..."
    });

    try {
      const response = await fetch("/api/achievement-compliment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, profile })
      });
      const data = await response.json();
      if (data && data.compliment) {
        setActiveAchievement({ type, text: data.compliment });
      } else {
        throw new Error("Empty response");
      }
    } catch (e) {
      console.error("Failed to generate congratulations message through API:", e);
      setActiveAchievement({
        type,
        text: type === 'water'
          ? `Ура! Ты достиг своей нормы воды за сегодня (${waterGoal} мл). Твой организм наполнен чистой энергией для сияния кожи и ясного ума! 💧`
          : `Супер! Дневная норма белка (${proteinTarget}г) успешно восполнена. Ткани и мышцы получают отличный строительный материал для сил и фокуса! 🧠🏋️`
      });
    } finally {
      setIsFetchingAchievement(false);
    }
  };

  // Monitor water intake goal
  useEffect(() => {
    if (waterIntake >= waterGoal) {
      if (!unlockedAchievements.includes('water')) {
        setUnlockedAchievements(prev => [...prev, 'water']);
        triggerAchievementCelebration('water');
      }
    } else {
      // If client manually subtracted or reset, allow re-unlocking
      if (unlockedAchievements.includes('water')) {
        setUnlockedAchievements(prev => prev.filter(x => x !== 'water'));
      }
    }
  }, [waterIntake, waterGoal, unlockedAchievements]);

  // Monitor protein intake goal
  useEffect(() => {
    const calcPro = logs.reduce((sum, log) => sum + log.proteins, 0);
    if (calcPro >= proteinTarget) {
      if (!unlockedAchievements.includes('protein')) {
        setUnlockedAchievements(prev => [...prev, 'protein']);
        triggerAchievementCelebration('protein');
      }
    } else {
      // If client deleted meals or reset, allow re-unlocking
      if (unlockedAchievements.includes('protein')) {
        setUnlockedAchievements(prev => prev.filter(x => x !== 'protein'));
      }
    }
  }, [logs, proteinTarget, unlockedAchievements]);

  // Handle webcam start
  const startWebcam = async () => {
    // Stop avatar camera if active
    stopAvatarCamera();

    setIsWebcamOpen(true);
    setCapturedImage(null);
    setApiError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      setApiError("Не удалось получить доступ к камере. Попробуйте загрузить файл вручную.");
      setIsWebcamOpen(false);
    }
  };

  // Close webcam and stop tracks
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamOpen(false);
  };

  // Capture photo from canvas
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopWebcam();
      }
    }
  };

  // Start Camera for Avatar
  const startAvatarCamera = async () => {
    // Stop main meal scanning camera if active
    stopWebcam();
    
    setIsAvatarCameraOpen(true);
    setAvatarCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 320, height: 320 } 
      });
      if (avatarVideoRef.current) {
        avatarVideoRef.current.srcObject = stream;
        avatarVideoRef.current.play();
      }
    } catch (err: any) {
      console.error("Avatar camera access failed", err);
      setAvatarCameraError("Доступ к камере заблокирован или недоступен.");
    }
  };

  // Stop Avatar Camera
  const stopAvatarCamera = () => {
    if (avatarVideoRef.current && avatarVideoRef.current.srcObject) {
      const stream = avatarVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      avatarVideoRef.current.srcObject = null;
    }
    setIsAvatarCameraOpen(false);
  };

  // Capture Avatar snapshot
  const captureAvatarPhoto = () => {
    if (avatarVideoRef.current && avatarCanvasRef.current) {
      const video = avatarVideoRef.current;
      const canvas = avatarCanvasRef.current;
      
      const size = Math.min(video.videoWidth, video.videoHeight) || 300;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfile(prev => ({ ...prev, avatar: dataUrl }));
        stopAvatarCamera();
        
        setSafeAlert("📸 Отличный снимок! Твой аватар обновлен.");
        setTimeout(() => setSafeAlert(null), 3000);
      }
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setApiError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fast select a preset image so users can test immediately on UI Studio
  const handleSelectPresetDemo = (presetName: string, description: string) => {
    setSelectedQuickPreset(presetName);
    setTextDescription(description);
    // Mock bases or descriptions
    setCapturedImage(null);
  };

  // Trigger Gemini AI Food Analysis
  const handleAnalyzeFood = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    setAnalysisResult(null);

    try {
      const payload = {
        image: capturedImage, // base64 payload
        description: textDescription || selectedQuickPreset || "",
        mealType: mealType
      };

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Упс! Ошибка при анализе. Возможно сервер перезагружается, либо API ключ еще не активен.');
      }

      const data: FoodAnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Ошибка подключения к серверу. Был использован умный локальный анализ.');
      
      // Fallback in case of server timeouts
      setAnalysisResult({
        mealName: textDescription || "Сбалансированное блюдо",
        estimatedWeight: "290г",
        calories: 430,
        proteins: 18,
        fats: 14,
        carbs: 52,
        ingredients: [
          { name: "Свежие ингредиенты", amount: "200г", calories: 250 },
          { name: "Соус или заправка", amount: "90г", calories: 180 }
        ],
        teenFriendlyAdvice: "Прекрасный выбор! Это блюдо отлично наполняет твое тело здоровыми компонентами. Не забудь выпить стакан чистой воды в течение часа для поддержания идеального гидратационного баланса!"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save analyzed meal to daily logs
  const handleSaveMealToLog = () => {
    if (!analysisResult) return;

    const newLog: MealLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mealType: mealType,
      imageUrl: capturedImage || undefined,
      mealName: analysisResult.mealName,
      estimatedWeight: analysisResult.estimatedWeight,
      calories: analysisResult.calories,
      proteins: analysisResult.proteins,
      fats: analysisResult.fats,
      carbs: analysisResult.carbs,
      ingredients: analysisResult.ingredients,
      advice: analysisResult.teenFriendlyAdvice
    };

    setLogs([newLog, ...logs]);
    // reset scan fields
    setAnalysisResult(null);
    setCapturedImage(null);
    setTextDescription("");
    setSelectedQuickPreset(null);
  };

  // Delete log entry
  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  // Direct custom manual food log addition without image
  const handleAddQuickCustom = (calories: number, name: string) => {
    const proteins = Math.round(calories * 0.05);
    const fats = Math.round(calories * 0.03);
    const carbs = Math.round(calories * 0.1);
    
    const newLog: MealLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mealType: 'snack',
      mealName: name,
      estimatedWeight: '150г',
      calories: calories,
      proteins: proteins,
      fats: fats,
      carbs: carbs,
      ingredients: [{ name: name, amount: "1 порция", calories: calories }],
      advice: "Легкий перекус дает отличный заряд бодрости посреди дня. Слушай свое тело и кушай медленно, наслаждаясь каждым укусом."
    };
    setLogs([newLog, ...logs]);
  };

  // Advice chat interactions
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Prompt for smart healthy teenagers nutrition tips
      const contextMeals = logs.slice(0, 3).map(l => `${l.mealName} (${l.calories}ккал, Б:${l.proteins}г, Ж:${l.fats}г, У:${l.carbs}г)`).join(', ');
      
      const payload = {
        description: `Ответь на вопрос подростка на русском языке. Вопрос: "${userMsg}". Последние приемы пищи пользователя для контекста: ${contextMeals || 'пока нет логов'}. Фокусируйся абсолютно на позитивных привычках, сбалансированности, здоровье мозга, спорте, силе, энергии, БЕЗ диет, запретов, похудения и подсчетов. Тон нежный и поддерживающий. Выдавай краткий, приятный и стильный ответ.`,
        mealType: 'snack'
      };

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error();
      }

      const data: FoodAnalysisResult = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.teenFriendlyAdvice }]);
    } catch {
      // Support responses offline / quick templates
      let fallbackText = "Твой вопрос шикарен! Здоровый образ жизни — это в первую очередь гармония твоих мыслей и удовольствие от разнообразных продуктов. Помни о важности сытных завтраков со сложными углеводами, они защищают тебя от упадка сил на лекциях и тренировках!";
      if (userMsg.toLowerCase().includes("вод") || userMsg.toLowerCase().includes("пить")) {
        fallbackText = "Чистая вода — это супергерой твоего метаболизма! Она поставляет кислород клеткам, помогает сохранять свежесть кожи и избавляет от ложной усталости. Твоя норма около 1.5 - 2 литров в день.";
      } else if (userMsg.toLowerCase().includes("слад") || userMsg.toLowerCase().includes("шоколад") || userMsg.toLowerCase().includes("сахар")) {
        fallbackText = "Сладкое — это быстрый источник глюкозы, которая так нужна мозгу! Вкусности — это нормально, они дарят радость. Отличной практикой будет кушать сладкое сытым после основного обеда, чтобы энергия оставалась ровной и стабильной.";
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: fallbackText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auto calculate goals based on profile values
  const handleAutoCalculateGoals = () => {
    const activity = profile.activityLevel;
    const isMale = profile.gender === 'male';
    
    let kcal = 2100;
    let b = 85; // protein
    let j = 70; // fat
    let u = 280; // carbs
    let water = 2000;

    if (activity === 'low') {
      if (isMale) {
        kcal = 1850; b = 85; j = 60; u = 240; water = 1800;
      } else {
        kcal = 1700; b = 75; j = 55; u = 220; water = 1600;
      }
    } else if (activity === 'moderate') {
      if (isMale) {
        kcal = 2200; b = 95; j = 72; u = 290; water = 2200;
      } else {
        kcal = 1950; b = 82; j = 65; u = 260; water = 2000;
      }
    } else { // high
      if (isMale) {
        kcal = 2600; b = 115; j = 85; u = 345; water = 2800;
      } else {
        kcal = 2300; b = 95; j = 75; u = 310; water = 2400;
      }
    }

    // Protection to never set below 1600 kcal
    if (kcal < 1600) kcal = 1600;

    setCaloriesTarget(kcal);
    setProteinTarget(b);
    setFatTarget(j);
    setCarbTarget(u);
    setWaterGoal(water);
    setProfile(prev => ({ ...prev, waterGoalML: water }));
    
    setSafeAlert(`✨ Рассчитаны бережные ориентиры для твоей активности (${activity === 'low' ? 'Спокойная' : activity === 'moderate' ? 'Умеренная' : 'Высокая'}): ${kcal} ккал. Баланс БЖУ и воды согласован автоматически!`);
    
    setTimeout(() => {
      setSafeAlert(null);
    }, 6000);
  };

  // Reset water limits
  const handleResetWater = () => {
    setWaterIntake(0);
    setSafeAlert("💧 Лог выпитой воды за сегодня обновлен.");
    setTimeout(() => setSafeAlert(null), 3000);
  };

  // Reset meals logs
  const handleResetMeals = () => {
    setLogs([]);
    setSafeAlert("🥗 Все приемы пищи за сегодня удалены из дневника.");
    setTimeout(() => setSafeAlert(null), 3000);
  };

  // Restores standard preset defaults or wipes setup
  const handleResetAllData = () => {
    setLogs(INITIAL_LOGS);
    setWaterIntake(750);
    setWaterGoal(2000);
    setProfile({
      name: "Алекс",
      age: 17,
      gender: 'unspecified',
      activityLevel: 'moderate',
      waterGoalML: 2000,
      waterIntakeML: 750
    });
    setCaloriesTarget(2200);
    setProteinTarget(85);
    setFatTarget(70);
    setCarbTarget(290);
    setShowResetConfirm(false);
    setSafeAlert("🌿 Профиль и статистика успешно сброшены к стандартным значениям.");
    setTimeout(() => setSafeAlert(null), 4000);
  };

  // Calculations for daily margins
  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const totalProteins = logs.reduce((sum, log) => sum + log.proteins, 0);
  const totalFats = logs.reduce((sum, log) => sum + log.fats, 0);
  const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);

  const calPercentage = Math.min(Math.round((totalCalories / caloriesTarget) * 100), 100);
  const calStrokeOffset = 251.2 - (251.2 * calPercentage) / 100;

  return (
    <div id="main-application-viewport" className="min-h-screen bg-[#050506] bg-noise text-slate-100 flex flex-col font-sans selection:bg-salad-green/30 selection:text-white">
      
      {/* 2026 Header & Navigation */}
      <header id="header-brand" className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[#050506]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div id="glow-badge" className="relative w-10 h-10 bg-gradient-to-tr from-salad-green to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-salad-green/20">
            <span className="font-display font-black text-black text-xs tracking-tighter">AI</span>
            {/* Pulsing indicator */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-salad-green rounded-full border border-[#050506] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                {BRAND_CODE.name} <span id="logo-ai-tag" className="text-salad-green font-medium text-[10px] ml-1.5 font-mono px-1.5 py-0.5 rounded bg-salad-green/10 border border-salad-green/20">A_CODE</span>
              </h1>
            </div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">Экосистема осознанного образа жизни 2026</p>
          </div>
        </div>

        {/* Global info & toggles */}
        <div id="header-interactive-menu" className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => setShowBrandIntro(!showBrandIntro)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-mono flex items-center gap-1.5 transition-all ${showBrandIntro ? 'bg-salad-green/20 text-salad-green border border-salad-green/30 font-semibold' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Бренд-Код</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-mono flex items-center gap-1.5 transition-all ${showSettings ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Цели</span>
          </button>

          <div id="user-info-avatar" className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            {renderAvatarImg(profile.avatar, profile.name, "w-6 h-6")}
            <span className="text-xs text-white/80 font-medium font-mono">{profile.name} ({profile.age} {getAgeSuffix(profile.age)})</span>
          </div>
        </div>
      </header>

      {/* Main Container Core layout */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 overflow-x-hidden">
        
        {/* Brand-Code introduction collapsible panel */}
        <AnimatePresence>
          {showBrandIntro && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="liquid-glass bg-noise rounded-[32px] p-1.5 relative border border-salad-green/20">
                <button
                  onClick={() => setShowBrandIntro(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-all z-10"
                  title="Скрыть"
                >
                  <X className="w-4 h-4" />
                </button>
                <BrandIntro onClose={() => setShowBrandIntro(false)} showDismiss={false} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic target adjustments drawer/drawer-overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="liquid-glass bg-noise rounded-[32px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-salad-green/10 text-salad-green rounded-xl">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-white">Профиль пользователя и Цели</h3>
                    <p className="text-xs text-white/60">Личный кабинет AI Colori tracker — управляй своим балансом вкусно и осознанно</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2 bg-salad-green hover:bg-salad-green/95 text-black rounded-full text-xs font-semibold hover:scale-105 transition-all cursor-pointer shadow-lg shadow-salad-green/20"
                >
                  Готово
                </button>
              </div>

              {/* Safe alert banner */}
              {safeAlert && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-salad-green/10 border border-salad-green/20 text-salad-green text-xs rounded-2xl flex items-center gap-2.5 font-sans"
                >
                  <Sparkles className="w-4.5 h-4.5 text-salad-green flex-shrink-0 animate-pulse" />
                  <span>{safeAlert}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Part: Profile Fields */}
                <div className="lg:col-span-5 flex flex-col gap-5 border-r border-white/5 pr-0 lg:pr-8">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 font-bold">Личные данные</span>
                  
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-mono">Твое имя в приложении</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value || "Пользователь" }))}
                        className="w-full bg-black/30 rounded-xl border border-white/5 p-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/60 font-sans"
                        placeholder="Как тебя называть?"
                      />
                      <User className="w-4 h-4 text-white/30 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Выбор аватара */}
                  <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <label className="text-xs text-white/60 font-mono block">Твой аватар</label>
                    <div className="flex items-center gap-4">
                      {/* Current Avatar View */}
                      <div className="relative group flex-shrink-0">
                        {renderAvatarImg(profile.avatar, profile.name, "w-14 h-14")}
                        {profile.avatar && (
                          <button
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, avatar: undefined }))}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full transition-all border border-[#16161A] cursor-pointer"
                            title="Удалить аватар"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Options */}
                      <div className="flex-1 flex flex-col gap-2">
                        {/* Presets */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 font-mono">Пресеты:</span>
                          <div className="flex gap-2">
                            {[
                              { id: 'fox', emoji: '🦊', gradient: 'from-orange-500 to-amber-400' },
                              { id: 'panda', emoji: '🐼', gradient: 'from-slate-700 to-zinc-500' },
                              { id: 'avocado', emoji: '🥑', gradient: 'from-emerald-500 to-teal-400' }
                            ].map((preset) => {
                              const isSelected = profile.avatar === `preset:${preset.id}`;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setProfile(prev => ({ ...prev, avatar: `preset:${preset.id}` }))}
                                  className={`w-9 h-9 rounded-full bg-gradient-to-tr ${preset.gradient} flex items-center justify-center text-lg hover:scale-105 transition-all relative cursor-pointer ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#16161A]' : 'opacity-70 hover:opacity-100'}`}
                                  title={`Выбрать ${preset.id}`}
                                >
                                  <span className="leading-none">{preset.emoji}</span>
                                  {isSelected && (
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 text-white">
                                      <Check className="w-2.5 h-2.5 stroke-[3px]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom actions: File upload & camera */}
                        <div className="flex items-center gap-2">
                          {/* File input (Hidden) */}
                          <input
                            type="file"
                            id="avatar-file-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setProfile(prev => ({ ...prev, avatar: reader.result as string }));
                                    setSafeAlert("📸 Твой аватар успешно загружен с устройства!");
                                    setTimeout(() => setSafeAlert(null), 3000);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="avatar-file-upload"
                            className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[11px] font-sans text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/5"
                          >
                            <Upload className="w-3.5 h-3.5 text-white/40" />
                            <span>Файл</span>
                          </label>

                          {/* Camera session */}
                          <button
                            type="button"
                            onClick={() => startAvatarCamera()}
                            className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[11px] font-sans text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/5 hover:text-white"
                          >
                            <Camera className="w-3.5 h-3.5 text-white/40" />
                            <span>Камера</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Inline Avatar Camera Capture Container */}
                    {isAvatarCameraOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 overflow-hidden bg-black/40 rounded-2xl border border-white/5 p-3 flex flex-col gap-2"
                      >
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                          <video
                            ref={avatarVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover rounded-xl"
                          />
                          {/* Capture overlay target */}
                          <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-xl pointer-events-none flex items-center justify-center">
                            <div className="w-20 h-20 border border-emerald-400/40 rounded-full" />
                          </div>
                        </div>

                        {avatarCameraError && (
                          <p className="text-[10px] text-red-400 font-sans">{avatarCameraError}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={captureAvatarPhoto}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Сделать снимок</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopAvatarCamera}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs transition-all cursor-pointer hover:text-white"
                          >
                            Отмена
                          </button>
                        </div>
                        <canvas ref={avatarCanvasRef} className="hidden" />
                      </motion.div>
                    )}
                  </div>

                  {/* Age Selector */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-white/60 font-mono">
                      <span>Твой возраст</span>
                      <span className="text-emerald-400 font-bold">{profile.age} лет / года</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="21"
                      step="1"
                      value={profile.age}
                      onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <p className="text-[10px] text-white/30 leading-relaxed italic">
                      * NÚTRA настроена на потребности подростков и лиц проходящих фазу активного роста тела и мозга (12-21 год).
                    </p>
                  </div>

                  {/* Biological Gender Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-mono block">Биологический пол</label>
                    <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl">
                      {(['male', 'female', 'unspecified'] as const).map((genderOption) => {
                        const labels: Record<string, string> = {
                          male: "Парень ♂",
                          female: "Девушка ♀",
                          unspecified: "Не указан"
                        };
                        return (
                          <button
                            key={genderOption}
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, gender: genderOption }))}
                            className={`py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${profile.gender === genderOption ? 'bg-white/10 text-white font-bold' : 'text-white/40 hover:text-white/70'}`}
                          >
                            {labels[genderOption]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity Level Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 font-mono block">Уровень дневной активности</label>
                    <div className="flex flex-col gap-1.5">
                      {(['low', 'moderate', 'high'] as const).map((level) => {
                        const headings: Record<string, string> = {
                          low: "Низкая активность",
                          moderate: "Умеренная активность",
                          high: "Высокая активность"
                        };
                        const descs: Record<string, string> = {
                          low: "Сидячий образ жизни, спокойный день, учеба в школе или вузе",
                          moderate: "Хобби, прогулки, 1-2 тренировки в неделю, активная ходьба",
                          high: "Спортивные секции, интенсивная подготовка, танцы, кроссфит"
                        };
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, activityLevel: level }))}
                            className={`p-3 rounded-2xl flex flex-col text-left transition-all border ${profile.activityLevel === level ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-black/20 border-white/5 text-white/50 hover:bg-black/40 hover:text-white/80'}`}
                          >
                            <span className="text-xs font-bold font-sans">{headings[level]}</span>
                            <span className="text-[10px] mt-0.5 normal-case font-light leading-relaxed">{descs[level]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save and Run Autocalculation button */}
                  <button
                    type="button"
                    onClick={handleAutoCalculateGoals}
                    className="w-full mt-2 py-3 bg-white/5 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 border border-emerald-500/10 rounded-2xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer py-3"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Рассчитать бережные нормы NÚTRA ✨</span>
                  </button>

                </div>

                {/* Right Part: Target Metrics Settings */}
                <div className="lg:col-span-7 flex flex-col gap-5 justify-between">
                  <div className="flex flex-col gap-5">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 font-bold">Ориентиры Питания и Гидратации</span>
                    
                    {/* Calories targets */}
                    <div className="space-y-2 bg-black/10 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-white/80 font-mono">Базовая энергия в день (Калории)</label>
                        <span className="text-emerald-400 font-bold font-mono">{caloriesTarget} ккал</span>
                      </div>
                      <input 
                        type="range" min="1500" max="3200" step="50" 
                        value={caloriesTarget} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val < 1600) {
                            setCaloriesTarget(1600);
                            setSafeAlert("🛡️ NÚTRA Безопасность: Мы установили физиологический порог не ниже 1600 ккал для здоровой работы твоего организма!");
                          } else {
                            setCaloriesTarget(val);
                          }
                        }}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <p className="text-[9px] text-white/40 italic leading-relaxed">
                        * Чтобы защитить тебя от нежелательного дефицита, NÚTRA блокирует установку целей меньше 1600 ккал.
                      </p>
                    </div>

                    {/* Macronutrient targets selection slider */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Proteins */}
                      <div className="space-y-1.5 bg-black/10 p-3.5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-blue-400">Белки (Б)</span>
                          <span className="font-bold text-white">{proteinTarget}г</span>
                        </div>
                        <input 
                          type="range" min="40" max="150" step="5" 
                          value={proteinTarget} 
                          onChange={(e) => setProteinTarget(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
                        />
                      </div>

                      {/* Fats */}
                      <div className="space-y-1.5 bg-black/10 p-3.5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-amber-400">Жиры (Ж)</span>
                          <span className="font-bold text-white">{fatTarget}г</span>
                        </div>
                        <input 
                          type="range" min="30" max="110" step="5" 
                          value={fatTarget} 
                          onChange={(e) => setFatTarget(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                      </div>

                      {/* Carbs */}
                      <div className="space-y-1.5 bg-black/10 p-3.5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-teal-400">Углеводы (У)</span>
                          <span className="font-bold text-white">{carbTarget}г</span>
                        </div>
                        <input 
                          type="range" min="150" max="450" step="10" 
                          value={carbTarget} 
                          onChange={(e) => setCarbTarget(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-400"
                        />
                      </div>

                    </div>

                    {/* Water Goals slider */}
                    <div className="space-y-2 bg-black/10 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-white/80 font-mono flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-400" />
                          <span>Дневная цель воды</span>
                        </label>
                        <span className="font-bold font-mono text-sky-400">{waterGoal} мл</span>
                      </div>
                      <input 
                        type="range" min="1000" max="4000" step="100" 
                        value={waterGoal} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWaterGoal(val);
                          setProfile(prev => ({ ...prev, waterGoalML: val }));
                        }}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                    </div>

                  </div>

                  {/* Clean up stats and diagnostics */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 block">Очистка данных и диагностика</span>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleResetWater}
                        className="px-3.5 py-2 bg-white/5 hover:bg-sky-500/10 text-sky-300 rounded-xl text-xs font-sans transition-all border border-white/5 flex items-center gap-1 cursor-pointer"
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Сбросить воду</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetMeals}
                        className="px-3.5 py-2 bg-white/5 hover:bg-red-500/10 text-red-300 rounded-xl text-xs font-sans transition-all border border-white/5 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Очистить дневник еды</span>
                      </button>

                      {!showResetConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(true)}
                          className="px-3.5 py-2 bg-red-950/20 hover:bg-red-900/40 text-red-100 rounded-xl text-xs font-sans font-bold transition-all border border-red-500/20 cursor-pointer"
                        >
                          Сбросить всё
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResetAllData}
                            className="px-3.5 py-2 bg-red-650 text-white rounded-xl text-xs font-bold font-sans hover:bg-red-500 transition-all cursor-pointer bg-red-600"
                          >
                            Да, сбросить profile & logs
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="px-2.5 py-2 bg-white/10 text-white/80 rounded-xl text-xs font-sans hover:bg-white/20 transition-all cursor-pointer"
                          >
                            Отмена
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3-Column Architecture */}
        <div id="full-grid-columns" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Daily balance progress gauges & Water tracking */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Circular Calorie Gauge Card */}
            <div id="cal-gauge-card" className="liquid-glass liquid-glass-salad bg-noise rounded-[32px] p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-salad-green/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-700" />
              
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest font-mono">Твой Баланс</h3>
                <span className="text-[10px] bg-salad-green/10 text-salad-green font-mono px-1.5 py-0.5 rounded font-bold uppercase">Активно</span>
              </div>
              
              <div className="relative h-36 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle 
                    cx="56" cy="56" r="50" 
                    stroke="currentColor" strokeWidth="6" 
                    fill="transparent" className="text-white/[0.04]" 
                  />
                  <circle 
                    cx="56" cy="56" r="50" 
                    stroke="currentColor" strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray="314" 
                    strokeDashoffset={314 - (314 * Math.min(totalCalories, caloriesTarget)) / caloriesTarget} 
                    strokeLinecap="round"
                    className="text-salad-green transition-all duration-500 filter drop-shadow-[0_0_8px_rgba(84,211,27,0.3)]" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-white tracking-tighter">{totalCalories}</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">из {caloriesTarget} ккал</span>
                </div>
              </div>

              {/* Advanced Nutrient Bars */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-white/60">Белки</span>
                    <span className="text-blue-400 font-semibold">{totalProteins}г / {proteinTarget}г</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 transition-all" 
                      style={{ width: `${Math.min((totalProteins / proteinTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-white/60">Жиры</span>
                    <span className="text-amber-400 font-semibold">{totalFats}г / {fatTarget}г</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all" 
                      style={{ width: `${Math.min((totalFats / fatTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-white/60">Углеводы</span>
                    <span className="text-teal-400 font-semibold">{totalCarbs}г / {carbTarget}г</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-400 transition-all" 
                      style={{ width: `${Math.min((totalCarbs / carbTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Water Hydration Card */}
            <div id="water-tracker-card" className="liquid-glass liquid-glass-blue bg-noise rounded-[32px] p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest font-mono">Гидратация</h3>
                </div>
                <span className="text-xs font-bold font-mono text-sky-400">{waterIntake} / {waterGoal} мл</span>
              </div>

              {/* Water Visual progress fluid bar */}
              <div className="relative h-4 bg-sky-950/40 rounded-full overflow-hidden border border-sky-900/20 z-10">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 z-10">
                <button
                  onClick={() => setWaterIntake(prev => prev + 250)}
                  className="py-2.5 px-3 bg-white/5 hover:bg-sky-500/10 hover:text-sky-300 rounded-2xl text-xs font-medium font-mono text-white/80 transition-all border border-white/5 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>+250 мл</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-400/80" />
                </button>
                <button
                  onClick={() => setWaterIntake(prev => prev + 500)}
                  className="py-2.5 px-3 bg-white/5 hover:bg-sky-500/15 hover:text-sky-300 rounded-2xl text-xs font-medium font-mono text-white/80 transition-all border border-white/5 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>+500 мл</span>
                  <Droplets className="w-4 h-4 text-sky-400" />
                </button>
              </div>

              <button
                onClick={() => setWaterIntake(0)}
                className="text-[10px] text-white/30 hover:text-white/50 text-center font-mono hover:underline z-10 cursor-pointer"
              >
                Сбросить лог воды
              </button>
            </div>

            {/* Teen Safe Supportive Vibe Info */}
            <div id="teen-safe-slogan-card" className="liquid-glass bg-noise rounded-[32px] p-5 border border-salad-green/20 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-salad-green/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-salad-green z-10">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-widest font-mono">Философия Colori</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light z-10">
                Калории — это не враги! Это чистая жизненная энергия для твоего танца, заездов на скейте, 
                подготовки к экзаменам и активного роста. Мы ценим твои усилия и не ограничиваем порции. ✨
              </p>
            </div>
          </aside>

          {/* CENTRAL COLUMN: The Core Food scanner, Analyzer & Results summary */}
          <section className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Interactive Upload, Live camera block */}
            <div id="central-scanner-box" className="liquid-glass bg-noise rounded-[40px] p-6 md:p-8 relative overflow-hidden flex flex-col gap-6 border border-white/5">
              
              {/* Futuristic matrix alignment background */}
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <svg width="100%" height="100%" fill="none">
                  <pattern id="light-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#light-grid)" />
                </svg>
              </div>

              {/* Title & Meal selection row */}
              <div className="z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light font-display text-white">Умное ИИ-сканирование порции</h2>
                  <p className="text-xs text-white/40 font-sans mt-0.5">Исследуй блюдо по фото, видеокамере или описанию</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-full border border-white/5 self-start">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => {
                    const labels: Record<string, string> = {
                      breakfast: 'Завтрак',
                      lunch: 'Обед',
                      dinner: 'Ужин',
                      snack: 'Перекус'
                    };
                    return (
                      <button
                        key={t}
                        onClick={() => setMealType(t)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium font-mono transition-all cursor-pointer ${mealType === t ? 'bg-salad-green text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                      >
                        {labels[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Large interactive camera visual field */}
              <div className="z-10 bg-black/40 border border-white/5 rounded-[32px] p-4 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                
                {isWebcamOpen ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    <video 
                      ref={videoRef} 
                      className="w-full max-w-sm rounded-2xl bg-black border border-white/10"
                      playsInline
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={capturePhoto}
                        className="px-6 py-2 bg-salad-green hover:bg-salad-green/90 text-black font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Сделать снимок</span>
                      </button>
                      <button
                        onClick={stopWebcam}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : capturedImage ? (
                  <div className="relative w-full max-w-sm flex flex-col items-center gap-2">
                    <img 
                      src={capturedImage} 
                      alt="Captured dish" 
                      className="w-full h-48 object-cover rounded-2xl border border-white/10" 
                    />
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-black/100 text-white p-1 rounded-full transition-all border border-white/10 cursor-pointer"
                      title="Удалить фото"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-salad-green font-mono font-bold">Фото готово к анализу ✓</span>
                  </div>
                ) : (
                  <div className="text-center py-6 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center p-2 text-white/40">
                      <Utensils className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-white/90">Покажи нам свой обед</p>
                      <p className="text-xs text-white/40 max-w-xs mx-auto">
                        Загрузи готовый файл, воспользуйся веб-камерой или просто введи описание ниже для мгновенной оценки ИИ.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={startWebcam}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white hover:text-salad-green rounded-xl text-xs font-medium font-mono border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-4.5 h-4.5" />
                        <span>Камера</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium font-mono border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-4.5 h-4.5" />
                        <span>Загрузить фото</span>
                      </button>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                )}
                
                {/* Hidden snapshot canvas */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* TextInput / Prompt section */}
              <div className="z-10 space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-widest font-mono">Текстовое описание или дополнение (необязательно)</label>
                <textarea
                  placeholder="Например: 'Блюдо из спагетти с томатами и сыром пармезан' или 'Салат цезарь с сухариками и куриной грудкой'"
                  rows={2}
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  className="w-full bg-black/30 rounded-2xl border border-white/5 p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-salad-green/50 resize-none font-sans"
                />
              </div>

              {/* Quick simulation presets */}
              <div className="z-10 flex flex-col gap-2">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Попробовать примеры (Демо-клики):</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSelectPresetDemo("Изумрудный Салат", "Свежий салат с перепелиными яйцами и авокадо")}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${selectedQuickPreset === "Изумрудный Салат" ? 'bg-salad-green/20 text-salad-green border border-salad-green/35' : 'bg-white/5 text-white/50 border border-transparent'}`}
                  >
                    🥗 Салат с авокадо
                  </button>
                  <button
                    onClick={() => handleSelectPresetDemo("Овсяная Каша", "Овсяная каша с медом, арахисовой пастой и бананом")}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${selectedQuickPreset === "Овсяная Каша" ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/50 border border-transparent'}`}
                  >
                    🥣 Овсянка с медом
                  </button>
                  <button
                    onClick={() => handleSelectPresetDemo("Пицца Маргарита", "Домашняя пицца Маргарита с томатами")}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${selectedQuickPreset === "Пицца Маргарита" ? 'bg-[#AF4328]/10 text-red-400 border border-[#AF4328]/20' : 'bg-white/5 text-white/50 border border-transparent'}`}
                  >
                    🍕 Домашняя пицца
                  </button>
                </div>
              </div>

              {/* Action scanner button */}
              <div className="z-10 pt-4 border-t border-white/5 flex gap-4 items-center">
                <button
                  onClick={handleAnalyzeFood}
                  disabled={isAnalyzing || (!capturedImage && !textDescription.trim() && !selectedQuickPreset)}
                  className="flex-1 py-4 bg-salad-green hover:bg-salad-green/90 text-black rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:hover:bg-salad-green shadow-xl shadow-salad-green/10 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Нейросеть распознает...</span>
                    </>
                  ) : (
                    <>
                      <span>Запустить ИИ-анализ</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Error reporting badge */}
              {apiError && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
            </div>

            {/* AI ANALYSIS SUCCESS RESULT DETAILS CARD */}
            <AnimatePresence>
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="liquid-glass bg-noise rounded-[36px] p-6 flex flex-col gap-5 relative border border-salad-green/30"
                >
                  <div className="absolute top-4 right-4 text-[10px] uppercase font-mono bg-salad-green/10 text-salad-green border border-salad-green/20 px-2.5 py-1 rounded-full font-bold">
                    Результат готов
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest block">ИИ Распознал блюдо:</span>
                    <h3 className="text-xl font-bold text-white select-text">{analysisResult.mealName}</h3>
                    <div className="flex gap-4 text-xs font-mono text-white/60">
                      <span>Вес порции: <strong className="text-white">{analysisResult.estimatedWeight}</strong></span>
                      <span>•</span>
                      <span>Класс: <strong className="text-white capitalize">{mealType === 'breakfast' ? 'Завтрак' : mealType === 'lunch' ? 'Обед' : mealType === 'dinner' ? 'Ужин' : 'Перекус'}</strong></span>
                    </div>
                  </div>

                  {/* Macros Circle badges */}
                  <div className="grid grid-cols-4 gap-2.5 bg-black/20 p-4 rounded-3xl border border-white/5">
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase font-mono">Калории</p>
                      <p className="text-xl font-bold font-display text-white mt-1">{analysisResult.calories} <span className="text-[10px] text-white/40 font-normal">ккал</span></p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-mono">Белки</p>
                      <p className="text-lg font-bold text-blue-400 mt-1">{analysisResult.proteins} <span className="text-[10px] text-white/40 font-normal">г</span></p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-mono">Жиры</p>
                      <p className="text-lg font-bold text-amber-400 mt-1">{analysisResult.fats} <span className="text-[10px] text-white/40 font-normal">г</span></p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-mono">Углеводы</p>
                      <p className="text-lg font-bold text-teal-400 mt-1">{analysisResult.carbs} <span className="text-[10px] text-white/40 font-normal">г</span></p>
                    </div>
                  </div>

                  {/* List of components ingredients */}
                  {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Оцененный состав ингредиентов:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {analysisResult.ingredients.map((ing, idx) => (
                          <div key={idx} className="flex justify-between items-center px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                            <span className="text-white/80 font-medium">{ing.name}</span>
                            <span className="text-white/40 font-mono">{ing.amount} • {ing.calories} ккал</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supportive adolescent advice panel */}
                  <div className="p-4 rounded-2xl bg-salad-green/5 border border-salad-green/10 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-salad-green/10 flex items-center justify-center text-salad-green flex-shrink-0">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-salad-green uppercase tracking-widest font-mono">Забота и Энергетика</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{analysisResult.teenFriendlyAdvice}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveMealToLog}
                      className="flex-1 py-3 bg-salad-green hover:bg-salad-green/90 text-black font-semibold rounded-2xl transition-all duration-200 text-xs text-center cursor-pointer shadow-lg shadow-salad-green/10"
                    >
                      Сохранить в Дневник Питания
                    </button>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-2xl text-xs font-mono transition-all cursor-pointer"
                    >
                      Сбросить
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INTERACTIVE TEEN NUTRITION CHAT SUPPORT BOT */}
            <div id="ai-chat-card-panel" className="liquid-glass bg-noise rounded-[36px] p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-salad-green animate-pulse" />
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest font-mono">Бережная Поддержка Colori AI</h3>
                </div>
                <span className="text-[9px] font-mono opacity-50 bg-white/5 px-2 py-0.5 rounded">Помощник активен</span>
              </div>

              {/* Chat feed messages */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 flex flex-col gap-1 z-10">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'ai' ? 'bg-white/5 text-slate-200 self-start border border-white/5' : 'bg-salad-green/15 text-white self-end border border-salad-green/20'}`}
                  >
                    <p className="font-sans">{msg.text}</p>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="bg-white/5 text-slate-400 max-w-[80%] rounded-2xl p-3 text-xs self-start italic animate-pulse">
                    Colori AI обдумывает бережный ответ...
                  </div>
                )}
              </div>

              {/* Chat action form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 z-10">
                <input
                  type="text"
                  placeholder="Задать вопрос про пользу еды, сон, воду, баланс..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-black/40 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 border border-white/5 focus:outline-none focus:ring-1 focus:ring-salad-green/50 font-sans"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-3 bg-salad-green hover:bg-salad-green/90 text-black rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Спросить
                </button>
              </form>

              {/* Safe Teen Guard statement tags */}
              <div className="flex gap-3 justify-center text-[10px] text-white/30 font-mono z-10">
                <span>🛡️ Без дефицитов</span>
                <span>•</span>
                <span>🧠 Фокус на энергии</span>
                <span>•</span>
                <span>🧘 Развитие интуиции</span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Today's dynamic logs timeline feed & Mood logs */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Feed timeline container */}
            <div id="dynamic-log-panel" className="liquid-glass bg-noise rounded-[32px] flex flex-col min-h-[400px] border border-white/5 relative overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center z-10">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 font-mono">Дневник Питания</h3>
                <span className="text-xs font-mono text-salad-green bg-salad-green/10 px-2 py-0.5 rounded font-bold">{logs.length}</span>
              </div>

              {/* Timeline scroll container */}
              <div className="flex-1 p-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="flex-1 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-white/20 p-6 text-center">
                    <Utensils className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-mono uppercase tracking-widest font-normal">Дневник пуст</p>
                    <p className="text-[10px] mt-1 normal-case leading-relaxed font-sans max-w-[150px]">
                      Просканируй свое первое блюдо сверху!
                    </p>
                  </div>
                ) : (
                  logs.map((log) => {
                    const initials: Record<string, string> = {
                      breakfast: 'З',
                      lunch: 'О',
                      dinner: 'У',
                      snack: 'П'
                    };
                    const colorClasses: Record<string, string> = {
                      breakfast: 'bg-orange-500/20 text-orange-400',
                      lunch: 'bg-blue-500/20 text-blue-400',
                      dinner: 'bg-purple-500/20 text-purple-400',
                      snack: 'bg-emerald-500/20 text-emerald-400'
                    };
                    return (
                      <div key={log.id} className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${colorClasses[log.mealType] || 'bg-slate-500/20'}`}>
                            {initials[log.mealType] || 'П'}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-white/95 line-clamp-1">{log.mealName}</h4>
                            <p className="text-[9px] text-white/40 font-mono mt-0.5">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.calories} ккал
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 px-1.5 bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 rounded-lg transition-all"
                            title="Удалить запись"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {/* Short nutrient description dots */}
                        <div className="flex gap-2 text-[9px] text-white/50 font-mono bg-black/20 px-2 py-1 rounded">
                          <span>Б: <strong>{log.proteins}г</strong></span>
                          <span>🥑 Ж: <strong>{log.fats}г</strong></span>
                          <span>🌾 У: <strong>{log.carbs}г</strong></span>
                          <span>Вес: <strong>{log.estimatedWeight}</strong></span>
                        </div>

                        {/* Collapsible tiny advice badge */}
                        <p className="text-[10px] text-slate-300 leading-relaxed font-light italic mt-1 border-t border-white/5 pt-1.5 font-sans">
                          «{log.advice}»
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Direct manual log add widgets */}
              <div id="quick-manual-adds" className="p-4 border-t border-white/5 flex flex-col gap-2 bg-black/10">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Быстро добавить перекус:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddQuickCustom(150, "Яблоко и Творожный сырок")}
                    className="py-1 px-2.5 bg-white/5 hover:bg-salad-green/10 rounded-xl text-[10px] font-mono text-white/80 text-left transition-all cursor-pointer"
                  >
                    🍎 Яблоко + творог (150 ккал)
                  </button>
                  <button
                    onClick={() => handleAddQuickCustom(240, "Орехи и сухофрукты")}
                    className="py-1 px-2.5 bg-white/5 hover:bg-salad-green/10 rounded-xl text-[10px] font-mono text-white/80 text-left transition-all cursor-pointer"
                  >
                    🥜 Горсть кешью (240 ккал)
                  </button>
                </div>
              </div>
            </div>

            {/* Mood of the Day & Energy Tracker widget */}
            <div id="mood-tracker-widget" className="liquid-glass bg-noise rounded-[32px] p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-salad-green/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-end z-10">
                <div>
                  <p className="text-[9px] text-white/40 uppercase mb-1 font-mono tracking-widest">Твое Самочувствие</p>
                  <p className="text-sm font-semibold text-white">Энергия на высоте ✨</p>
                </div>
                {/* Simulated weekly micro indicator bar chart */}
                <div className="h-9 w-24 bg-white/5 rounded-lg overflow-hidden flex items-end gap-1 px-2 py-1 justify-center border border-white/5">
                  <div className="w-2.5 h-3 bg-salad-green/40 rounded-t-sm" title="Пн: 40%"></div>
                  <div className="w-2.5 h-6 bg-salad-green/50 rounded-t-sm" title="Вт: 70%"></div>
                  <div className="w-2.5 h-5 bg-salad-green/40 rounded-t-sm" title="Ср: 60%"></div>
                  <div className="w-2.5 h-7 bg-salad-green/70 rounded-t-sm" title="Чт: 85%"></div>
                  <div className="w-2.5 h-8 bg-salad-green rounded-t-sm" title="Пт: 100%"></div>
                </div>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-sans mt-3.5 z-10">
                * Анализируем твои физиологические циклы в режиме реального времени на основе баланса питания и воды.
              </p>
            </div>
          </aside>

        </div>

      </main>

      {/* Corporate Branding Code Footer */}
      <footer id="global-footer" className="mt-12 select-none h-14 px-6 md:px-8 flex items-center justify-between border-t border-white/5 bg-[#050506]/40 backdrop-blur-md">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-salad-green"></span>
            <span className="text-[9px] tracking-widest font-mono text-white/40 uppercase">Бережность</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span className="text-[9px] tracking-widest font-mono text-white/40 uppercase">Гармония</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
            <span className="text-[9px] tracking-widest font-mono text-white/40 uppercase">Осознанность</span>
          </div>
        </div>
        <div className="text-[9px] text-white/20 font-mono uppercase tracking-widest text-right">
          AI COLORI TRACKER ECOSYSTEM • {new Date().getFullYear()}
        </div>
      </footer>

      {/* 🏆 MICRO-ACHIEVEMENTS CELEBRATION MODAL OVERLAY */}
      <AnimatePresence>
        {activeAchievement && (
          <div className="fixed inset-0 z-50 bg-[#0A0A0B]/85 backdrop-blur-md flex items-center justify-center p-4">
            
            {/* Ambient decorative glowing particles floating around */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {[...Array(12)].map((_, i) => {
                const size = Math.random() * 6 + 4;
                const duration = Math.random() * 3 + 4;
                const delay = Math.random() * 2;
                const leftPos = Math.random() * 100; // percent based to resist window sizes
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: "110vh", x: "0%" }}
                    animate={{ 
                      opacity: [0, 0.8, 0.8, 0], 
                      y: "-10vh",
                      x: [
                        "0%", 
                        `${Math.random() * 40 - 20}%`, 
                        `${Math.random() * 40 - 20}%`
                      ]
                    }}
                    transition={{ 
                      duration, 
                      repeat: Infinity, 
                      delay,
                      ease: "easeInOut"
                    }}
                    className={`absolute rounded-full filter blur-[1px] ${
                      activeAchievement.type === 'water' 
                        ? 'bg-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.5)]' 
                        : 'bg-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    }`}
                    style={{ 
                      left: `${leftPos}%`, 
                      bottom: 0,
                      width: `${size}px`,
                      height: `${size}px`
                    }}
                  />
                );
              })}
            </div>

            {/* Achievement Card Structure */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="bg-[#16161A] border border-white/10 rounded-[38px] p-6 md:p-8 max-w-lg w-full text-center relative overflow-hidden shadow-2xl flex flex-col items-center gap-6"
            >
              {/* Radial flare backdrop glow */}
              <div className={`absolute -top-32 w-72 h-72 rounded-full filter blur-[100px] opacity-35 ${
                activeAchievement.type === 'water' ? 'bg-sky-500' : 'bg-emerald-500'
              }`} />

              {/* Header category badge */}
              <div className="z-10 flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] uppercase font-mono tracking-widest text-white/50">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Новый триумф привычек</span>
              </div>

              {/* Big Icon Container */}
              <div className="z-10 relative">
                {/* Ripple ring animations behind the main icon */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute inset-[-15px] rounded-full filter blur-md ${
                    activeAchievement.type === 'water' ? 'bg-sky-500/10' : 'bg-emerald-500/10'
                  }`}
                />
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border ${
                  activeAchievement.type === 'water'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.2)]'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                }`}>
                  {activeAchievement.type === 'water' ? (
                    <Droplets className="w-9 h-9" />
                  ) : (
                    <Award className="w-9 h-9" />
                  )}
                </div>
              </div>

              {/* Titles & Achievements Description */}
              <div className="z-10 space-y-1.5">
                <h2 className="text-xl font-bold font-display tracking-tight text-white">
                  {activeAchievement.type === 'water' 
                    ? 'Цель по воде достигнута!' 
                    : 'Протеиновый баланс восполнен!'}
                </h2>
                <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/40">
                  {activeAchievement.type === 'water' 
                    ? `Баланс гидратации • ${waterGoal} мл` 
                    : `Забота о восстановлении • ${proteinTarget}г`}
                </p>
              </div>

              {/* AI-Generated Compliment Box */}
              <div className="z-10 w-full relative min-h-[90px] flex items-center justify-center p-5 rounded-2xl bg-black/30 border border-white/5">
                {isFetchingAchievement ? (
                  <div className="space-y-3 w-full">
                    <div className="flex justify-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-[10px] text-white/50 font-mono tracking-wider animate-pulse uppercase">
                      {activeAchievement.text}
                    </p>
                  </div>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-slate-300 leading-relaxed font-sans font-medium"
                  >
                    {activeAchievement.text}
                  </motion.p>
                )}
              </div>

              {/* Buttons and interactions */}
              <div className="z-10 w-full flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setActiveAchievement(null)}
                  className={`py-3 px-6 rounded-2xl font-bold text-xs text-black transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95 ${
                    activeAchievement.type === 'water'
                      ? 'bg-sky-400 hover:bg-sky-300 shadow-sky-500/10'
                      : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/10'
                  }`}
                >
                  Принять с улыбкой 😊
                </button>
                
                {/* Micro interactivity trigger */}
                <button
                  onClick={() => {
                    setSafeAlert(activeAchievement.type === 'water' ? "💧 Чистая вода — источник сияния!" : "💪 Белок укрепляет твой тонус!");
                    setTimeout(() => setSafeAlert(null), 3000);
                  }}
                  className="py-2.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-mono border border-white/5"
                >
                  Зарядиться энергией ✨
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
