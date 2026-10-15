import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { 
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
  Award,
  AlertTriangle,
  LogOut,
  Mail,
  Lock,
  User
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
  },
  {
    id: 'r5',
    name: 'Caseína o Requesón con Cacao y Almendras',
    category: 'Post-Cena',
    prepTime: '3 min',
    difficulty: 'Fácil',
    kcal: 180,
    protein: 24,
    carbs: 5,
    fat: 6,
    ingredients: ['150g requesón 0% o caseína', '5g cacao puro en polvo', '10g almendras laminadas'],
    steps: ['Mezclar la proteína/requesón con cacao.', 'Espolvorear almendras por encima.']
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
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('plan');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('nutri_app_theme') === 'dark');
  const [toastMessage, setToastMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else showToast('¡Registro exitoso! Revisa tu correo o inicia sesión.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    showToast('Sesión cerrada');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const askConfirmation = (title, message, onConfirm) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
      }
    });
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

  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('nutri_app_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_app_profile');
    return saved ? JSON.parse(saved) : {
      weight: 71.45, height: 175, age: 30, gender: 'male', activity: 1.375,
      goalPercentage: 0, proteinPct: 30, carbsPct: 45, fatPct: 25
    };
  });

  const [sportsLog, setSportsLog] = useState(() => {
    const saved = localStorage.getItem('nutri_app_sports');
    return saved ? JSON.parse(saved) : [];
  });

  const [plannedWorkouts, setPlannedWorkouts] = useState(() => {
    const saved = localStorage.getItem('nutri_app_planned_workouts');
    return saved ? JSON.parse(saved) : {};
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

  useEffect(() => { localStorage.setItem('nutri_app_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('nutri_app_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('nutri_app_sports', JSON.stringify(sportsLog)); }, [sportsLog]);
  useEffect(() => { localStorage.setItem('nutri_app_planned_workouts', JSON.stringify(plannedWorkouts)); }, [plannedWorkouts]);
  useEffect(() => { localStorage.setItem('nutri_app_measurements', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('nutri_app_menu', JSON.stringify(weeklyMenu)); }, [weeklyMenu]);
  useEffect(() => { localStorage.setItem('nutri_app_water', JSON.stringify(waterLog)); }, [waterLog]);
  useEffect(() => { localStorage.setItem('nutri_app_adherence', JSON.stringify(adherenceLog)); }, [adherenceLog]);

  const exportBackup = () => {
    const backupData = { recipes, profile, sportsLog, plannedWorkouts, measurements, weeklyMenu, waterLog, adherenceLog, exportedAt: new Date().toISOString() };
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
        if (data.plannedWorkouts) setPlannedWorkouts(data.plannedWorkouts);
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

  const calculateBMR = () => {
    const w = Number(profile.weight);
    const h = Number(profile.height);
    const a = Number(profile.age);
    if (profile.gender === 'female') {
      return 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    } else {
      return 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    }
  };

  const bmr = calculateBMR();
  const neatKcal = bmr * (Number(profile.activity) - 1);
  const tdeeBase = bmr + neatKcal;
  const tefKcal = tdeeBase * 0.10;
  const totalBaseKcal = tdeeBase + tefKcal;

  const goalPct = Number(profile.goalPercentage !== undefined ? profile.goalPercentage : 0);
  const goalAdjustment = totalBaseKcal * (goalPct / 100);
  const fixedBaseTargetKcal = Math.round(totalBaseKcal + goalAdjustment);

  const getSportsKcalForDate = (dateKey) => {
    return sportsLog
      .filter(s => s.dateKey === dateKey)
      .reduce((acc, curr) => acc + Number(curr.calories), 0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xs font-bold animate-pulse">Cargando NutriPlan...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold">NutriPlan PWA</h1>
            <p className="text-xs text-slate-400">Inicia sesión para sincronizar tus datos en la nube.</p>
          </div>

          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-3 rounded-2xl text-center font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="email" 
                  required 
                  placeholder="tu@correo.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all">
              {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse Gratis'}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
            >
              {authMode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans pb-28`}>
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-lg text-xs font-bold animate-bounce">
          ✓ {toastMessage}
        </div>
      )}

      <header className={`border-b sticky top-0 z-30 px-5 py-4 backdrop-blur-md transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">NutriPlan PWA</h1>
              <p className="text-xs text-slate-400 font-medium">Semana: {weekDays[0].dateFormatted} - {weekDays[6].dateFormatted}</p>
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
            <button onClick={handleLogout} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors" title="Cerrar Sesión">
              <LogOut className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} onChange={importBackup} accept=".json" className="hidden" />

            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-bold hidden sm:flex items-center gap-1 border border-emerald-500/20">
              <Flame className="w-3.5 h-3.5 fill-emerald-500" />
              <span>{fixedBaseTargetKcal} kcal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === 'plan' && (
          <PlanView 
            weeklyMenu={weeklyMenu} 
            setWeeklyMenu={setWeeklyMenu}
            recipes={recipes}
            profile={profile}
            plannedWorkouts={plannedWorkouts}
            fixedBaseTargetKcal={fixedBaseTargetKcal}
            getSportsKcalForDate={getSportsKcalForDate}
            weekDays={weekDays}
            currentWeekOffset={currentWeekOffset}
            setCurrentWeekOffset={setCurrentWeekOffset}
            adherenceLog={adherenceLog}
            setAdherenceLog={setAdherenceLog}
            waterLog={waterLog}
            setWaterLog={setWaterLog}
            darkMode={darkMode}
            showToast={showToast}
            askConfirmation={askConfirmation}
          />
        )}
        {activeTab === 'sports' && (
          <SportsView 
            sportsLog={sportsLog} 
            setSportsLog={setSportsLog}
            plannedWorkouts={plannedWorkouts}
            setPlannedWorkouts={setPlannedWorkouts}
            weekDays={weekDays}
            currentWeekOffset={currentWeekOffset}
            setCurrentWeekOffset={setCurrentWeekOffset}
            darkMode={darkMode}
            showToast={showToast}
            askConfirmation={askConfirmation}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesView 
            recipes={recipes} 
            setRecipes={setRecipes} 
            darkMode={darkMode} 
            showToast={showToast}
            askConfirmation={askConfirmation}
          />
        )}
        {activeTab === 'anthropometry' && (
          <AnthropometryView 
            measurements={measurements} 
            setMeasurements={setMeasurements}
            profile={profile}
            darkMode={darkMode}
            showToast={showToast}
            askConfirmation={askConfirmation}
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

      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full space-y-4 text-center ${darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white shadow-xl'}`}>
            <div className="bg-rose-500/10 text-rose-500 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">{confirmModal.title}</h3>
            <p className="text-xs text-slate-400">{confirmModal.message}</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-600/20">Sí, Borrar</button>
            </div>
          </div>
        </div>
      )}

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
          <button onClick={removeGlass} className={`px-2.5 py-1 rounded-xl text-xs font-bold ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>-</button>
          <button onClick={addGlass} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20">
            + Vaso
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanView({ weeklyMenu, setWeeklyMenu, recipes, profile, plannedWorkouts, fixedBaseTargetKcal, getSportsKcalForDate, weekDays, currentWeekOffset, setCurrentWeekOffset, adherenceLog, setAdherenceLog, waterLog, setWaterLog, darkMode, showToast, askConfirmation }) {
  const meals = ['Desayuno', 'Media Mañana', 'Comida', 'Merienda', 'Cena', 'Post-Cena'];
  const [selectedDateKey, setSelectedDateKey] = useState(weekDays[0].key);
  const [viewMode, setViewMode] = useState('matrix');
  const [showGroceryModal, setShowGroceryModal] = useState(false);

  useEffect(() => { setSelectedDateKey(weekDays[0].key); }, [currentWeekOffset]);

  const assignRecipe = (dateKey, mealName, recipe) => {
    setWeeklyMenu(prev => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), [mealName]: recipe } }));
  };

  const removeRecipe = (dateKey, mealName) => {
    askConfirmation('¿Eliminar esta receta?', `¿Estás seguro de quitar "${weeklyMenu[dateKey]?.[mealName]?.name}" del menú?`, () => {
      setWeeklyMenu(prev => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), [mealName]: null } }));
    });
  };

  const clearEntireMenu = () => {
    askConfirmation('¿Borrar todo el menú semanal?', 'Esta acción eliminará de golpe todas las recetas asignadas a los 7 días de esta semana.', () => {
      const updated = { ...weeklyMenu };
      weekDays.forEach(d => { delete updated[d.key]; });
      setWeeklyMenu(updated);
      showToast('Menú semanal borrado completamente');
    });
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

  const getDayMacros = (dayKcal) => {
    return {
      protein: Math.round((dayKcal * (profile.proteinPct / 100)) / 4),
      carbs: Math.round((dayKcal * (profile.carbsPct / 100)) / 4),
      fat: Math.round((dayKcal * (profile.fatPct / 100)) / 9)
    };
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

  const totalAssignedMeals = weekDays.reduce((acc, d) => {
    const dayMenu = weeklyMenu[d.key] || {};
    return acc + Object.values(dayMenu).filter(Boolean).length;
  }, 0);

  const completedMeals = weekDays.reduce((acc, d) => {
    return acc + meals.filter(m => adherenceLog[`${d.key}_${m}`]).length;
  }, 0);

  const adherencePct = totalAssignedMeals > 0 ? Math.round((completedMeals / totalAssignedMeals) * 100) : 0;
  const selectedDaySportsKcal = getSportsKcalForDate(selectedDateKey);
  const selectedDayTotalKcal = fixedBaseTargetKcal + selectedDaySportsKcal;
  const selectedDayMacros = getDayMacros(selectedDayTotalKcal);
  const currentDayInfo = weekDays.find(d => d.key === selectedDateKey) || weekDays[0];
  const selectedDayPlannedWorkouts = Array.isArray(plannedWorkouts[selectedDateKey]) ? plannedWorkouts[selectedDateKey] : [];

  return (
    <div className="space-y-5">
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold block">{weekDays[0].monthName.toUpperCase()} {weekDays[0].year}</span>
            <span className="text-[11px] text-emerald-500 font-semibold">Del {weekDays[0].dateFormatted} al {weekDays[6].dateFormatted}</span>
          </div>
          <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-2xl text-xs font-bold border border-amber-500/20">
            <Award className="w-4 h-4" />
            <span>Adherencia: {adherencePct}%</span>
          </div>

          <button onClick={autoFillWeek} className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Auto-rellenar
          </button>

          <button onClick={clearEntireMenu} className="bg-rose-500/10 text-rose-500 border border-rose-500/25 hover:bg-rose-500/20 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-colors">
            <Trash2 className="w-4 h-4" /> Borrar Menú
          </button>

          <button onClick={() => setShowGroceryModal(true)} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" /> Compra ({groceryList.length})
          </button>

          <div className={`flex gap-1 p-1 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <button onClick={() => setViewMode('matrix')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${viewMode === 'matrix' ? (darkMode ? 'bg-slate-900 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') : 'text-slate-400'}`}>
              <Grid className="w-3.5 h-3.5 inline mr-1" /> Matriz 7D
            </button>
            <button onClick={() => setViewMode('cards')} className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${viewMode === 'cards' ? (darkMode ? 'bg-slate-900 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') : 'text-slate-400'}`}>
              <List className="w-3.5 h-3.5 inline mr-1" /> Día a Día
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'cards' && (
        <HydrationWidget 
          profile={profile} 
          waterLog={waterLog} 
          setWaterLog={setWaterLog} 
          selectedDateKey={selectedDateKey} 
          darkMode={darkMode}
          showToast={showToast}
        />
      )}

      {viewMode === 'matrix' && (
        <div className={`overflow-x-auto rounded-3xl border shadow-sm p-4 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left min-w-[850px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800/20">
                <th className="p-2 text-xs font-bold text-slate-400 uppercase w-28">Comida</th>
                {weekDays.map(d => {
                  const daySports = getSportsKcalForDate(d.key);
                  const dayTotal = fixedBaseTargetKcal + daySports;
                  const dayPlanned = Array.isArray(plannedWorkouts[d.key]) ? plannedWorkouts[d.key] : [];

                  return (
                    <th key={d.key} className="p-2 text-center align-top">
                      <p className="text-xs font-bold">{d.dayName}</p>
                      <p className="text-[10px] text-slate-400">{d.dateFormatted}</p>
                      <span className="text-[10px] font-extrabold text-emerald-500 block mt-0.5">{dayTotal} kcal</span>
                      {daySports > 0 && <span className="text-[9px] text-amber-500 font-bold block">+{daySports} dep.</span>}
                      
                      {dayPlanned.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayPlanned.map((w, idx) => (
                            <span key={idx} className="block text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold truncate">
                              🏋️ {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </th>
                  );
                })}
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

      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            {weekDays.map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDateKey(d.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDateKey === d.key
                    ? 'bg-slate-900 text-white shadow-md dark:bg-emerald-600'
                    : darkMode ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-600 border border-slate-100'
                }`}
              >
                {d.fullLabel}
              </button>
            ))}
          </div>

          <div className={`p-4 rounded-3xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold">Meta para {currentDayInfo.fullLabel}</h3>
                {selectedDaySportsKcal > 0 && <span className="text-[10px] text-amber-500 font-bold">Incluye +{selectedDaySportsKcal} kcal por deporte</span>}
              </div>
              <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{selectedDayTotalKcal} kcal</span>
            </div>

            {selectedDayPlannedWorkouts.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-emerald-500 flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5" /> Entrenamientos Programados Hoy:</p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedDayPlannedWorkouts.map((w, idx) => (
                    <span key={idx} className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-rose-500/10 p-2.5 rounded-2xl border border-rose-500/20">
                <p className="text-[10px] uppercase font-bold text-rose-500">Proteínas</p>
                <p className="text-sm font-extrabold text-rose-600">{selectedDayMacros.protein}g</p>
              </div>
              <div className="bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
                <p className="text-[10px] uppercase font-bold text-amber-500">Carbos</p>
                <p className="text-sm font-extrabold text-amber-600">{selectedDayMacros.carbs}g</p>
              </div>
              <div className="bg-blue-500/10 p-2.5 rounded-2xl border border-blue-500/20">
                <p className="text-[10px] uppercase font-bold text-blue-500">Grasas</p>
                <p className="text-sm font-extrabold text-blue-600">{selectedDayMacros.fat}g</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {meals.map((meal) => {
              const currentRecipe = weeklyMenu[selectedDateKey]?.[meal];
              const isDone = adherenceLog[`${selectedDateKey}_${meal}`];
              return (
                <div key={meal} className={`p-4 rounded-3xl border shadow-sm space-y-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{meal}</span>
                    <div className="flex items-center gap-2">
                      {currentRecipe && (
                        <>
                          <button onClick={() => toggleMealAdherence(selectedDateKey, meal)} className={`text-xs font-bold flex items-center gap-1 ${isDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                            <CheckCircle2 className="w-4 h-4" /> {isDone ? 'Completada' : 'Marcar'}
                          </button>
                          <button onClick={() => removeRecipe(selectedDateKey, meal)} className="text-rose-500 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {currentRecipe ? (
                    <div className={`p-3 rounded-2xl border flex justify-between items-center ${isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-500/5 border-slate-500/10'}`}>
                      <div>
                        <p className="text-xs font-bold">{currentRecipe.name}</p>
                        <p className="text-[10px] text-slate-400">{currentRecipe.kcal} kcal | P: {currentRecipe.protein}g | C: {currentRecipe.carbs}g | G: {currentRecipe.fat}g</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-semibold">{currentRecipe.prepTime}</span>
                    </div>
                  ) : (
                    <select 
                      onChange={(e) => {
                        const found = recipes.find(r => r.id === e.target.value);
                        if (found) assignRecipe(selectedDateKey, meal, found);
                      }}
                      defaultValue=""
                      className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="" disabled>+ Añadir a {meal}</option>
                      {recipes.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.kcal} kcal)</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showGroceryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-md w-full space-y-4 max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center border-b pb-2 border-slate-800/20">
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
            ) : <p className="text-xs text-slate-400 text-center py-4">Asigna recetas al menú semanal para generar la lista de supermercado.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function SportsView({ sportsLog, setSportsLog, plannedWorkouts, setPlannedWorkouts, weekDays, currentWeekOffset, setCurrentWeekOffset, darkMode, showToast, askConfirmation }) {
  const [sportType, setSportType] = useState('Gimnasio');
  const [calories, setCalories] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState(weekDays[0].key);
  const [workoutInputs, setWorkoutInputs] = useState({});

  const sportsOptions = ['Ciclismo', 'Carrera', 'Natación', 'Gimnasio', 'Otros'];

  const handleAddSportsLog = (e) => {
    e.preventDefault();
    if (!calories) return;
    const newEntry = { id: 's_' + Date.now(), dateKey: selectedDateKey, type: sportType, calories: Number(calories) };
    setSportsLog(prev => [newEntry, ...prev]);
    setCalories('');
    showToast('Sesión deportiva registrada');
  };

  const handleRemoveSportsLog = (id) => {
    askConfirmation('¿Eliminar sesión deportiva?', '¿Deseas borrar este registro de entrenamiento completado?', () => {
      setSportsLog(prev => prev.filter(s => s.id !== id));
      showToast('Sesión borrada');
    });
  };

  const handleAddPlannedWorkout = (dateKey) => {
    const text = workoutInputs[dateKey]?.trim();
    if (!text) return;
    const currentList = Array.isArray(plannedWorkouts[dateKey]) ? plannedWorkouts[dateKey] : [];
    setPlannedWorkouts(prev => ({
      ...prev,
      [dateKey]: [...currentList, text]
    }));
    setWorkoutInputs(prev => ({ ...prev, [dateKey]: '' }));
    showToast('Entrenamiento añadido al plan');
  };

  const handleRemovePlannedWorkout = (dateKey, index) => {
    askConfirmation('¿Eliminar entreno del plan?', '¿Quitar este entrenamiento de la lista de planificados?', () => {
      setPlannedWorkouts(prev => {
        const list = Array.isArray(prev[dateKey]) ? [...prev[dateKey]] : [];
        list.splice(index, 1);
        return { ...prev, [dateKey]: list };
      });
      showToast('Entrenamiento quitado del plan');
    });
  };

  return (
    <div className="space-y-5">
      <div className={`p-4 rounded-3xl border shadow-sm flex justify-between items-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold">Semana del {weekDays[0].dateFormatted} al {weekDays[6].dateFormatted}</span>
        <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-emerald-500" /> Planificación Semanal de Entrenamientos</h2>
        <p className="text-xs text-slate-400">Puedes planificar varios entrenamientos en un mismo día y aparecerán automáticamente en el menú semanal:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {weekDays.map(d => {
            const list = Array.isArray(plannedWorkouts[d.key]) ? plannedWorkouts[d.key] : [];
            return (
              <div key={d.key} className="p-3.5 rounded-2xl bg-slate-500/5 border border-slate-500/10 space-y-2 text-xs">
                <span className="font-bold block">{d.fullLabel}</span>

                <div className="space-y-1">
                  {list.map((w, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-emerald-500/10 text-emerald-500 p-2 rounded-xl font-semibold border border-emerald-500/20">
                      <span>🏋️ {w}</span>
                      <button onClick={() => handleRemovePlannedWorkout(d.key, idx)} className="text-rose-500 hover:text-rose-700 p-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input 
                    type="text" 
                    placeholder="Ej: Carrera 5km o Pierna" 
                    value={workoutInputs[d.key] || ''}
                    onChange={(e) => setWorkoutInputs({ ...workoutInputs, [d.key]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlannedWorkout(d.key); }}
                    className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2.5 py-1 text-xs" 
                  />
                  <button onClick={() => handleAddPlannedWorkout(d.key)} className="bg-emerald-600 text-white px-3 py-1 rounded-xl font-bold hover:bg-emerald-700">+ Añadir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><Dumbbell className="w-4 h-4 text-emerald-500" /> Registrar Sesión Deportiva Realizada</h2>
        <form onSubmit={handleAddSportsLog} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Día de la Semana</label>
              <select value={selectedDateKey} onChange={e => setSelectedDateKey(e.target.value)} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 font-semibold">
                {weekDays.map(d => <option key={d.key} value={d.key}>{d.fullLabel}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tipo de Deporte</label>
              <select value={sportType} onChange={e => setSportType(e.target.value)} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 font-semibold">
                {sportsOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Gasto Calórico (kcal)</label>
              <input type="number" required placeholder="300" value={calories} onChange={e => setCalories(e.target.value)} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 font-semibold" />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">+ Registrar Entreno</button>
        </form>
      </div>

      <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Entrenamientos Completados</h3>
        <div className="space-y-2">
          {sportsLog.map((s) => {
            const dayInfo = weekDays.find(d => d.key === s.dateKey) || { fullLabel: s.dateKey };
            return (
              <div key={s.id} className="bg-slate-500/5 p-3 rounded-2xl border border-slate-500/10 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] bg-slate-900 text-white dark:bg-emerald-600 px-2 py-0.5 rounded-full font-bold mr-2">{dayInfo.fullLabel}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">{s.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-emerald-500">+{s.calories} kcal</span>
                  <button onClick={() => handleRemoveSportsLog(s.id)} className="text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecipesView({ recipes, setRecipes, darkMode, showToast, askConfirmation }) {
  const [showModal, setShowModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', category: 'Comida', prepTime: '20 min', difficulty: 'Fácil', kcal: '', protein: '', carbs: '', fat: '', ingredients: '', steps: '' });

  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!newRecipe.name || !newRecipe.kcal) return;
    const created = {
      id: 'r_' + Date.now(),
      name: newRecipe.name,
      category: newRecipe.category,
      prepTime: newRecipe.prepTime,
      difficulty: newRecipe.difficulty,
      kcal: Number(newRecipe.kcal),
      protein: Number(newRecipe.protein) || 0,
      carbs: Number(newRecipe.carbs) || 0,
      fat: Number(newRecipe.fat) || 0,
      ingredients: newRecipe.ingredients ? newRecipe.ingredients.split('\n') : ['Ingredientes variados'],
      steps: newRecipe.steps ? newRecipe.steps.split('\n') : ['Cocinar e integrar.']
    };
    setRecipes(prev => [created, ...prev]);
    setShowModal(false);
    showToast('Receta creada con éxito');
  };

  const handleRemoveRecipe = (id, name) => {
    askConfirmation('¿Eliminar receta?', `¿Estás seguro de que deseas eliminar permanentemente "${name}"?`, () => {
      setRecipes(prev => prev.filter(r => r.id !== id));
      showToast('Receta eliminada');
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold flex items-center gap-2"><ChefHat className="w-4 h-4 text-emerald-500" /> Base de Datos de Recetas</h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"><Plus className="w-4 h-4" /> Nueva Receta</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className={`p-4 rounded-3xl border shadow-sm space-y-3 relative group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{recipe.category}</span>
                <h3 className="text-sm font-bold mt-1">{recipe.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">{recipe.difficulty}</span>
                <button onClick={() => handleRemoveRecipe(recipe.id, recipe.name)} className="text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 bg-slate-500/5 p-2 rounded-xl text-center text-[10px]">
              <div><p className="text-slate-400">Kcal</p><p className="font-bold">{recipe.kcal}</p></div>
              <div><p className="text-rose-500">Prot</p><p className="font-bold">{recipe.protein}g</p></div>
              <div><p className="text-amber-500">Carb</p><p className="font-bold">{recipe.carbs}g</p></div>
              <div><p className="text-blue-500">Grasa</p><p className="font-bold">{recipe.fat}g</p></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center border-b pb-2 border-slate-800/20">
              <h3 className="text-sm font-bold">Añadir Nueva Receta</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddRecipe} className="space-y-3 text-xs">
              <input type="text" required placeholder="Nombre receta" value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newRecipe.category} onChange={e => setNewRecipe({...newRecipe, category: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold">
                  <option value="Desayuno">Desayuno</option>
                  <option value="Media Mañana">Media Mañana</option>
                  <option value="Comida">Comida</option>
                  <option value="Merienda">Merienda</option>
                  <option value="Cena">Cena</option>
                  <option value="Post-Cena">Post-Cena</option>
                </select>
                <input type="number" required placeholder="Kcal" value={newRecipe.kcal} onChange={e => setNewRecipe({...newRecipe, kcal: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Prot (g)" value={newRecipe.protein} onChange={e => setNewRecipe({...newRecipe, protein: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5" />
                <input type="number" placeholder="Carb (g)" value={newRecipe.carbs} onChange={e => setNewRecipe({...newRecipe, carbs: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5" />
                <input type="number" placeholder="Fat (g)" value={newRecipe.fat} onChange={e => setNewRecipe({...newRecipe, fat: e.target.value})} className="bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5" />
              </div>
              <textarea rows="2" placeholder="Ingredientes (uno por línea)" value={newRecipe.ingredients} onChange={e => setNewRecipe({...newRecipe, ingredients: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2"></textarea>
              <textarea rows="2" placeholder="Pasos de preparación (uno por línea)" value={newRecipe.steps} onChange={e => setNewRecipe({...newRecipe, steps: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2"></textarea>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl">Guardar Receta</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AnthropometryView({ measurements, setMeasurements, profile, darkMode, showToast, askConfirmation }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: profile.weight || 71.45,
    chest: 93.5, hips: 93, waist: 75, rightThigh: 58, leftThigh: 58.5, rightCalf: 37.5, leftCalf: 37.5, neck: 36
  });

  const calculateBodyFat = (waist, neck, height, hips, gender) => {
    if (!waist || !neck || !height) return 0;
    const h = Number(height), w = Number(waist), n = Number(neck), hp = Number(hips) || 90;
    if (gender === 'male') {
      const bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
      return Math.max(3, Math.min(50, Math.round(bf * 10) / 10));
    } else {
      const bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
      return Math.max(8, Math.min(50, Math.round(bf * 10) / 10));
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const bf = calculateBodyFat(form.waist, form.neck, profile.height, form.hips, profile.gender);
    const entry = { ...form, id: 'm_' + Date.now(), bodyFat: bf };

    setMeasurements(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const updated = [entry, ...list];
      return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    showToast('Medidas antropométricas guardadas');
  };

  const handleRemoveMeasurement = (id, date) => {
    askConfirmation('¿Eliminar registro de medidas?', `¿Eliminar los datos guardados para el ${date}?`, () => {
      setMeasurements(prev => (Array.isArray(prev) ? prev.filter(m => m.id !== id) : []));
      showToast('Registro eliminado');
    });
  };

  const safeMeasurements = Array.isArray(measurements) ? measurements : [];
  const sortedMeasurements = [...safeMeasurements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const chronological = [...safeMeasurements].sort((a, b) => new Date(a.date) - new Date(b.date));

  const initial = chronological[0];
  const latest = chronological[chronological.length - 1];

  const getDelta = (key) => {
    if (!initial || !latest || chronological.length < 2) return null;
    const diff = Number(latest[key]) - Number(initial[key]);
    const formatted = Math.round(diff * 100) / 100;
    return formatted > 0 ? `+${formatted}` : `${formatted}`;
  };

  const getWeightPoints = () => {
    if (chronological.length === 0) return '';
    const maxW = Math.max(...chronological.map(m => Number(m.weight))) + 2;
    const minW = Math.min(...chronological.map(m => Number(m.weight))) - 2;
    const range = maxW - minW || 1;

    return chronological.map((m, idx) => {
      const x = (idx / Math.max(chronological.length - 1, 1)) * 260 + 30;
      const y = 80 - ((Number(m.weight) - minW) / range) * 60;
      return `${x},${y}`;
    }).join(' ');
  };

  const getFatPoints = () => {
    if (chronological.length === 0) return '';
    const maxF = Math.max(...chronological.map(m => Number(m.bodyFat || 15))) + 3;
    const minF = Math.min(...chronological.map(m => Number(m.bodyFat || 15))) - 3;
    const range = maxF - minF || 1;

    return chronological.map((m, idx) => {
      const x = (idx / Math.max(chronological.length - 1, 1)) * 260 + 30;
      const y = 80 - ((Number(m.bodyFat || 15) - minF) / range) * 60;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> Evolución Multieje (Peso vs % Grasa)</h3>
          <div className="flex gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-500"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Peso (kg)</span>
            <span className="flex items-center gap-1 text-blue-500"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span> Grasa (%)</span>
          </div>
        </div>

        {chronological.length > 1 ? (
          <div className="relative">
            <svg viewBox="0 0 320 100" className="w-full h-32 overflow-visible">
              <polyline points={getWeightPoints()} className="stroke-emerald-500 fill-none stroke-[2.5]" />
              <polyline points={getFatPoints()} className="stroke-blue-500 fill-none stroke-[2.5] stroke-dasharray-[4]" />
            </svg>
            <div className="flex justify-between text-[9px] text-slate-400 border-t border-slate-800/20 pt-1">
              <span>{chronological[0]?.date}</span>
              <span>{chronological[chronological.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">Registra al menos 2 entradas para trazar el gráfico.</p>
        )}
      </div>

      {chronological.length >= 2 && (
        <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Progreso Total desde el primer registro</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-500/5 p-2.5 rounded-2xl border border-slate-500/10">
              <p className="text-[10px] text-slate-400 font-bold">Cintura</p>
              <p className="font-extrabold text-sm mt-0.5">{getDelta('waist')} cm</p>
            </div>
            <div className="bg-slate-500/5 p-2.5 rounded-2xl border border-slate-500/10">
              <p className="text-[10px] text-slate-400 font-bold">Pecho</p>
              <p className="font-extrabold text-sm mt-0.5">{getDelta('chest')} cm</p>
            </div>
            <div className="bg-slate-500/5 p-2.5 rounded-2xl border border-slate-500/10">
              <p className="text-[10px] text-slate-400 font-bold">Cadera</p>
              <p className="font-extrabold text-sm mt-0.5">{getDelta('hips')} cm</p>
            </div>
            <div className="bg-slate-500/5 p-2.5 rounded-2xl border border-slate-500/10">
              <p className="text-[10px] text-slate-400 font-bold">Cuello</p>
              <p className="font-extrabold text-sm mt-0.5">{getDelta('neck')} cm</p>
            </div>
            <div className="bg-slate-500/5 p-2.5 rounded-2xl border border-slate-500/10">
              <p className="text-[10px] text-slate-400 font-bold">Muslo D/I</p>
              <p className="font-extrabold text-xs mt-1">{getDelta('rightThigh')} / {getDelta('leftThigh')} cm</p>
            </div>
            <div className="bg-slate-500/5 p-2.5 rounded-2xl border border-slate-500/10">
              <p className="text-[10px] text-slate-400 font-bold">Gemelo D/I</p>
              <p className="font-extrabold text-xs mt-1">{getDelta('rightCalf')} / {getDelta('leftCalf')} cm</p>
            </div>
          </div>
        </div>
      )}

      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-500" /> Nuevo Registro Antropométrico</h2>
        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="block text-slate-400 mb-1">Fecha</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Peso (kg)</label><input type="number" step="0.05" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Cuello (cm)</label><input type="number" step="0.5" value={form.neck} onChange={e => setForm({...form, neck: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Pecho (cm)</label><input type="number" step="0.5" value={form.chest} onChange={e => setForm({...form, chest: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Cintura (cm)</label><input type="number" step="0.5" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Cadera (cm)</label><input type="number" step="0.5" value={form.hips} onChange={e => setForm({...form, hips: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Muslo Dcho (cm)</label><input type="number" step="0.5" value={form.rightThigh} onChange={e => setForm({...form, rightThigh: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Muslo Izq (cm)</label><input type="number" step="0.5" value={form.leftThigh} onChange={e => setForm({...form, leftThigh: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Gemelo Dcho (cm)</label><input type="number" step="0.5" value={form.rightCalf} onChange={e => setForm({...form, rightCalf: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Gemelo Izq (cm)</label><input type="number" step="0.5" value={form.leftCalf} onChange={e => setForm({...form, leftCalf: e.target.value})} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-2 py-1.5 font-semibold" /></div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">Guardar Medidas</button>
        </form>
      </div>

      <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tabla de Evolución de Perímetros (cm)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800/20 text-[10px] text-slate-400 uppercase">
                <th className="p-2">Fecha</th>
                <th className="p-2">Peso</th>
                <th className="p-2">%Grasa</th>
                <th className="p-2">Cintura</th>
                <th className="p-2">Pecho</th>
                <th className="p-2">Cadera</th>
                <th className="p-2">Muslos (D/I)</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10 font-semibold">
              {sortedMeasurements.map((m) => (
                <tr key={m.id || m.date}>
                  <td className="p-2 font-bold">{m.date}</td>
                  <td className="p-2 text-emerald-500 font-bold">{m.weight} kg</td>
                  <td className="p-2 text-blue-500 font-bold">{m.bodyFat}%</td>
                  <td className="p-2">{m.waist} cm</td>
                  <td className="p-2">{m.chest} cm</td>
                  <td className="p-2">{m.hips} cm</td>
                  <td className="p-2">{m.rightThigh} / {m.leftThigh} cm</td>
                  <td className="p-2">
                    <button onClick={() => handleRemoveMeasurement(m.id, m.date)} className="text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ profile, setProfile, bmr, neatKcal, tefKcal, goalAdjustment, fixedBaseTargetKcal, darkMode, showToast }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setProfile(prev => ({ ...prev, goalPercentage: val }));
  };

  const currentGoalPct = Number(profile.goalPercentage !== undefined ? profile.goalPercentage : 0);
  const targetProteinGrams = Math.round((fixedBaseTargetKcal * (profile.proteinPct / 100)) / 4);
  const targetCarbsGrams = Math.round((fixedBaseTargetKcal * (profile.carbsPct / 100)) / 4);
  const targetFatGrams = Math.round((fixedBaseTargetKcal * (profile.fatPct / 100)) / 9);

  let statusLabel = 'Mantenimiento (0%)';
  let statusColor = 'text-amber-500';
  if (currentGoalPct < 0) {
    statusLabel = `Déficit Calórico (${currentGoalPct}%)`;
    statusColor = 'text-rose-500';
  } else if (currentGoalPct > 0) {
    statusLabel = `Superávit Calórico (+${currentGoalPct}%)`;
    statusColor = 'text-emerald-500';
  }

  return (
    <div className="space-y-5">
      <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Datos Corporales y Metabolismo Fijo</h2>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Sexo (Harris-Benedict)</label>
              <select name="gender" value={profile.gender} onChange={handleChange} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2 font-semibold">
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </div>
            <div><label className="block text-slate-400 font-semibold mb-1">Peso (kg)</label><input type="number" step="0.1" name="weight" value={profile.weight} onChange={handleChange} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2 font-semibold" /></div>
            <div><label className="block text-slate-400 font-semibold mb-1">Altura (cm)</label><input type="number" name="height" value={profile.height} onChange={handleChange} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2 font-semibold" /></div>
            <div><label className="block text-slate-400 font-semibold mb-1">Edad</label><input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2 font-semibold" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Factor Actividad (NEAT)</label>
              <select name="activity" value={profile.activity} onChange={handleChange} className="w-full bg-slate-500/10 border border-slate-500/20 rounded-xl px-3 py-2 font-semibold">
                <option value={1.2}>Sedentario (1.2)</option>
                <option value={1.375}>Ligeramente Activo (1.375)</option>
                <option value={1.55}>Moderadamente Activo (1.55)</option>
                <option value={1.725}>Muy Activo (1.725)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Objetivo Dinámico (Déficit / Mantenimiento / Superávit)</label>
              <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-rose-500">-20% (Déficit)</span>
                  <span className={statusColor}>{statusLabel}</span>
                  <span className="text-emerald-500">+20% (Superávit)</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  step="1"
                  value={currentGoalPct}
                  onChange={handleSliderChange}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rojo (Pérdida)</span>
                  <span>0% Neutro</span>
                  <span>Verde (Ganancia)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-3xl border shadow-sm space-y-3 text-xs ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-xs font-bold">Ajuste Porcentual de Macronutrientes (%)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 text-center">
            <label className="block text-rose-500 font-bold mb-1">Proteínas %</label>
            <input type="number" name="proteinPct" value={profile.proteinPct} onChange={handleChange} className="w-full bg-slate-500/10 border border-rose-500/30 rounded-xl py-1 text-center font-bold text-rose-500" />
            <span className="text-[10px] text-rose-400 font-semibold block mt-1">{targetProteinGrams} g/día</span>
          </div>

          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-center">
            <label className="block text-amber-500 font-bold mb-1">Carbos %</label>
            <input type="number" name="carbsPct" value={profile.carbsPct} onChange={handleChange} className="w-full bg-slate-500/10 border border-amber-500/30 rounded-xl py-1 text-center font-bold text-amber-500" />
            <span className="text-[10px] text-amber-400 font-semibold block mt-1">{targetCarbsGrams} g/día</span>
          </div>

          <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 text-center">
            <label className="block text-blue-500 font-bold mb-1">Grasas %</label>
            <input type="number" name="fatPct" value={profile.fatPct} onChange={handleChange} className="w-full bg-slate-500/10 border border-blue-500/30 rounded-xl py-1 text-center font-bold text-blue-500" />
            <span className="text-[10px] text-blue-400 font-semibold block mt-1">{targetFatGrams} g/día</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-2 text-xs border border-slate-800">
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-400">1. Metabolismo Basal (BMR - {profile.gender === 'male' ? 'Hombre' : 'Mujer'})</span>
          <span className="font-bold">{Math.round(bmr)} kcal</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-400">2. Actividad Diaria / NEAT</span>
          <span className="font-bold">+{Math.round(neatKcal)} kcal</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-400">3. Efecto Térmico Alimentos (TEF 10%)</span>
          <span className="font-bold">+{Math.round(tefKcal)} kcal</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-400">4. Ajuste Dinámico por Objetivo ({currentGoalPct > 0 ? `+${currentGoalPct}%` : `${currentGoalPct}%`})</span>
          <span className="font-bold text-emerald-400">{Math.round(goalAdjustment)} kcal</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-emerald-400 font-bold">MET BASE FIJO DIARIO</span>
          <span className="text-lg font-extrabold text-emerald-400">{fixedBaseTargetKcal} kcal</span>
        </div>
      </div>
    </div>
  );
}