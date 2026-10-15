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
  List
} from 'lucide-react';

// Recetas Iniciales
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

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');

  // Recetas
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('nutri_recipes_v4');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  // Perfil
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_profile_v4');
    return saved ? JSON.parse(saved) : {
      weight: 71.45,
      height: 175,
      age: 30,
      gender: 'male',
      activity: 1.375,
      sportsCalories: 250,
      goal: 'maintenance',
      goalIntensity: 0.15,
      proteinPct: 30,
      carbsPct: 45,
      fatPct: 25
    };
  });

  // Registro de Deportes Diarios
  const [sportsLog, setSportsLog] = useState(() => {
    const saved = localStorage.getItem('nutri_sports_v4');
    return saved ? JSON.parse(saved) : [
      { id: 's1', date: new Date().toISOString().split('T')[0], type: 'Gimnasio', calories: 250 }
    ];
  });

  // Medidas Antropométricas
  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('nutri_measurements_v4');
    return saved ? JSON.parse(saved) : [
      { 
        date: '2026-02-09', 
        weight: 71.45, 
        chest: 93.5, 
        hips: 93, 
        waist: 75, 
        rightThigh: 58, 
        leftThigh: 58.5, 
        rightCalf: 37.5, 
        leftCalf: 37.5, 
        neck: 36 
      }
    ];
  });

  // Menú Semanal (5 Comidas)
  const [weeklyMenu, setWeeklyMenu] = useState(() => {
    const saved = localStorage.getItem('nutri_weekly_menu_v4');
    return saved ? JSON.parse(saved) : {
      Lunes: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null },
      Martes: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null },
      Miércoles: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null },
      Jueves: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null },
      Viernes: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null },
      Sábado: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null },
      Domingo: { Desayuno: null, 'Media Mañana': null, Comida: null, Merienda: null, Cena: null }
    };
  });

  // Persistencia
  useEffect(() => { localStorage.setItem('nutri_recipes_v4', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('nutri_profile_v4', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('nutri_sports_v4', JSON.stringify(sportsLog)); }, [sportsLog]);
  useEffect(() => { localStorage.setItem('nutri_measurements_v4', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('nutri_weekly_menu_v4', JSON.stringify(weeklyMenu)); }, [weeklyMenu]);

  // Harris-Benedict Modificada
  const calculateBMR = () => {
    if (profile.gender === 'male') {
      return 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      return 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
  };

  const bmr = calculateBMR();
  const neatKcal = bmr * (Number(profile.activity) - 1);
  const sportsKcal = Number(profile.sportsCalories) || 0;
  const tdee = bmr + neatKcal + sportsKcal;
  const tefKcal = tdee * 0.10;
  const totalBaseKcal = tdee + tefKcal;

  let goalAdjustment = 0;
  if (profile.goal === 'deficit') goalAdjustment = -(totalBaseKcal * Number(profile.goalIntensity));
  if (profile.goal === 'surplus') goalAdjustment = (totalBaseKcal * Number(profile.goalIntensity));

  const targetKcal = Math.round(totalBaseKcal + goalAdjustment);

  const targetProteinGrams = Math.round((targetKcal * (profile.proteinPct / 100)) / 4);
  const targetCarbsGrams = Math.round((targetKcal * (profile.carbsPct / 100)) / 4);
  const targetFatGrams = Math.round((targetKcal * (profile.fatPct / 100)) / 9);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-md shadow-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">NutriPlan PWA</h1>
              <p className="text-xs text-slate-400 font-medium">Planificador Pro</p>
            </div>
          </div>

          <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-100">
            <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            <span>{targetKcal} kcal/día</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {activeTab === 'plan' && (
          <PlanView 
            weeklyMenu={weeklyMenu} 
            setWeeklyMenu={setWeeklyMenu}
            recipes={recipes}
            targetProtein={targetProteinGrams}
            targetCarbs={targetCarbsGrams}
            targetFat={targetFatGrams}
            targetKcal={targetKcal}
          />
        )}
        {activeTab === 'sports' && (
          <SportsView 
            sportsLog={sportsLog} 
            setSportsLog={setSportsLog}
            profile={profile}
            setProfile={setProfile}
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
            sportsKcal={sportsKcal}
            tefKcal={tefKcal}
            goalAdjustment={goalAdjustment}
            targetKcal={targetKcal} 
            targetProteinGrams={targetProteinGrams}
            targetCarbsGrams={targetCarbsGrams}
            targetFatGrams={targetFatGrams}
          />
        )}
      </main>

      {/* Navegación Inferior */}
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

// 1. MENÚ SEMANAL CON DOS MODOS DE VISTA (TARJETAS O MATRIZ COMPLETA 7 DÍAS)
function PlanView({ weeklyMenu, setWeeklyMenu, recipes, targetProtein, targetCarbs, targetFat, targetKcal }) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = ['Desayuno', 'Media Mañana', 'Comida', 'Merienda', 'Cena'];
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const [viewMode, setViewMode] = useState('matrix'); // 'cards' o 'matrix'

  const assignRecipe = (day, mealName, recipe) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealName]: recipe }
    }));
  };

  const removeRecipe = (day, mealName) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealName]: null }
    }));
  };

  return (
    <div className="space-y-5">
      {/* Selector de Modo de Vista y Resumen */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Planificador de Menús</h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">{targetKcal} kcal</span>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setViewMode('matrix')} 
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'matrix' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Vista 7 Días Rápida
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

      {/* Target Macros Resumen */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
          <p className="text-[10px] uppercase font-bold text-rose-500">Proteína</p>
          <p className="text-base font-extrabold text-rose-700">{targetProtein}g</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
          <p className="text-[10px] uppercase font-bold text-amber-500">Carbohidratos</p>
          <p className="text-base font-extrabold text-amber-700">{targetCarbs}g</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
          <p className="text-[10px] uppercase font-bold text-blue-500">Grasas</p>
          <p className="text-base font-extrabold text-blue-700">{targetFat}g</p>
        </div>
      </div>

      {/* VISTA 1: MATRIZ RÁPIDA 7 DÍAS EN TABLA/GRID */}
      {viewMode === 'matrix' && (
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <table className="w-full text-left min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-2 text-xs font-bold text-slate-400 uppercase w-28">Comida</th>
                {days.map(d => (
                  <th key={d} className="p-2 text-xs font-bold text-slate-800 text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meals.map(meal => (
                <tr key={meal} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-xs text-slate-600 bg-slate-50/80 rounded-l-xl">{meal}</td>
                  {days.map(day => {
                    const current = weeklyMenu[day]?.[meal];
                    return (
                      <td key={day} className="p-1.5 align-top">
                        {current ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-[10px] space-y-1 relative group">
                            <p className="font-bold text-slate-800 truncate">{current.name}</p>
                            <div className="flex justify-between items-center text-[9px] text-emerald-700">
                              <span>{current.kcal} kcal</span>
                              <button onClick={() => removeRecipe(day, meal)} className="text-rose-500 hover:underline">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <select
                            onChange={(e) => {
                              const found = recipes.find(r => r.id === e.target.value);
                              if (found) assignRecipe(day, meal, found);
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

      {/* VISTA 2: TARJETAS INDIVIDUALES POR DÍA */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {meals.map((meal) => {
              const currentRecipe = weeklyMenu[selectedDay]?.[meal];
              return (
                <div key={meal} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{meal}</span>
                    {currentRecipe && (
                      <button onClick={() => removeRecipe(selectedDay, meal)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg">
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
                        if (found) assignRecipe(selectedDay, meal, found);
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

// 2. VISTA DE REGISTRO DE DEPORTES REALIZADOS
function SportsView({ sportsLog, setSportsLog, profile, setProfile }) {
  const [sportType, setSportType] = useState('Gimnasio');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const sportsOptions = ['Ciclismo', 'Carrera', 'Natación', 'Gimnasio', 'Otros'];

  const handleAddSport = (e) => {
    e.preventDefault();
    if (!calories) return;

    const newEntry = {
      id: 's_' + Date.now(),
      date,
      type: sportType,
      calories: Number(calories)
    };

    const updatedLog = [newEntry, ...sportsLog];
    setSportsLog(updatedLog);

    // Sumar automáticamente al gasto deportivo del perfil
    const totalTodaySports = updatedLog
      .filter(s => s.date === date)
      .reduce((acc, curr) => acc + curr.calories, 0);

    setProfile(prev => ({ ...prev, sportsCalories: totalTodaySports }));
    setCalories('');
  };

  const handleRemove = (id) => {
    const updated = sportsLog.filter(s => s.id !== id);
    setSportsLog(updated);
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
              <label className="block text-slate-500 font-semibold mb-1">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" />
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

      {/* Historial de Deportes */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Entrenamientos</h3>
        <div className="space-y-2">
          {sportsLog.map((s) => (
            <div key={s.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{s.type}</span>
                <p className="text-slate-400 text-[10px] mt-1">{s.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-slate-800">+{s.calories} kcal</span>
                <button onClick={() => handleRemove(s.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg">
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

// 3. RECETARIO
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
          <div key={recipe.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{recipe.category}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{recipe.name}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{recipe.difficulty}</span>
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

// 4. ANTROPOMETRÍA
function AnthropometryView({ measurements, setMeasurements, profile }) {
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
    }
    return 15;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const bf = calculateBodyFat(form.waist, form.neck, profile.height, form.hips, profile.gender);
    setMeasurements(prev => [{ ...form, bodyFat: bf }, ...prev]);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500" /> Registro Antropométrico
        </h2>
        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><label className="text-slate-400">Peso (kg)</label><input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" /></div>
            <div><label className="text-slate-400">Cintura (cm)</label><input type="number" step="0.5" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" /></div>
            <div><label className="text-slate-400">Cuello (cm)</label><input type="number" step="0.5" value={form.neck} onChange={e => setForm({...form, neck: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" /></div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl">Guardar Registro</button>
        </form>
      </div>
    </div>
  );
}

// 5. AJUSTE DE REQUERIMIENTOS, GASTO DEPORTIVO EDITABLE Y PORCENTAJES DE MACROS
function ProfileView({ profile, setProfile, bmr, neatKcal, sportsKcal, tefKcal, goalAdjustment, targetKcal, targetProteinGrams, targetCarbsGrams, targetFatGrams }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Ajustes MET & Gasto Deportivo Editable */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" /> Parámetros Energéticos
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

            {/* CAMPO EDITABLE DE GASTO DEPORTIVO ESTIMADO */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Gasto Deportivo Estimado (kcal)</label>
              <input 
                type="number" 
                name="sportsCalories" 
                value={profile.sportsCalories} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AJUSTADOR PORCENTUAL DE MACRONUTRIENTES */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
        <h3 className="text-xs font-bold text-slate-900">Ajuste Porcentual de Macronutrientes (%)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
            <label className="block text-rose-600 font-bold mb-1">Proteínas %</label>
            <input 
              type="number" 
              name="proteinPct" 
              value={profile.proteinPct} 
              onChange={handleChange} 
              className="w-full bg-white border border-rose-200 rounded-xl py-1 text-center font-bold text-rose-700" 
            />
            <span className="text-[10px] text-rose-500 font-semibold block mt-1">{targetProteinGrams} g/día</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
            <label className="block text-amber-600 font-bold mb-1">Carbos %</label>
            <input 
              type="number" 
              name="carbsPct" 
              value={profile.carbsPct} 
              onChange={handleChange} 
              className="w-full bg-white border border-amber-200 rounded-xl py-1 text-center font-bold text-amber-700" 
            />
            <span className="text-[10px] text-amber-500 font-semibold block mt-1">{targetCarbsGrams} g/día</span>
          </div>

          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
            <label className="block text-blue-600 font-bold mb-1">Grasas %</label>
            <input 
              type="number" 
              name="fatPct" 
              value={profile.fatPct} 
              onChange={handleChange} 
              className="w-full bg-white border border-blue-200 rounded-xl py-1 text-center font-bold text-blue-700" 
            />
            <span className="text-[10px] text-blue-500 font-semibold block mt-1">{targetFatGrams} g/día</span>
          </div>
        </div>
      </div>

      {/* DESGLOSE DESCRIPTIVO DE CALORÍAS */}
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
          <span className="text-slate-400">3. Gasto Deportivo Estimado</span>
          <span className="font-bold">+{sportsKcal} kcal</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-400">4. Efecto Térmico Alimentos (TEF 10%)</span>
          <span className="font-bold">+{Math.round(tefKcal)} kcal</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-emerald-400 font-bold">OBJETIVO DIARIO FINAL</span>
          <span className="text-lg font-extrabold text-emerald-400">{targetKcal} kcal</span>
        </div>
      </div>
    </div>
  );
}