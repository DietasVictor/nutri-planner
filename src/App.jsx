import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Calendar as CalendarIcon, 
  Activity, 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles, 
  ChefHat, 
  Scale, 
  Settings, 
  X, 
  Dumbbell, 
  Grid, 
  List, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Download, 
  Upload, 
  RefreshCw, 
  Droplet, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Zap,
  Award
} from 'lucide-react';

const INITIAL_RECIPES = [
  {
    id: 'r1',
    name: 'Tortilla de Claras y Espinacas',
    category: 'Desayuno',
    prepTime: '10 min',
    difficulty: 'Fácil',
    kcal: 220,
    protein: 26,
    carbs: 6,
    fat: 9,
    ingredients: ['4 claras de huevo', '1 huevo entero', '100g espinacas frescas', '1 cdta aceite de oliva'],
    steps: ['Batir 4 claras y 1 huevo.', 'Saltear espinacas.', 'Cuajar la tortilla en sartén.']
  },
  {
    id: 'r2',
    name: 'Pollo al Curry con Arroz Basmati',
    category: 'Comida',
    prepTime: '25 min',
    difficulty: 'Media',
    kcal: 540,
    protein: 42,
    carbs: 65,
    fat: 10,
    ingredients: ['180g pechuga de pollo', '70g arroz basmati', '50ml leche de coco ligera', 'Curry en polvo'],
    steps: ['Cocer arroz basmati.', 'Saltear pechuga de pollo con especias curry.', 'Añadir leche de coco ligera.']
  },
  {
    id: 'r3',
    name: 'Salmón a la Plancha con Espárragos',
    category: 'Cena',
    prepTime: '15 min',
    difficulty: 'Fácil',
    kcal: 480,
    protein: 38,
    carbs: 8,
    fat: 32,
    ingredients: ['180g lomo de salmón', '150g espárragos trigosos', 'Sal marina', 'Limón'],
    steps: ['Sazonar el salmón.', 'Cocinar a la plancha 3 min por lado.', 'Acompañar con espárragos.']
  },
  {
    id: 'r4',
    name: 'Yogur Griego con Nueces y Frutos Rojos',
    category: 'Merienda',
    prepTime: '5 min',
    difficulty: 'Fácil',
    kcal: 260,
    protein: 15,
    carbs: 18,
    fat: 14,
    ingredients: ['150g yogur griego 0%', '15g nueces picadas', '50g arándanos o fresas'],
    steps: ['Servir yogur griego sin azúcar.', 'Añadir nueces y arándanos.']
  }
];

