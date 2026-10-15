import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Calendar, 
  Activity, 
  User, 
  Plus, 
  Trash2, 
  Flame, 
  Target,
  Sparkles,
  Clock,
  ChefHat,
  Scale,
  TrendingUp,
  Settings,
  ChevronDown
} from 'lucide-react';

// Base de Datos Inicial de Recetas
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
    steps: ['Batir 4 claras y 1 huevo entero.', 'Saltear las espinacas en una sartén antiadherente.', 'Cuajar la tortilla a fuego medio durante 3-4 minutos por lado.']
  },
  {
    id: 'r2',
    name: 'Pollo al Curry con Arroz Basmati',
    category: 'Almuerzo',
    prepTime: '25 min',
    difficulty: 'Media',
    kcal: 540,
    protein: 42,
    carbs: 65,
    fat: 10,
    steps: ['Cocer el arroz basmati durante 10-12 minutos.', 'Saltear pechuga de pollo picada con cebolla y especias de curry.', 'Añadir 50ml de leche de coco ligera y reducir 5 minutos.']
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
    steps: ['Pincelar el lomo de salmón con aceite de oliva y sal.', 'Cocinar a la plancha a fuego vivo 3 min por la parte de la piel.', 'Saltear los espárragos trigosos como guarnición.']
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
    steps: ['Servir 150g de yogur griego natural sin azúcar.', 'Añadir 15g de nueces picadas y un puñado de arándanos frescos.']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');

  // Estado del Perfil y Calculadora
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_profile_v2');
    return saved ? JSON.parse(saved) : {
      weight: 71.45,
      height: 175,
      age: 30,
      gender: 'male',
      activity: 1.375, // Ligero
      sportsCalories: 250,
      goal: 'maintenance', // deficit, maintenance, surplus
      goalIntensity: 0.15, // 15% ajuste
      proteinPct: 25,
      carbsPct: 45,
      fatPct: 30
    };
  });

  // Historial Antropométrico
  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('nutri_measurements');
    return saved ? JSON.parse(saved) : [
      { date: '2026-02-09', weight: 71.45, waist: 75, hips: 93, chest: 93.5, thigh: 58 }
    ];
  });

  // Menú Semanal (5 comidas por día)
  const [weeklyMenu, setWeeklyMenu] = useState(() => {
    const saved = localStorage.getItem('nutri_weekly_menu');
    return saved ? JSON.parse(saved) : {
      Lunes: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null },
      Martes: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null },
      Miércoles: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null },
      Jueves: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null },
      Viernes: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null },
      Sábado: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null },
      Domingo: { Desayuno: null, 'Media Mañana': null, Almuerzo: null, Merienda: null, Cena: null }
    };
  });

  // Guardado Automático
  useEffect(() => {
    localStorage.setItem('nutri_profile_v2', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutri_measurements', JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem('nutri_weekly_menu', JSON.stringify(weeklyMenu));
  }, [weeklyMenu]);

  // Fórmula Harris-Benedict Modificada (Roza y Shizgal)
  const calculateBMR = () => {
    if (profile.gender === 'male') {
      return 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      return 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
  };

  const bmr = calculateBMR();
  const tdee = (bmr * Number(profile.activity)) + Number(profile.sportsCalories);
  const tef = tdee * 0.10; // Efecto Térmico de los Alimentos (+10%)
  const totalBaseKcal = tdee + tef;

  // Ajuste según Objetivo (Déficit / Mantenimiento / Superávit)
  const calculateTargetKcal = () => {
    if (profile.goal === 'deficit') {
      return Math.round(totalBaseKcal * (1 - profile.goalIntensity));
    } else if (profile.goal === 'surplus') {
      return Math.round(totalBaseKcal * (1 + profile.goalIntensity));
    }
    return Math.round(totalBaseKcal);
  };

  const targetKcal = calculateTargetKcal();

  // Macros Objetivos en gramos según porcentajes dinámicos
  const targetProteinGrams = Math.round((targetKcal * (profile.proteinPct / 100)) / 4);
  const targetCarbsGrams = Math.round((targetKcal * (profile.carbsPct / 100)) / 4);
  const targetFatGrams = Math.round((targetKcal * (profile.fatPct / 100)) / 9);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-md shadow-emerald-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">NutriPlan PWA</h1>
            <p className="text-xs text-slate-400 font-medium">Planificación Nutricional</p>
          </div>
        </div>

        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
          <Flame className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
          <span>{targetKcal} kcal/día</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-5">
        {activeTab === 'plan' && (
          <PlanView 
            weeklyMenu={weeklyMenu} 
            setWeeklyMenu={setWeeklyMenu}
            targetProtein={targetProteinGrams}
            targetCarbs={targetCarbsGrams}
            targetFat={targetFatGrams}
            targetKcal={targetKcal}
          />
        )}
        {activeTab === 'recipes' && <RecipesView />}
        {activeTab === 'anthropometry' && (
          <AnthropometryView 
            measurements={measurements} 
            setMeasurements={setMeasurements} 
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            profile={profile} 
            setProfile={setProfile} 
            bmr={bmr} 
            tef={tef}
            targetKcal={targetKcal} 
          />
        )}
      </main>

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 py-2.5 px-4 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton id="plan" label="Menú 5 Comidas" icon={<Calendar className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="recipes" label="Recetas" icon={<ChefHat className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="anthropometry" label="Medidas" icon={<Scale className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="profile" label="Harris-Benedict" icon={<Settings className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </nav>
    </div>
  );
}

// Botón Navegación
function NavButton({ id, label, icon, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
        isActive ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-100/60' : ''}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}

// 1. VISTA DE MENÚ SEMANAL (5 COMIDAS)
function PlanView({ weeklyMenu, setWeeklyMenu, targetProtein, targetCarbs, targetFat, targetKcal }) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Merienda', 'Cena'];
  const [selectedDay, setSelectedDay] = useState('Lunes');

  const assignRecipe = (mealName, recipe) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [mealName]: recipe
      }
    }));
  };

  const removeRecipe = (mealName) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [mealName]: null
      }
    }));
  };

  return (
    <div className="space-y-5">
      {/* Selector Días */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Target Macros */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-500" />
            Meta Diaria ({selectedDay})
          </h2>
          <span className="text-xs font-bold text-emerald-600">{targetKcal} kcal</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100">
            <p className="text-[10px] uppercase font-bold text-rose-500">Proteína</p>
            <p className="text-sm font-extrabold text-rose-700">{targetProtein}g</p>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
            <p className="text-[10px] uppercase font-bold text-amber-500">Carbos</p>
            <p className="text-sm font-extrabold text-amber-700">{targetCarbs}g</p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
            <p className="text-[10px] uppercase font-bold text-blue-500">Grasas</p>
            <p className="text-sm font-extrabold text-blue-700">{targetFat}g</p>
          </div>
        </div>
      </div>

      {/* 5 Comidas */}
      <div className="space-y-3">
        {meals.map((meal) => {
          const currentRecipe = weeklyMenu[selectedDay]?.[meal];
          return (
            <div key={meal} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{meal}</span>
                {currentRecipe && (
                  <button onClick={() => removeRecipe(meal)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {currentRecipe ? (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{currentRecipe.name}</p>
                    <p className="text-[10px] text-slate-400">{currentRecipe.kcal} kcal | P: {currentRecipe.protein}g | C: {currentRecipe.carbs}g | G: {currentRecipe.fat}g</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{currentRecipe.prepTime}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    onChange={(e) => {
                      const found = INITIAL_RECIPES.find(r => r.id === e.target.value);
                      if (found) assignRecipe(meal, found);
                    }}
                    defaultValue=""
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="" disabled>+ Asignar Receta a {meal}</option>
                    {INITIAL_RECIPES.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.kcal} kcal)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. VISTA DE RECETARIO CON NIVELES Y PASOS
function RecipesView() {
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const filtered = filterDifficulty === 'All' 
    ? INITIAL_RECIPES 
    : INITIAL_RECIPES.filter(r => r.difficulty === filterDifficulty);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-emerald-500" /> Recetario Completo
        </h2>
        <div className="flex gap-1">
          {['All', 'Fácil', 'Media'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                filterDifficulty === diff ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border'
              }`}
            >
              {diff === 'All' ? 'Todas' : diff}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((recipe) => (
          <div key={recipe.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{recipe.category}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{recipe.name}</h3>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  recipe.difficulty === 'Fácil' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {recipe.difficulty}
                </span>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 justify-end">
                  <Clock className="w-3 h-3" /> {recipe.prepTime}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-2xl text-center text-[10px]">
              <div><p className="text-slate-400">Kcal</p><p className="font-bold text-slate-700">{recipe.kcal}</p></div>
              <div><p className="text-rose-500">Prot</p><p className="font-bold text-slate-700">{recipe.protein}g</p></div>
              <div><p className="text-amber-500">Carb</p><p className="font-bold text-slate-700">{recipe.carbs}g</p></div>
              <div><p className="text-blue-500">Grasa</p><p className="font-bold text-slate-700">{recipe.fat}g</p></div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-600">Pasos de elaboración:</p>
              <ol className="list-decimal list-inside text-[11px] text-slate-500 space-y-1">
                {recipe.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. VISTA DE SEGUIMIENTO ANTROPOMÉTRICO
function AnthropometryView({ measurements, setMeasurements }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    waist: '',
    hips: '',
    chest: '',
    thigh: ''
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.weight) return;
    setMeasurements(prev => [form, ...prev]);
    setForm({ date: new Date().toISOString().split('T')[0], weight: '', waist: '', hips: '', chest: '', thigh: '' });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500" /> Nuevo Registro Antropométrico
        </h2>

        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="71.45" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Cintura (cm)</label>
              <input type="number" step="0.5" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} placeholder="75" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Cadera (cm)</label>
              <input type="number" step="0.5" value={form.hips} onChange={e => setForm({...form, hips: e.target.value})} placeholder="93" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-200">
            Guardar Medidas
          </button>
        </form>
      </div>

      {/* Historial */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial Registrado</h3>
        <div className="space-y-2">
          {measurements.map((m, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">{m.date}</p>
                <p className="text-[10px] text-slate-400">Cintura: {m.waist || '-'}cm | Cadera: {m.hips || '-'}cm</p>
              </div>
              <span className="text-sm font-extrabold text-emerald-600">{m.weight} kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. VISTA DE CALCULADORA HARRIS-BENEDICT Y DINÁMICA DE MACROS
function ProfileView({ profile, setProfile, bmr, tef, targetKcal }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Harris Benedict Config */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" /> Harris-Benedict & Factores
        </h2>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Peso (kg)</label>
              <input type="number" step="0.1" name="weight" value={profile.weight} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Altura (cm)</label>
              <input type="number" name="height" value={profile.height} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Factor de Actividad Diario</label>
            <select name="activity" value={profile.activity} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
              <option value={1.2}>Sedentario (1.2)</option>
              <option value={1.375}>Ligeramente Activo (1.375)</option>
              <option value={1.55}>Moderadamente Activo (1.55)</option>
              <option value={1.725}>Muy Activo (1.725)</option>
              <option value={1.9}>Hiperactivo / Atleta (1.9)</option>
            </select>
          </div>

          {/* Objetivos */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Objetivo Calórico</label>
            <select name="goal" value={profile.goal} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
              <option value="deficit">Déficit Calórico (Pérdida de Grasa)</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="surplus">Superávit Calórico (Masa Muscular)</option>
            </select>
          </div>

          {profile.goal !== 'maintenance' && (
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Intensidad del Objetivo</label>
              <select name="goalIntensity" value={profile.goalIntensity} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
                <option value={0.10}>Moderado (10%)</option>
                <option value={0.15}>Estándar (15%)</option>
                <option value={0.20}>Agresivo (20%)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Reparto Dinámico de Macros */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
        <h3 className="text-xs font-bold text-slate-900">Ajuste Dinámico de Macronutrientes (%)</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-rose-500 font-bold mb-1">Proteína %</label>
            <input type="number" name="proteinPct" value={profile.proteinPct} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-bold text-center" />
          </div>
          <div>
            <label className="block text-amber-500 font-bold mb-1">Carbos %</label>
            <input type="number" name="carbsPct" value={profile.carbsPct} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-bold text-center" />
          </div>
          <div>
            <label className="block text-blue-500 font-bold mb-1">Grasas %</label>
            <input type="number" name="fatPct" value={profile.fatPct} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-bold text-center" />
          </div>
        </div>
      </div>

      {/* Desglose Metabólico */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-2 text-xs">
        <div className="flex justify-between border-b border-slate-800 pb-1.5">
          <span className="text-slate-400">Metabolismo Basal (BMR)</span>
          <span className="font-bold">{Math.round(bmr)} kcal</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-1.5">
          <span className="text-slate-400">Efecto Térmico Alimentos (+10% TEF)</span>
          <span className="font-bold">{Math.round(tef)} kcal</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-emerald-400 font-bold">Objetivo Final Calculado</span>
          <span className="text-base font-extrabold text-emerald-400">{targetKcal} kcal</span>
        </div>
      </div>
    </div>
  );
}