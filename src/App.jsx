import React, { useState, useEffect } from 'react';
import { 
  User, 
  Utensils, 
  Calendar, 
  Activity, 
  Target, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Flame, 
  Award,
  BarChart3
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner');

  // --- 1. ESTADO DE PERFIL Y METABOLISMO ---
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_profile');
    return saved ? JSON.parse(saved) : {
      gender: 'male',
      age: 30,
      weight: 71.45,
      height: 175,
      sportKcal: 300,
      goal: 'maintenance', // deficit, maintenance, surplus
      customGoalAdjustment: 0, // kcal extra/sub
      macroSplit: { protein: 30, carbs: 40, fat: 30 }
    };
  });

  // Save Profile on Change
  useEffect(() => {
    localStorage.setItem('nutri_profile', JSON.stringify(profile));
  }, [profile]);

  // Harris-Benedict BMR Calculation
  const calculateBMR = () => {
    const w = Number(profile.weight);
    const h = Number(profile.height);
    const a = Number(profile.age);
    if (!w || !h || !a) return 0;

    if (profile.gender === 'male') {
      return 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      return 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }
  };

  const bmr = calculateBMR();
  const pal = 1.2; // Fixed sedentary PAL
  const tefMultiplier = 1.10; // 10% TEF
  const maintenanceKcal = Math.round((bmr * pal + Number(profile.sportKcal || 0)) * tefMultiplier);

  // Goal adjustment calculation
  let targetKcal = maintenanceKcal;
  if (profile.goal === 'deficit') targetKcal -= 300;
  if (profile.goal === 'surplus') targetKcal += 300;
  targetKcal += Number(profile.customGoalAdjustment || 0);

  // Target Macros in Grams
  const targetProteinGrams = Math.round((targetKcal * (profile.macroSplit.protein / 100)) / 4);
  const targetCarbsGrams = Math.round((targetKcal * (profile.macroSplit.carbs / 100)) / 4);
  const targetFatGrams = Math.round((targetKcal * (profile.macroSplit.fat / 100)) / 9);

  // --- 2. BASE DE DATOS DE RECETAS ---
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('nutri_recipes');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Avena con Proteína y Plátano', kcal: 420, protein: 32, carbs: 55, fat: 8, category: 'Desayuno' },
      { id: '2', name: 'Pollo al Horno con Arroz y Verduras', kcal: 580, protein: 45, carbs: 65, fat: 12, category: 'Comida' },
      { id: '3', name: 'Salmón a la Plancha con Ensalada', kcal: 510, protein: 38, carbs: 12, fat: 34, category: 'Cena' },
      { id: '4', name: 'Yogur Griego con Nueces y Fruta', kcal: 280, protein: 18, carbs: 22, fat: 14, category: 'Snack' }
    ];
  });

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '', category: 'Comida' });

  useEffect(() => {
    localStorage.setItem('nutri_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!newRecipe.name) return;
    const item = {
      id: Date.now().toString(),
      name: newRecipe.name,
      kcal: Number(newRecipe.kcal) || 0,
      protein: Number(newRecipe.protein) || 0,
      carbs: Number(newRecipe.carbs) || 0,
      fat: Number(newRecipe.fat) || 0,
      category: newRecipe.category || 'Comida'
    };
    setRecipes([...recipes, item]);
    setNewRecipe({ name: '', kcal: '', protein: '', carbs: '', fat: '', category: 'Comida' });
    setIsRecipeModalOpen(false);
  };

  const handleDeleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  // --- 3. PLANIFICADOR SEMANAL ---
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const mealTypes = ['Desayuno', 'Comida', 'Cena', 'Snack'];
  const [selectedDay, setSelectedDay] = useState('Lunes');

  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem('nutri_plan');
    if (saved) return JSON.parse(saved);

    // Initial structure
    const initial = {};
    daysOfWeek.forEach(day => {
      initial[day] = { Desayuno: null, Comida: null, Cena: null, Snack: null };
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('nutri_plan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  const handleAssignMeal = (day, mealType, recipeId) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: recipeId || null
      }
    }));
  };

  // Compute total day macros
  const getDayTotals = (day) => {
    const dayPlan = weeklyPlan[day] || {};
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

    mealTypes.forEach(meal => {
      const recipeId = dayPlan[meal];
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        totals.kcal += Number(recipe.kcal);
        totals.protein += Number(recipe.protein);
        totals.carbs += Number(recipe.carbs);
        totals.fat += Number(recipe.fat);
      }
    });

    return totals;
  };

  const dayTotals = getDayTotals(selectedDay);

  // --- 4. SEGUIMIENTO DE MÉTRICAS ---
  const [metricsHistory, setMetricsHistory] = useState(() => {
    const saved = localStorage.getItem('nutri_metrics');
    return saved ? JSON.parse(saved) : [
      { date: '2026-02-09', weight: 71.45, chest: 93.5, waist: 75, hips: 93, rightThigh: 58 }
    ];
  });

  const [newMetric, setNewMetric] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: profile.weight,
    chest: '',
    waist: '',
    hips: '',
    rightThigh: ''
  });

  useEffect(() => {
    localStorage.setItem('nutri_metrics', JSON.stringify(metricsHistory));
  }, [metricsHistory]);

  const handleAddMetric = (e) => {
    e.preventDefault();
    setMetricsHistory([{ ...newMetric, weight: Number(newMetric.weight) }, ...metricsHistory]);
    setNewMetric({
      date: new Date().toISOString().split('T')[0],
      weight: profile.weight,
      chest: '',
      waist: '',
      hips: '',
      rightThigh: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Header Bar */}
      <header className="bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Utensils className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">NutriPlan PWA</h1>
          </div>
          <div className="text-xs bg-emerald-700 px-3 py-1 rounded-full font-medium">
            {targetKcal} kcal / día
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4">
        {/* TAB 1: PLANIFICADOR SEMANAL */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            {/* Day Selector */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all shadow-sm ${
                    selectedDay === day
                      ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Daily Macro Progress Dashboard */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Progreso de {selectedDay}
                </h2>
                <span className="text-sm font-semibold text-slate-500">
                  {dayTotals.kcal} / {targetKcal} kcal
                </span>
              </div>

              {/* Calorías Progress Bar */}
              <div>
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dayTotals.kcal > targetKcal ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((dayTotals.kcal / targetKcal) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Macros Breakdown Bars */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Proteínas</div>
                  <div className="text-sm font-bold text-slate-700">{dayTotals.protein}g / {targetProteinGrams}g</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full" 
                      style={{ width: `${Math.min((dayTotals.protein / targetProteinGrams) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Carbos</div>
                  <div className="text-sm font-bold text-slate-700">{dayTotals.carbs}g / {targetCarbsGrams}g</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${Math.min((dayTotals.carbs / targetCarbsGrams) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Grasas</div>
                  <div className="text-sm font-bold text-slate-700">{dayTotals.fat}g / {targetFatGrams}g</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full" 
                      style={{ width: `${Math.min((dayTotals.fat / targetFatGrams) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Selector Cards */}
            <div className="space-y-3">
              {mealTypes.map(meal => {
                const assignedRecipeId = weeklyPlan[selectedDay]?.[meal];
                const recipe = recipes.find(r => r.id === assignedRecipeId);

                return (
                  <div key={meal} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{meal}</span>
                      <h3 className="font-semibold text-slate-800">
                        {recipe ? recipe.name : <span className="text-slate-400 italic">Sin asignar</span>}
                      </h3>
                      {recipe && (
                        <p className="text-xs text-slate-500 mt-1">
                          {recipe.kcal} kcal | P: {recipe.protein}g | C: {recipe.carbs}g | G: {recipe.fat}g
                        </p>
                      )}
                    </div>

                    <select
                      value={assignedRecipeId || ''}
                      onChange={(e) => handleAssignMeal(selectedDay, meal, e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">-- Seleccionar Receta --</option>
                      {recipes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.kcal} kcal)
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RECETAS */}
        {activeTab === 'recipes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Base de Datos de Recetas</h2>
              <button
                onClick={() => setIsRecipeModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Nueva Receta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipes.map(recipe => (
                <div key={recipe.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {recipe.category}
                      </span>
                      <h3 className="font-bold text-slate-800 mt-1">{recipe.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4 text-center bg-slate-50 p-2 rounded-lg">
                    <div>
                      <div className="text-xs text-slate-400">Kcal</div>
                      <div className="text-sm font-bold text-slate-700">{recipe.kcal}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Prot</div>
                      <div className="text-sm font-bold text-blue-600">{recipe.protein}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Carb</div>
                      <div className="text-sm font-bold text-amber-600">{recipe.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Grasa</div>
                      <div className="text-sm font-bold text-rose-600">{recipe.fat}g</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal para Crear Receta */}
            {isRecipeModalOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Añadir Nueva Receta</h3>
                  <form onSubmit={handleAddRecipe} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Nombre</label>
                      <input
                        type="text"
                        required
                        value={newRecipe.name}
                        onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ej. Batido Proteico"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Categoría</label>
                        <select
                          value={newRecipe.category}
                          onChange={e => setNewRecipe({ ...newRecipe, category: e.target.value })}
                          className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                        >
                          {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Calorías (kcal)</label>
                        <input
                          type="number"
                          required
                          value={newRecipe.kcal}
                          onChange={e => setNewRecipe({ ...newRecipe, kcal: e.target.value })}
                          className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                          placeholder="350"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Proteínas (g)</label>
                        <input
                          type="number"
                          value={newRecipe.protein}
                          onChange={e => setNewRecipe({ ...newRecipe, protein: e.target.value })}
                          className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Carbos (g)</label>
                        <input
                          type="number"
                          value={newRecipe.carbs}
                          onChange={e => setNewRecipe({ ...newRecipe, carbs: e.target.value })}
                          className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                          placeholder="40"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Grasas (g)</label>
                        <input
                          type="number"
                          value={newRecipe.fat}
                          onChange={e => setNewRecipe({ ...newRecipe, fat: e.target.value })}
                          className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRecipeModalOpen(false)}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
                      >
                        Guardar Receta
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERFIL & CALCULADORA NUTRICIONAL */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Ajustes Nutricionales
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Género</label>
                  <select
                    value={profile.gender}
                    onChange={e => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  >
                    <option value="male">Hombre</option>
                    <option value="female">Mujer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Edad (años)</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={e => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={e => setProfile({ ...profile, weight: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Altura (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={e => setProfile({ ...profile, height: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Gasto Deportivo Diario (kcal)</label>
                <input
                  type="number"
                  value={profile.sportKcal}
                  onChange={e => setProfile({ ...profile, sportKcal: Number(e.target.value) })}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  placeholder="300"
                />
              </div>

              {/* Objetivo Calórico */}
              <div>
                <label className="text-xs font-semibold text-slate-500">Objetivo Calórico</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'deficit', label: 'Déficit (-300 kcal)' },
                    { id: 'maintenance', label: 'Mantenimiento' },
                    { id: 'surplus', label: 'Superávit (+300 kcal)' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, goal: g.id })}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                        profile.goal === g.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reparto de Macronutrientes (%) */}
              <div>
                <label className="text-xs font-semibold text-slate-500">Reparto de Macronutrientes (%)</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <span className="text-xs text-slate-400">Proteína %</span>
                    <input
                      type="number"
                      value={profile.macroSplit.protein}
                      onChange={e => setProfile({
                        ...profile,
                        macroSplit: { ...profile.macroSplit, protein: Number(e.target.value) }
                      })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Carbos %</span>
                    <input
                      type="number"
                      value={profile.macroSplit.carbs}
                      onChange={e => setProfile({
                        ...profile,
                        macroSplit: { ...profile.macroSplit, carbs: Number(e.target.value) }
                      })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Grasa %</span>
                    <input
                      type="number"
                      value={profile.macroSplit.fat}
                      onChange={e => setProfile({
                        ...profile,
                        macroSplit: { ...profile.macroSplit, fat: Number(e.target.value) }
                      })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm mt-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado Metabólico */}
            <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="font-bold text-white text-base">Resumen Metabólico Calculado</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-emerald-800/60 p-3 rounded-xl">
                  <div className="text-xs text-emerald-200">Tasa Metabólica Basal (BMR)</div>
                  <div className="text-lg font-bold">{Math.round(bmr)} kcal</div>
                </div>
                <div className="bg-emerald-800/60 p-3 rounded-xl">
                  <div className="text-xs text-emerald-200">Mantenimiento (+PAL 1.2 + TEF 10%)</div>
                  <div className="text-lg font-bold">{maintenanceKcal} kcal</div>
                </div>
              </div>
              <div className="bg-emerald-800 p-3 rounded-xl border border-emerald-600/40">
                <div className="text-xs text-emerald-200">Objetivo Calórico Final</div>
                <div className="text-xl font-extrabold text-amber-300">{targetKcal} kcal / día</div>
                <div className="text-xs text-emerald-200 mt-1">
                  Proteína: {targetProteinGrams}g | Carbos: {targetCarbsGrams}g | Grasas: {targetFatGrams}g
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MÉTRICAS ANTROPOMÉTRICAS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Registrar Métricas Corporales
              </h2>

              <form onSubmit={handleAddMetric} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newMetric.date}
                    onChange={e => setNewMetric({ ...newMetric, date: e.target.value })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newMetric.weight}
                    onChange={e => setNewMetric({ ...newMetric, weight: e.target.value })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Pecho (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMetric.chest}
                    onChange={e => setNewMetric({ ...newMetric, chest: e.target.value })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMetric.waist}
                    onChange={e => setNewMetric({ ...newMetric, waist: e.target.value })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Cadera (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMetric.hips}
                    onChange={e => setNewMetric({ ...newMetric, hips: e.target.value })}
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white font-medium p-2.5 rounded-lg hover:bg-emerald-700 text-sm"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            </div>

            {/* Histórico de Registros */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Histórico de Progresos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Peso</th>
                      <th className="p-2.5">Pecho</th>
                      <th className="p-2.5">Cintura</th>
                      <th className="p-2.5">Cadera</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metricsHistory.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-800">{m.date}</td>
                        <td className="p-2.5 font-bold text-emerald-600">{m.weight} kg</td>
                        <td className="p-2.5">{m.chest || '-'} cm</td>
                        <td className="p-2.5">{m.waist || '-'} cm</td>
                        <td className="p-2.5">{m.hips || '-'} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar (Mobile Native Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-20">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'planner' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            Plan
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex flex-col items-center py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'recipes' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
            }`}
          >
            <Utensils className="w-5 h-5 mb-0.5" />
            Recetas
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex flex-col items-center py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'metrics' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'profile' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            Perfil
          </button>
        </div>
      </nav>
    </div>
  );
}