function getWeekDaysFromDate(baseDate) {
  const current = new Date(baseDate);
  const dayOfWeek = current.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);

  const days = [];
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const yearNum = d.getFullYear();
    const dateKey = `${yearNum}-${monthNum}-${dayNum}`;
    
    days.push({
      key: dateKey,
      dayName: dayNames[i],
      dateFormatted: `${dayNum}/${monthNum}`,
      fullLabel: `${dayNames[i]} ${dayNum}/${monthNum}`,
      monthName: d.toLocaleString('es-ES', { month: 'long' }),
      year: yearNum
    });
  }
  return days;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('nutri_app_theme') === 'dark';
  });
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('nutri_app_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const getSelectedBaseDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + currentWeekOffset * 7);
    return d;
  };

  const weekDays = getWeekDaysFromDate(getSelectedBaseDate());

  // Estado Local
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('nutri_app_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_app_profile');
    return saved ? JSON.parse(saved) : {
      weight: 71.45, height: 175, age: 30, gender: 'male', activity: 1.375,
      goal: 'maintenance', goalIntensity: 0.15, proteinPct: 30, carbsPct: 45, fatPct: 25
    };
  });

  const [sportsLog, setSportsLog] = useState(() => {
    const saved = localStorage.getItem('nutri_app_sports');
    return saved ? JSON.parse(saved) : [];
  });

  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('nutri_app_measurements');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', date: '2026-02-09', weight: 71.45, chest: 93.5, hips: 93, waist: 75, rightThigh: 58, leftThigh: 58.5, rightCalf: 37.5, leftCalf: 37.5, neck: 36, bodyFat: 14.8 }
    ];
  });

  const [weeklyMenu, setWeeklyMenu] = useState(() => {
    const saved = localStorage.getItem('nutri_app_menu');
    return saved ? JSON.parse(saved) : {};
  });

  const [waterLog, setWaterLog] = useState(() => {
    const saved = localStorage.getItem('nutri_app_water');
    return saved ? JSON.parse(saved) : {};
  });

  const [adherenceLog, setAdherenceLog] = useState(() => {
    const saved = localStorage.getItem('nutri_app_adherence');
    return saved ? JSON.parse(saved) : {};
  });

  // Guardado Automático Persistente
  useEffect(() => { localStorage.setItem('nutri_app_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('nutri_app_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('nutri_app_sports', JSON.stringify(sportsLog)); }, [sportsLog]);
  useEffect(() => { localStorage.setItem('nutri_app_measurements', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('nutri_app_menu', JSON.stringify(weeklyMenu)); }, [weeklyMenu]);
  useEffect(() => { localStorage.setItem('nutri_app_water', JSON.stringify(waterLog)); }, [waterLog]);
  useEffect(() => { localStorage.setItem('nutri_app_adherence', JSON.stringify(adherenceLog)); }, [adherenceLog]);

  // Exportar / Importar
  const exportBackup = () => {
    const backupData = { recipes, profile, sportsLog, measurements, weeklyMenu, waterLog, adherenceLog, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriplan_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada');
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.recipes) setRecipes(data.recipes);
        if (data.profile) setProfile(data.profile);
        if (data.sportsLog) setSportsLog(data.sportsLog);
        if (data.measurements) setMeasurements(data.measurements);
        if (data.weeklyMenu) setWeeklyMenu(data.weeklyMenu);
        if (data.waterLog) setWaterLog(data.waterLog);
        if (data.adherenceLog) setAdherenceLog(data.adherenceLog);
        showToast('Datos restaurados con éxito');
      } catch (err) {
        showToast('Error al importar copia de seguridad');
      }
    };
    reader.readAsText(file);
  };

  // Cálculo MET
  const calculateBMR = () => {
    if (profile.gender === 'male') {
      return 88.362 + (13.397 * Number(profile.weight)) + (4.799 * Number(profile.height)) - (5.677 * Number(profile.age));
    } else {
      return 447.593 + (9.247 * Number(profile.weight)) + (3.098 * Number(profile.height)) - (4.330 * Number(profile.age));
    }
  };

  const bmr = calculateBMR();
  const neatKcal = bmr * (Number(profile.activity) - 1);
  const tdeeBase = bmr + neatKcal;
  const tefKcal = tdeeBase * 0.10;
  const totalBaseKcal = tdeeBase + tefKcal;

  let goalAdjustment = 0;
  if (profile.goal === 'deficit') goalAdjustment = -(totalBaseKcal * Number(profile.goalIntensity));
  if (profile.goal === 'surplus') goalAdjustment = (totalBaseKcal * Number(profile.goalIntensity));

  const fixedBaseTargetKcal = Math.round(totalBaseKcal + goalAdjustment);

  const getSportsKcalForDate = (dateKey) => {
    return sportsLog
      .filter(s => s.dateKey === dateKey)
      .reduce((acc, curr) => acc + Number(curr.calories), 0);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans pb-28`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-lg text-xs font-bold animate-bounce">
          ✓ {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className={`border-b sticky top-0 z-30 px-5 py-4 backdrop-blur-md transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">NutriPlan PWA</h1>
              <p className="text-xs text-slate-400 font-medium">{weekDays[0].dateFormatted} - {weekDays[6].dateFormatted}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={exportBackup} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`} title="Exportar Backup">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`} title="Importar Backup">
              <Upload className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} onChange={importBackup} accept=".json" className="hidden" />

            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
              <Flame className="w-3.5 h-3.5 fill-emerald-500" />
              <span>{fixedBaseTargetKcal} kcal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Módulo de Hidratación Diario en la Parte Superior */}
        <HydrationWidget 
          profile={profile} 
          waterLog={waterLog} 
          setWaterLog={setWaterLog} 
          selectedDateKey={weekDays[0].key} 
          darkMode={darkMode}
          showToast={showToast}
        />

        {activeTab === 'plan' && (
          <PlanView 
            weeklyMenu={weeklyMenu} 
            setWeeklyMenu={setWeeklyMenu}
            recipes={recipes}
            profile={profile}
            fixedBaseTargetKcal={fixedBaseTargetKcal}
            getSportsKcalForDate={getSportsKcalForDate}
            weekDays={weekDays}
            currentWeekOffset={currentWeekOffset}
            setCurrentWeekOffset={setCurrentWeekOffset}
            adherenceLog={adherenceLog}
            setAdherenceLog={setAdherenceLog}
            darkMode={darkMode}
            showToast={showToast}
          />
        )}
        {activeTab === 'sports' && (
          <SportsView 
            sportsLog={sportsLog} 
            setSportsLog={setSportsLog}
            weekDays={weekDays}
            currentWeekOffset={currentWeekOffset}
            setCurrentWeekOffset={setCurrentWeekOffset}
            darkMode={darkMode}
            showToast={showToast}
          />
        )}
        {activeTab === 'recipes' && <RecipesView recipes={recipes} setRecipes={setRecipes} darkMode={darkMode} showToast={showToast} />}
        {activeTab === 'anthropometry' && (
          <AnthropometryView 
            measurements={measurements} 
            setMeasurements={setMeasurements}
            profile={profile}
            darkMode={darkMode}
            showToast={showToast}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            profile={profile} 
            setProfile={setProfile} 
            bmr={bmr} 
            neatKcal={neatKcal}
            tefKcal={tefKcal}
            goalAdjustment={goalAdjustment}
            fixedBaseTargetKcal={fixedBaseTargetKcal} 
            darkMode={darkMode}
            showToast={showToast}
          />
        )}
      </main>

      {/* Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t py-2.5 px-4 z-40 backdrop-blur-lg transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton id="plan" label="Menú Semanal" icon={<CalendarIcon className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
          <NavButton id="sports" label="Deportes" icon={<Dumbbell className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
          <NavButton id="recipes" label="Recetas" icon={<ChefHat className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
          <NavButton id="anthropometry" label="Medidas" icon={<Scale className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
          <NavButton id="profile" label="MET & Macros" icon={<Settings className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ id, label, icon, activeTab, setActiveTab, darkMode }) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
        isActive ? 'text-emerald-500 scale-105 font-bold' : darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-1.5 rounded-xl ${isActive ? (darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60') : ''}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}

// COMPONENTE MÓDULO DE HIDRATACIÓN DIARIO
function HydrationWidget({ profile, waterLog, setWaterLog, selectedDateKey, darkMode, showToast }) {
  const targetWaterMl = Math.round(Number(profile.weight || 70) * 35);
  const currentGlasses = waterLog[selectedDateKey] || 0;
  const currentMl = currentGlasses * 250;
  const progressPct = Math.min(100, Math.round((currentMl / targetWaterMl) * 100));

  const addGlass = () => {
    setWaterLog(prev => ({ ...prev, [selectedDateKey]: (prev[selectedDateKey] || 0) + 1 }));
    showToast('+250 ml de agua agregados');
  };

  const removeGlass = () => {
    setWaterLog(prev => ({ ...prev, [selectedDateKey]: Math.max(0, (prev[selectedDateKey] || 0) - 1) }));
  };

  return (
    <div className={`p-4 rounded-3xl border shadow-sm transition-all flex flex-col sm:flex-row justify-between items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/10 text-blue-500 p-2.5 rounded-2xl">
          <Droplet className="w-5 h-5 fill-blue-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold">Hidratación Diaria</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">{progressPct}%</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{currentMl} ml / {targetWaterMl} ml recomendados ({currentGlasses} vasos)</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-full sm:w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={removeGlass} className={`px-2 py-1 rounded-xl text-xs font-bold ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>-</button>
          <button onClick={addGlass} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20">
            + Vaso
          </button>
        </div>
      </div>
    </div>
  );
}

// MENÚ SEMANAL CON CONTROL DE ADHERENCIA
function PlanView({ weeklyMenu, setWeeklyMenu, recipes, profile, fixedBaseTargetKcal, getSportsKcalForDate, weekDays, currentWeekOffset, setCurrentWeekOffset, adherenceLog, setAdherenceLog, darkMode, showToast }) {
  const meals = ['Desayuno', 'Media Mañana', 'Comida', 'Merienda', 'Cena'];
  const [selectedDateKey, setSelectedDateKey] = useState(weekDays[0].key);
  const [viewMode, setViewMode] = useState('matrix');
  const [showGroceryModal, setShowGroceryModal] = useState(false);

  useEffect(() => { setSelectedDateKey(weekDays[0].key); }, [currentWeekOffset]);

  const assignRecipe = (dateKey, mealName, recipe) => {
    setWeeklyMenu(prev => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), [mealName]: recipe } }));
  };

  const removeRecipe = (dateKey, mealName) => {
    setWeeklyMenu(prev => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), [mealName]: null } }));
  };

  const autoFillWeek = () => {
    if (recipes.length === 0) return;
    const newMenu = { ...weeklyMenu };
    weekDays.forEach(d => {
      newMenu[d.key] = newMenu[d.key] || {};
      meals.forEach(meal => {
        const matching = recipes.filter(r => r.category === meal);
        const pool = matching.length > 0 ? matching : recipes;
        newMenu[d.key][meal] = pool[Math.floor(Math.random() * pool.length)];
      });
    });
    setWeeklyMenu(newMenu);
    showToast('Menú semanal generado automáticamente');
  };

  const toggleMealAdherence = (dateKey, meal) => {
    const key = `${dateKey}_${meal}`;
    setAdherenceLog(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateGroceryList = () => {
    const ingredients = [];
    weekDays.forEach(d => {
      const dayMenu = weeklyMenu[d.key];
      if (dayMenu) {
        Object.values(dayMenu).forEach(rec => {
          if (rec && rec.ingredients) rec.ingredients.forEach(ing => ingredients.push(ing));
        });
      }
    });
    return Array.from(new Set(ingredients));
  };

  const groceryList = generateGroceryList();

  // Cálculo de Adherencia Semanal (%)
  const totalAssignedMeals = weekDays.reduce((acc, d) => {
    const dayMenu = weeklyMenu[d.key] || {};
    return acc + Object.values(dayMenu).filter(Boolean).length;
  }, 0);

  const completedMeals = weekDays.reduce((acc, d) => {
    return acc + meals.filter(m => adherenceLog[`${d.key}_${m}`]).length;
  }, 0);

  const adherencePct = totalAssignedMeals > 0 ? Math.round((completedMeals / totalAssignedMeals) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Selector de Semana y Adherencia */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold block">{weekDays[0].monthName.toUpperCase()} {weekDays[0].year}</span>
            <span className="text-[11px] text-emerald-500 font-semibold">{weekDays[0].dateFormatted} - {weekDays[6].dateFormatted}</span>
          </div>
          <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-2xl text-xs font-bold border border-amber-500/20">
            <Award className="w-4 h-4" />
            <span>Adherencia: {adherencePct}%</span>
          </div>

          <button onClick={autoFillWeek} className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Auto-rellenar
          </button>

          <button onClick={() => setShowGroceryModal(true)} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" /> Compra ({groceryList.length})
          </button>
        </div>
      </div>

      {/* VISTA MATRIZ */}
      {viewMode === 'matrix' && (
        <div className={`overflow-x-auto rounded-3xl border shadow-sm p-4 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left min-w-[780px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800/20">
                <th className="p-2 text-xs font-bold text-slate-400 uppercase w-28">Comida</th>
                {weekDays.map(d => (
                  <th key={d.key} className="p-2 text-center">
                    <p className="text-xs font-bold">{d.dayName}</p>
                    <p className="text-[10px] text-slate-400">{d.dateFormatted}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10">
              {meals.map(meal => (
                <tr key={meal}>
                  <td className="p-2.5 font-bold text-xs bg-slate-500/5 rounded-l-xl">{meal}</td>
                  {weekDays.map(d => {
                    const current = weeklyMenu[d.key]?.[meal];
                    const isDone = adherenceLog[`${d.key}_${meal}`];
                    return (
                      <td key={d.key} className="p-1.5 align-top">
                        {current ? (
                          <div className={`p-2 rounded-xl text-[10px] space-y-1 relative border transition-all ${isDone ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            <div className="flex justify-between items-center">
                              <p className="font-bold truncate">{current.name}</p>
                              <button onClick={() => toggleMealAdherence(d.key, meal)} className={isDone ? 'text-emerald-500' : 'text-slate-400'}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                              <span>{current.kcal} kcal</span>
                              <button onClick={() => removeRecipe(d.key, meal)} className="text-rose-500"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ) : (
                          <select onChange={(e) => { const f = recipes.find(r => r.id === e.target.value); if (f) assignRecipe(d.key, meal, f); }} defaultValue="" className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl p-1.5 text-[10px]">
                            <option value="" disabled>+ Receta</option>
                            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Lista Compra */}
      {showGroceryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-md w-full space-y-4 max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-emerald-500" /> Lista de la Compra Semanal</h3>
              <button onClick={() => setShowGroceryModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {groceryList.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {groceryList.map((item, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl border border-slate-500/20 flex items-center gap-2">
                    <input type="checkbox" className="rounded accent-emerald-500" />
                    <span className="font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-slate-400 text-center py-4">Asigna recetas al menú semanal para generar la lista.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// RESTO DE VISTAS (Deportes, Recetas, Antropometría, Perfil)
function SportsView({ sportsLog, setSportsLog, weekDays, darkMode, showToast }) {
  const [sportType, setSportType] = useState('Gimnasio');
  const [calories, setCalories] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState(weekDays[0].key);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!calories) return;
    setSportsLog(prev => [{ id: 's_' + Date.now(), dateKey: selectedDateKey, type: sportType, calories: Number(calories) }, ...prev]);
    setCalories('');
    showToast('Sesión deportiva añadida');
  };

  return (
    <div className="space-y-5">
      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><Dumbbell className="w-4 h-4 text-emerald-500" /> Registrar Actividad Deportiva</h2>
        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={selectedDateKey} onChange={e => setSelectedDateKey(e.target.value)} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 font-semibold">
              {weekDays.map(d => <option key={d.key} value={d.key}>{d.fullLabel}</option>)}
            </select>
            <select value={sportType} onChange={e => setSportType(e.target.value)} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 font-semibold">
              {['Ciclismo', 'Carrera', 'Natación', 'Gimnasio', 'Otros'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" required placeholder="Gasto kcal" value={calories} onChange={e => setCalories(e.target.value)} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 font-semibold" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl">+ Añadir Deporte</button>
        </form>
      </div>
    </div>
  );
}

function RecipesView({ recipes, setRecipes, darkMode, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', category: 'Comida', kcal: '', protein: '', carbs: '', fat: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    setRecipes(prev => [{ ...newRecipe, id: 'r_' + Date.now(), kcal: Number(newRecipe.kcal), protein: Number(newRecipe.protein) || 0, carbs: Number(newRecipe.carbs) || 0, fat: Number(newRecipe.fat) || 0 }, ...prev]);
    setShowModal(false);
    showToast('Receta guardada');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold flex items-center gap-2"><ChefHat className="w-4 h-4 text-emerald-500" /> Base de Recetas</h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"><Plus className="w-4 h-4" /> Nueva</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(r => (
          <div key={r.id} className={`p-4 rounded-3xl border shadow-sm space-y-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-sm font-bold">{r.name}</h3>
            <p className="text-xs text-slate-400">{r.kcal} kcal | P:{r.protein}g C:{r.carbs}g G:{r.fat}g</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnthropometryView({ measurements, setMeasurements, profile, darkMode, showToast }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight: profile.weight || 71.45, waist: 75, neck: 36, hips: 93 });

  const handleAdd = (e) => {
    e.preventDefault();
    setMeasurements(prev => [{ ...form, id: 'm_' + Date.now() }, ...prev]);
    showToast('Registro de medidas guardado');
  };

  return (
    <div className="space-y-5">
      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-500" /> Nuevo Registro Antropométrico</h2>
        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2" />
            <input type="number" step="0.1" placeholder="Peso kg" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2" />
            <input type="number" step="0.5" placeholder="Cintura cm" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl">Guardar Medidas</button>
        </form>
      </div>
    </div>
  );
}

function ProfileView({ profile, setProfile, bmr, neatKcal, tefKcal, goalAdjustment, fixedBaseTargetKcal, darkMode, showToast }) {
  const handleChange = (e) => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Configuración de Macros y MET</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <input type="number" name="weight" value={profile.weight} onChange={handleChange} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2" />
          <input type="number" name="height" value={profile.height} onChange={handleChange} className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2" />
        </div>
      </div>
    </div>
  );
}