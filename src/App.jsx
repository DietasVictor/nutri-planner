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
  Percent,
  Calculator
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
    category: 'Comida',
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

  // Estado de Recetas Persistente
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('nutri_recipes_v3');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  // Estado del Perfil
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_profile_v3');
    return saved ? JSON.parse(saved) : {
      weight: 71.45,
      height: 175,
      age: 30,
      gender: 'male',
      activity: 1.375,
      sportsCalories: 250,
      goal: 'maintenance',
      goalIntensity: 0.15,
      proteinPct: 25,
      carbsPct: 45,
      fatPct: 30
    };
  });

  // Historial Antropométrico
  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('nutri_measurements_v3');
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
    const saved = localStorage.getItem('nutri_weekly_menu_v3');
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

  // Persistencia Local
  useEffect(() => { localStorage.setItem('nutri_recipes_v3', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('nutri_profile_v3', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('nutri_measurements_v3', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('nutri_weekly_menu_v3', JSON.stringify(weeklyMenu)); }, [weeklyMenu]);

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
  const sportsKcal = Number(profile.sportsCalories);
  const tdee = bmr + neatKcal + sportsKcal;
  const tefKcal = tdee * 0.10; // TEF 10%
  const totalBaseKcal = tdee + tefKcal;

  let goalAdjustment = 0;
  if (profile.goal === 'deficit') goalAdjustment = -(totalBaseKcal * profile.goalIntensity);
  if (profile.goal === 'surplus') goalAdjustment = (totalBaseKcal * profile.goalIntensity);

  const targetKcal = Math.round(totalBaseKcal + goalAdjustment);

  const targetProteinGrams = Math.round((targetKcal * (profile.proteinPct / 100)) / 4);
  const targetCarbsGrams = Math.round((targetKcal * (profile.carbsPct / 100)) / 4);
  const targetFatGrams = Math.round((targetKcal * (profile.fatPct / 100)) / 9);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* Header adaptable */}
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

      {/* Main Container amplio */}
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
          />
        )}
      </main>

      {/* Navegación Inferior Flotante */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 py-2.5 px-4 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton id="plan" label="Menú Semanal" icon={<Calendar className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="recipes" label="Recetas" icon={<ChefHat className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="anthropometry" label="Medidas & %Grasa" icon={<Scale className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="profile" label="Desglose MET" icon={<Settings className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
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

// 1. MENÚ SEMANAL CON MODO MÓVIL Y CUADRÍCULA COMPLETA PC
function PlanView({ weeklyMenu, setWeeklyMenu, recipes, targetProtein, targetCarbs, targetFat, targetKcal }) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = ['Desayuno', 'Media Mañana', 'Comida', 'Merienda', 'Cena'];
  const [selectedDay, setSelectedDay] = useState('Lunes');

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
    <div className="space-y-6">
      {/* Selector Días para Pantallas Pequeñas */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
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

      {/* Tarjeta de Resumen de Metas Nutricionales */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Meta Diaria Recomendada
          </h2>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{targetKcal} kcal</span>
        </div>
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
      </div>

      {/* VISTA MÓVIL (Día Único Seleccionado) */}
      <div className="lg:hidden space-y-3">
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

      {/* VISTA PC / TABLET (7 Días Completos en Cuadrícula Ancha) */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-3">
        {days.map((day) => (
          <div key={day} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 text-center border-b pb-2">{day}</h3>
            <div className="space-y-3">
              {meals.map((meal) => {
                const currentRecipe = weeklyMenu[day]?.[meal];
                return (
                  <div key={meal} className="bg-slate-50 p-2 rounded-xl text-[11px] space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{meal}</span>
                    {currentRecipe ? (
                      <div className="relative group">
                        <p className="font-bold text-slate-800 truncate">{currentRecipe.name}</p>
                        <p className="text-[9px] text-emerald-600 font-semibold">{currentRecipe.kcal} kcal</p>
                        <button 
                          onClick={() => removeRecipe(day, meal)}
                          className="text-rose-500 text-[9px] hover:underline block mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <select 
                        onChange={(e) => {
                          const found = recipes.find(r => r.id === e.target.value);
                          if (found) assignRecipe(day, meal, found);
                        }}
                        defaultValue=""
                        className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-500"
                      >
                        <option value="" disabled>+</option>
                        {recipes.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. RECETARIO CON FORMULARIO MODAL PARA AÑADIR NUEVAS RECETAS
function RecipesView({ recipes, setRecipes }) {
  const [showModal, setShowModal] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    category: 'Comida',
    prepTime: '20 min',
    difficulty: 'Fácil',
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
    steps: ''
  });

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
      steps: newRecipe.steps ? newRecipe.steps.split('\n') : ['Añadir ingrediente y cocinar.']
    };

    setRecipes(prev => [created, ...prev]);
    setShowModal(false);
    setNewRecipe({ name: '', category: 'Comida', prepTime: '20 min', difficulty: 'Fácil', kcal: '', protein: '', carbs: '', fat: '', steps: '' });
  };

  const filtered = filterDifficulty === 'All' 
    ? recipes 
    : recipes.filter(r => r.difficulty === filterDifficulty);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-emerald-500" /> Base de Datos de Recetas
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-200"
        >
          <Plus className="w-4 h-4" /> Nueva Receta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recipe) => (
          <div key={recipe.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{recipe.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{recipe.name}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  recipe.difficulty === 'Fácil' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {recipe.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-2xl text-center text-[10px] my-3">
                <div><p className="text-slate-400">Kcal</p><p className="font-bold text-slate-700">{recipe.kcal}</p></div>
                <div><p className="text-rose-500">Prot</p><p className="font-bold text-slate-700">{recipe.protein}g</p></div>
                <div><p className="text-amber-500">Carb</p><p className="font-bold text-slate-700">{recipe.carbs}g</p></div>
                <div><p className="text-blue-500">Grasa</p><p className="font-bold text-slate-700">{recipe.fat}g</p></div>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                <p className="font-bold text-slate-700 text-[11px]">Pasos:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t">
              <Clock className="w-3 h-3" /> Tiempo de elaboración: {recipe.prepTime}
            </p>
          </div>
        ))}
      </div>

      {/* Modal para Crear Nueva Receta */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Añadir Nueva Receta</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecipe} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nombre de la Receta</label>
                <input type="text" required value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} placeholder="Ej. Arroz con Atún" className="w-full bg-slate-50 border rounded-xl px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Categoría</label>
                  <select value={newRecipe.category} onChange={e => setNewRecipe({...newRecipe, category: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-2">
                    <option value="Desayuno">Desayuno</option>
                    <option value="Media Mañana">Media Mañana</option>
                    <option value="Comida">Comida</option>
                    <option value="Merienda">Merienda</option>
                    <option value="Cena">Cena</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Dificultad</label>
                  <select value={newRecipe.difficulty} onChange={e => setNewRecipe({...newRecipe, difficulty: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-2">
                    <option value="Fácil">Fácil</option>
                    <option value="Media">Media</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Kcal</label>
                  <input type="number" required value={newRecipe.kcal} onChange={e => setNewRecipe({...newRecipe, kcal: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" />
                </div>
                <div>
                  <label className="block text-rose-500 font-semibold mb-1">Prot(g)</label>
                  <input type="number" value={newRecipe.protein} onChange={e => setNewRecipe({...newRecipe, protein: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" />
                </div>
                <div>
                  <label className="block text-amber-500 font-semibold mb-1">Carb(g)</label>
                  <input type="number" value={newRecipe.carbs} onChange={e => setNewRecipe({...newRecipe, carbs: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" />
                </div>
                <div>
                  <label className="block text-blue-500 font-semibold mb-1">Fat(g)</label>
                  <input type="number" value={newRecipe.fat} onChange={e => setNewRecipe({...newRecipe, fat: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-2 py-1.5" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Pasos de elaboración (un paso por línea)</label>
                <textarea rows="3" value={newRecipe.steps} onChange={e => setNewRecipe({...newRecipe, steps: e.target.value})} placeholder="Paso 1...&#10;Paso 2..." className="w-full bg-slate-50 border rounded-xl px-3 py-2"></textarea>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">
                Guardar Receta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. ANTROPOMETRÍA AMPLIADA CON FÓRMULA DE % DE GRASA (US NAVY)
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

  // Cálculo de % de Grasa (US Navy Method)
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
    const entry = { ...form, bodyFat: bf };
    setMeasurements(prev => [entry, ...prev]);
  };

  const latestFat = measurements[0] 
    ? calculateBodyFat(measurements[0].waist, measurements[0].neck, profile.height, measurements[0].hips, profile.gender)
    : calculateBodyFat(75, 36, profile.height, 93, profile.gender);

  return (
    <div className="space-y-6">
      {/* Indicador % Grasa Corporal Estimado */}
      <div className="bg-emerald-950 text-white p-5 rounded-3xl shadow-xl flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Estimación % Grasa Corporal (US Navy)</span>
          <p className="text-xs text-emerald-200/70 mt-0.5">Calculado con Cintura, Cuello y Altura</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-emerald-400">{latestFat}%</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500" /> Registro Completo de Medidas
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

      {/* Historial de Medidas */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial</h3>
        <div className="space-y-2">
          {measurements.map((m, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">{m.date}</p>
                <p className="text-[10px] text-slate-400">Cin: {m.waist}cm | Pecho: {m.chest}cm | Muslos: {m.rightThigh}/{m.leftThigh}cm</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 block">{m.weight} kg</span>
                <span className="text-[10px] text-slate-500 font-semibold">{m.bodyFat || latestFat}% grasa</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. DESGLOSE METABÓLICO COMPLETO
function ProfileView({ profile, setProfile, bmr, neatKcal, sportsKcal, tefKcal, goalAdjustment, targetKcal }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Ajustes del Perfil */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" /> Datos Corporales y Objetivos
        </h2>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="block text-slate-500 font-semibold mb-1">Peso (kg)</label><input type="number" step="0.1" name="weight" value={profile.weight} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" /></div>
            <div><label className="block text-slate-500 font-semibold mb-1">Altura (cm)</label><input type="number" name="height" value={profile.height} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" /></div>
            <div><label className="block text-slate-500 font-semibold mb-1">Edad</label><input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-semibold" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Actividad Diaria (NEAT)</label>
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

      {/* TARJETA DE DESGLOSE CALÓRICO TOTALMENTE DETALLADO */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Desglose Energético Completo
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">1. Metabolismo Basal (BMR - Harris-Benedict)</span>
            <span className="font-bold text-slate-200">{Math.round(bmr)} kcal</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">2. Actividad Diaria / NEAT</span>
            <span className="font-bold text-slate-200">+{Math.round(neatKcal)} kcal</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">3. Gasto Deportivo Estimado</span>
            <span className="font-bold text-slate-200">+{sportsKcal} kcal</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">4. Efecto Térmico Alimentos (TEF 10%)</span>
            <span className="font-bold text-slate-200">+{Math.round(tefKcal)} kcal</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">5. Ajuste por Objetivo ({profile.goal})</span>
            <span className={`font-bold ${goalAdjustment < 0 ? 'text-rose-400' : goalAdjustment > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
              {Math.round(goalAdjustment)} kcal
            </span>
          </div>
          <div className="flex justify-between pt-2 items-baseline">
            <span className="text-emerald-400 font-extrabold text-sm">TOTAL CALÓRICO OBJETIVO</span>
            <span className="text-xl font-extrabold text-emerald-400">{targetKcal} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}