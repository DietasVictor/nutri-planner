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
  Settings,
  X,
  Dumbbell,
  Grid,
  List,
  TrendingUp
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
    steps: ['Servir yogur griego sin azúcar.', 'Añadir nueces y arándanos.']
  }
];

function getCurrentWeekDays(baseDate = new Date()) {
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
      monthName: d.toLocaleString('es-ES', { month: 'long' })
    });
  }
  return days;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');
  const [weekDays] = useState(() => getCurrentWeekDays());

  // CLAVES PERSISTENTES FIJAS (Sin sufijos de versión para no perder datos nunca)
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('nutri_app_recipes');
    if (saved) return JSON.parse(saved);
    // Migración automática de versiones anteriores si existen
    const v6 = localStorage.getItem('nutri_recipes_v6');
    return v6 ? JSON.parse(v6) : INITIAL_RECIPES;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_app_profile');
    if (saved) return JSON.parse(saved);
    const v6 = localStorage.getItem('nutri_profile_v6');
    return v6 ? JSON.parse(v6) : {
      weight: 71.45,
      height: 175,
      age: 30,
      gender: 'male',
      activity: 1.375,
      goal: 'maintenance',
      goalIntensity: 0.15,
      proteinPct: 30,
      carbsPct: 45,
      fatPct: 25
    };
  });

  const [sportsLog, setSportsLog] = useState(() => {
    const saved = localStorage.getItem('nutri_app_sports');
    if (saved) return JSON.parse(saved);
    const v6 = localStorage.getItem('nutri_sports_v6');
    return v6 ? JSON.parse(v6) : [];
  });

  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('nutri_app_measurements');
    if (saved) return JSON.parse(saved);
    const v6 = localStorage.getItem('nutri_measurements_v6');
    return v6 ? JSON.parse(v6) : [
      { 
        id: 'm1',
        date: '2026-02-09', 
        weight: 71.45, 
        chest: 93.5, 
        hips: 93, 
        waist: 75, 
        rightThigh: 58, 
        leftThigh: 58.5, 
        rightCalf: 37.5, 
        leftCalf: 37.5, 
        neck: 36,
        bodyFat: 14.8
      }
    ];
  });

  const [weeklyMenu, setWeeklyMenu] = useState(() => {
    const saved = localStorage.getItem('nutri_app_menu');
    if (saved) return JSON.parse(saved);
    const v6 = localStorage.getItem('nutri_weekly_menu_v6');
    return v6 ? JSON.parse(v6) : {};
  });

  // GUARDADO PERMANENTE EN CLAVES FIJAS
  useEffect(() => { localStorage.setItem('nutri_app_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('nutri_app_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('nutri_app_sports', JSON.stringify(sportsLog)); }, [sportsLog]);
  useEffect(() => { localStorage.setItem('nutri_app_measurements', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('nutri_app_menu', JSON.stringify(weeklyMenu)); }, [weeklyMenu]);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-md shadow-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">NutriPlan PWA</h1>
              <p className="text-xs text-slate-400 font-medium">Mes: {weekDays[0].monthName.toUpperCase()}</p>
            </div>
          </div>

          <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-100">
            <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            <span>MET Base: {fixedBaseTargetKcal} kcal</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {activeTab === 'plan' && (
          <PlanView 
            weeklyMenu={weeklyMenu} 
            setWeeklyMenu={setWeeklyMenu}
            recipes={recipes}
            profile={profile}
            fixedBaseTargetKcal={fixedBaseTargetKcal}
            getSportsKcalForDate={getSportsKcalForDate}
            weekDays={weekDays}
          />
        )}
        {activeTab === 'sports' && (
          <SportsView 
            sportsLog={sportsLog} 
            setSportsLog={setSportsLog}
            weekDays={weekDays}
          />
        )}
        {activeTab === 'recipes' && <RecipesView recipes={recipes} setRecipes={setRecipes} />}
        {activeTab === 'anthropometry' && (
          <AnthropometryView 
            measurements={measurements} 
            setMeasurements={setMeasurements}
            profile={profile}
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
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 py-2.5 px-4 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton id="plan" label="Menú Semanal" icon={<Calendar className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="sports" label="Deportes" icon={<Dumbbell className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="recipes" label="Recetas" icon={<ChefHat className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="anthropometry" label="Medidas" icon={<Scale className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="profile" label="MET & Macros" icon={<Settings className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </nav>
    </div>
  );
}

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

function PlanView({ weeklyMenu, setWeeklyMenu, recipes, profile, fixedBaseTargetKcal, getSportsKcalForDate, weekDays }) {
  const meals = ['Desayuno', 'Media Mañana', 'Comida', 'Merienda', 'Cena'];
  const [selectedDateKey, setSelectedDateKey] = useState(weekDays[0].key);
  const [viewMode, setViewMode] = useState('matrix');

  const assignRecipe = (dateKey, mealName, recipe) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || {}), [mealName]: recipe }
    }));
  };

  const removeRecipe = (dateKey, mealName) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || {}), [mealName]: null }
    }));
  };

  const getDayMacros = (dayKcal) => {
    return {
      protein: Math.round((dayKcal * (profile.proteinPct / 100)) / 4),
      carbs: Math.round((dayKcal * (profile.carbsPct / 100)) / 4),
      fat: Math.round((dayKcal * (profile.fatPct / 100)) / 9)
    };
  };

  const selectedDaySportsKcal = getSportsKcalForDate(selectedDateKey);
  const selectedDayTotalKcal = fixedBaseTargetKcal + selectedDaySportsKcal;
  const selectedDayMacros = getDayMacros(selectedDayTotalKcal);
  const currentDayInfo = weekDays.find(d => d.key === selectedDateKey) || weekDays[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Menú Semanal — Mes de {currentDayInfo.monthName.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-400">Las metas calóricas se adaptan al gasto deportivo del día.</p>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setViewMode('matrix')} 
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'matrix' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Vista Matriz 7 Días
          </button>
          <button 
            onClick={() => setViewMode('cards')} 
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Vista por Día
          </button>
        </div>
      </div>

      {viewMode === 'matrix' && (
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <table className="w-full text-left min-w-[780px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-2 text-xs font-bold text-slate-400 uppercase w-28">Comida</th>
                {weekDays.map(d => {
                  const daySports = getSportsKcalForDate(d.key);
                  const dayTotal = fixedBaseTargetKcal + daySports;
                  return (
                    <th key={d.key} className="p-2 text-center">
                      <p className="text-xs font-bold text-slate-800">{d.dayName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{d.dateFormatted}</p>
                      <span className="text-[10px] font-extrabold text-emerald-600 block mt-0.5">{dayTotal} kcal</span>
                      {daySports > 0 && <span className="text-[9px] text-amber-600 font-bold block">+{daySports} dep.</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meals.map(meal => (
                <tr key={meal} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-xs text-slate-600 bg-slate-50/80 rounded-l-xl">{meal}</td>
                  {weekDays.map(d => {
                    const current = weeklyMenu[d.key]?.[meal];
                    return (
                      <td key={d.key} className="p-1.5 align-top">
                        {current ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-[10px] space-y-1 relative group">
                            <p className="font-bold text-slate-800 truncate">{current.name}</p>
                            <div className="flex justify-between items-center text-[9px] text-emerald-700">
                              <span>{current.kcal} kcal</span>
                              <button onClick={() => removeRecipe(d.key, meal)} className="text-rose-500 hover:underline">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <select
                            onChange={(e) => {
                              const found = recipes.find(r => r.id === e.target.value);
                              if (found) assignRecipe(d.key, meal, found);
                            }}
                            defaultValue=""
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-[10px] text-slate-500 focus:outline-none"
                          >
                            <option value="" disabled>+ Receta</option>
                            {recipes.map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({r.kcal}k)</option>
                            ))}
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
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-100'
                }`}
              >
                {d.fullLabel}
              </button>
            ))}
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Meta para {currentDayInfo.fullLabel}</h3>
                {selectedDaySportsKcal > 0 && <span className="text-[10px] text-amber-600 font-bold">Incluye +{selectedDaySportsKcal} kcal por deporte</span>}
              </div>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{selectedDayTotalKcal} kcal</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100">
                <p className="text-[10px] uppercase font-bold text-rose-500">Proteínas</p>
                <p className="text-sm font-extrabold text-rose-700">{selectedDayMacros.protein}g</p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                <p className="text-[10px] uppercase font-bold text-amber-500">Carbos</p>
                <p className="text-sm font-extrabold text-amber-700">{selectedDayMacros.carbs}g</p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                <p className="text-[10px] uppercase font-bold text-blue-500">Grasas</p>
                <p className="text-sm font-extrabold text-blue-700">{selectedDayMacros.fat}g</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {meals.map((meal) => {
              const currentRecipe = weeklyMenu[selectedDateKey]?.[meal];
              return (
                <div key={meal} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{meal}</span>
                    {currentRecipe && (
                      <button onClick={() => removeRecipe(selectedDateKey, meal)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg">
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
                    <select 
                      onChange={(e) => {
                        const found = recipes.find(r => r.id === e.target.value);
                        if (found) assignRecipe(selectedDateKey, meal, found);
                      }}
                      defaultValue=""
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none"
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
    </div>
  );
}

function SportsView({ sportsLog, setSportsLog, weekDays }) {
  const [sportType, setSportType] = useState('Gimnasio');
  const [calories, setCalories] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState(weekDays[0].key);

  const sportsOptions = ['Ciclismo', 'Carrera', 'Natación', 'Gimnasio', 'Otros'];

  const handleAddSport = (e) => {
    e.preventDefault();
    if (!calories) return;

    const newEntry = {
      id: 's_' + Date.now(),
      dateKey: selectedDateKey,
      type: sportType,
      calories: Number(calories)
    };

    setSportsLog(prev => [newEntry, ...prev]);
    setCalories('');
  };

  const handleRemove = (id) => {
    setSportsLog(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-emerald-500" /> Registrar Actividad Deportiva
        </h2>

        <form onSubmit={handleAddSport} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Día de la Semana</label>
              <select value={selectedDateKey} onChange={e => setSelectedDateKey(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
                {weekDays.map(d => <option key={d.key} value={d.key}>{d.fullLabel}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Tipo de Deporte</label>
              <select value={sportType} onChange={e => setSportType(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
                {sportsOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Gasto Calórico (kcal)</label>
              <input type="number" required placeholder="300" value={calories} onChange={e => setCalories(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">
            + Añadir Sesión Deportiva
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sesiones Registradas en la Semana</h3>
        <div className="space-y-2">
          {sportsLog.map((s) => {
            const dayInfo = weekDays.find(d => d.key === s.dateKey) || { fullLabel: s.dateKey };
            return (
              <div key={s.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold mr-2">{dayInfo.fullLabel}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{s.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-slate-800">+{s.calories} kcal</span>
                  <button onClick={() => handleRemove(s.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecipesView({ recipes, setRecipes }) {
  const [showModal, setShowModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', category: 'Comida', prepTime: '20 min', difficulty: 'Fácil', kcal: '', protein: '', carbs: '', fat: '', steps: '' });

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
      steps: newRecipe.steps ? newRecipe.steps.split('\n') : ['Cocinar e integrar ingredientes.']
    };
    setRecipes(prev => [created, ...prev]);
    setShowModal(false);
  };

  const handleRemoveRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-emerald-500" /> Base de Datos de Recetas
        </h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
          <Plus className="w-4 h-4" /> Nueva Receta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{recipe.category}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{recipe.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{recipe.difficulty}</span>
                <button 
                  onClick={() => handleRemoveRecipe(recipe.id)}
                  className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                  title="Eliminar Receta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 bg-slate-50 p-2 rounded-xl text-center text-[10px]">
              <div><p className="text-slate-400">Kcal</p><p className="font-bold">{recipe.kcal}</p></div>
              <div><p className="text-rose-500">Prot</p><p className="font-bold">{recipe.protein}g</p></div>
              <div><p className="text-amber-500">Carb</p><p className="font-bold">{recipe.carbs}g</p></div>
              <div><p className="text-blue-500">Grasa</p><p className="font-bold">{recipe.fat}g</p></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold">Añadir Receta</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddRecipe} className="space-y-3 text-xs">
              <input type="text" required placeholder="Nombre" value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2" />
              <div className="grid grid-cols-4 gap-2">
                <input type="number" required placeholder="Kcal" value={newRecipe.kcal} onChange={e => setNewRecipe({...newRecipe, kcal: e.target.value})} className="bg-slate-50 border rounded-xl px-2 py-1.5" />
                <input type="number" placeholder="Prot" value={newRecipe.protein} onChange={e => setNewRecipe({...newRecipe, protein: e.target.value})} className="bg-slate-50 border rounded-xl px-2 py-1.5" />
                <input type="number" placeholder="Carb" value={newRecipe.carbs} onChange={e => setNewRecipe({...newRecipe, carbs: e.target.value})} className="bg-slate-50 border rounded-xl px-2 py-1.5" />
                <input type="number" placeholder="Fat" value={newRecipe.fat} onChange={e => setNewRecipe({...newRecipe, fat: e.target.value})} className="bg-slate-50 border rounded-xl px-2 py-1.5" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AnthropometryView({ measurements, setMeasurements, profile }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: profile.weight || 71.45,
    chest: 93.5,
    hips: 93,
    waist: 75,
    rightThigh: 58,
    leftThigh: 58.5,
    rightCalf: 37.5,
    leftCalf: 37.5,
    neck: 36
  });

  const calculateBodyFat = (waist, neck, height, hips, gender) => {
    if (!waist || !neck || !height) return 0;
    const h = Number(height);
    const w = Number(waist);
    const n = Number(neck);
    const hp = Number(hips) || 90;

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
      const updated = [entry, ...prev];
      return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  };

  const handleRemoveMeasurement = (id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const chronologicalForGraph = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));

  const latestFat = sortedMeasurements[0]?.bodyFat || calculateBodyFat(75, 36, profile.height, 93, profile.gender);

  const getGraphPoints = () => {
    if (chronologicalForGraph.length === 0) return '';
    const maxWeight = Math.max(...chronologicalForGraph.map(m => Number(m.weight))) + 2;
    const minWeight = Math.min(...chronologicalForGraph.map(m => Number(m.weight))) - 2;
    const range = maxWeight - minWeight || 1;

    return chronologicalForGraph.map((m, idx) => {
      const x = (idx / Math.max(chronologicalForGraph.length - 1, 1)) * 300 + 10;
      const y = 80 - ((Number(m.weight) - minWeight) / range) * 60;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-950 text-white p-5 rounded-3xl shadow-xl flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Estimación % Grasa Corporal (US Navy)</span>
          <p className="text-xs text-emerald-200/70 mt-0.5">Calculado con Cintura, Cuello y Altura</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-emerald-400">{latestFat}%</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-500" /> Evolución Cronológica del Peso (kg)
        </h3>
        {chronologicalForGraph.length > 1 ? (
          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 320 100" className="w-full h-28 stroke-emerald-500 fill-none stroke-[2.5]">
              <polyline points={getGraphPoints()} />
            </svg>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">Añade al menos 2 registros con distinta fecha para trazar el gráfico.</p>
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500" /> Nuevo Registro Antropométrico
        </h2>

        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="block text-slate-400 mb-1">Fecha</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Peso (kg)</label><input type="number" step="0.05" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Cuello (cm)</label><input type="number" step="0.5" value={form.neck} onChange={e => setForm({...form, neck: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Pecho (cm)</label><input type="number" step="0.5" value={form.chest} onChange={e => setForm({...form, chest: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Cintura (cm)</label><input type="number" step="0.5" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Cadera (cm)</label><input type="number" step="0.5" value={form.hips} onChange={e => setForm({...form, hips: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Muslo Dcho (cm)</label><input type="number" step="0.5" value={form.rightThigh} onChange={e => setForm({...form, rightThigh: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Muslo Izq (cm)</label><input type="number" step="0.5" value={form.leftThigh} onChange={e => setForm({...form, leftThigh: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Gemelo Dcho (cm)</label><input type="number" step="0.5" value={form.rightCalf} onChange={e => setForm({...form, rightCalf: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
            <div><label className="block text-slate-400 mb-1">Gemelo Izq (cm)</label><input type="number" step="0.5" value={form.leftCalf} onChange={e => setForm({...form, leftCalf: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 font-semibold" /></div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">
            Guardar Medidas
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Registros</h3>
        <div className="space-y-2">
          {sortedMeasurements.map((m) => (
            <div key={m.id || m.date} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">{m.date}</p>
                <p className="text-[10px] text-slate-400">Cin: {m.waist}cm | Pecho: {m.chest}cm | Muslos: {m.rightThigh}/{m.leftThigh}cm</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-600 block">{m.weight} kg</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{m.bodyFat || latestFat}% grasa</span>
                </div>
                <button 
                  onClick={() => handleRemoveMeasurement(m.id)} 
                  className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                  title="Borrar medida"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileView({ profile, setProfile, bmr, neatKcal, tefKcal, goalAdjustment, fixedBaseTargetKcal }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const targetProteinGrams = Math.round((fixedBaseTargetKcal * (profile.proteinPct / 100)) / 4);
  const targetCarbsGrams = Math.round((fixedBaseTargetKcal * (profile.carbsPct / 100)) / 4);
  const targetFatGrams = Math.round((fixedBaseTargetKcal * (profile.fatPct / 100)) / 9);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" /> Datos Corporales y Metabolismo Fijo
        </h2>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="block text-slate-500 font-semibold mb-1">Peso (kg)</label><input type="number" step="0.1" name="weight" value={profile.weight} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" /></div>
            <div><label className="block text-slate-500 font-semibold mb-1">Altura (cm)</label><input type="number" name="height" value={profile.height} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" /></div>
            <div><label className="block text-slate-500 font-semibold mb-1">Edad</label><input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Factor Actividad (NEAT)</label>
              <select name="activity" value={profile.activity} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
                <option value={1.2}>Sedentario (1.2)</option>
                <option value={1.375}>Ligeramente Activo (1.375)</option>
                <option value={1.55}>Moderadamente Activo (1.55)</option>
                <option value={1.725}>Muy Activo (1.725)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Objetivo Nutricional</label>
              <select name="goal" value={profile.goal} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold">
                <option value="deficit">Déficit Calórico</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="surplus">Superávit Calórico</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
        <h3 className="text-xs font-bold text-slate-900">Ajuste Porcentual de Macronutrientes (%)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
            <label className="block text-rose-600 font-bold mb-1">Proteínas %</label>
            <input type="number" name="proteinPct" value={profile.proteinPct} onChange={handleChange} className="w-full bg-white border border-rose-200 rounded-xl py-1 text-center font-bold text-rose-700" />
            <span className="text-[10px] text-rose-500 font-semibold block mt-1">{targetProteinGrams} g/día</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
            <label className="block text-amber-600 font-bold mb-1">Carbos %</label>
            <input type="number" name="carbsPct" value={profile.carbsPct} onChange={handleChange} className="w-full bg-white border border-amber-200 rounded-xl py-1 text-center font-bold text-amber-700" />
            <span className="text-[10px] text-amber-500 font-semibold block mt-1">{targetCarbsGrams} g/día</span>
          </div>

          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
            <label className="block text-blue-600 font-bold mb-1">Grasas %</label>
            <input type="number" name="fatPct" value={profile.fatPct} onChange={handleChange} className="w-full bg-white border border-blue-200 rounded-xl py-1 text-center font-bold text-blue-700" />
            <span className="text-[10px] text-blue-500 font-semibold block mt-1">{targetFatGrams} g/día</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-2 text-xs">
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-400">1. Metabolismo Basal (BMR)</span>
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
          <span className="text-slate-400">4. Ajuste por Objetivo ({profile.goal})</span>
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