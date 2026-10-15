import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Calendar, 
  Activity, 
  User, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Flame, 
  Target,
  Check,
  Sparkles
} from 'lucide-react';

// Componente principal NutriPlan
export default function App() {
  const [activeTab, setActiveTab] = useState('plan');

  // Estado del Perfil
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nutri_profile');
    return saved ? JSON.parse(saved) : {
      weight: 70,
      height: 175,
      age: 30,
      gender: 'male',
      activity: 1.2,
      sportsCalories: 300
    };
  });

  // Guardar perfil automáticamente
  useEffect(() => {
    localStorage.setItem('nutri_profile', JSON.stringify(profile));
  }, [profile]);

  // Cálculos metabólicos (Harris-Benedict)
  const calculateBMR = () => {
    if (profile.gender === 'male') {
      return 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      return 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
  };

  const bmr = calculateBMR();
  const tdee = (bmr * profile.activity) + Number(profile.sportsCalories);
  const totalDailyTarget = Math.round(tdee * 1.10); // TEF +10%

  // Distribución objetivo de Macros (50% HC, 20% PROT, 30% FAT)
  const targetProtein = Math.round((totalDailyTarget * 0.20) / 4);
  const targetCarbs = Math.round((totalDailyTarget * 0.50) / 4);
  const targetFat = Math.round((totalDailyTarget * 0.30) / 9);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* Header Superior Estilizado */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-md shadow-emerald-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">NutriPlan</h1>
            <p className="text-xs text-slate-400 font-medium">Planificador Semanal</p>
          </div>
        </div>

        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
          <Flame className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
          <span>{totalDailyTarget} kcal/día</span>
        </div>
      </header>

      {/* Contenido Principal según Pestaña */}
      <main className="max-w-md mx-auto px-4 pt-5">
        {activeTab === 'plan' && (
          <PlanView 
            targetProtein={targetProtein} 
            targetCarbs={targetCarbs} 
            targetFat={targetFat} 
            totalDailyTarget={totalDailyTarget} 
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            profile={profile} 
            setProfile={setProfile} 
            bmr={bmr} 
            totalDailyTarget={totalDailyTarget} 
          />
        )}
      </main>

      {/* Navegación Inferior Flotante Nativa */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 py-2.5 px-6 z-40">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('plan')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${
              activeTab === 'plan' ? 'text-emerald-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === 'plan' ? 'bg-emerald-100/60' : ''}`}>
              <Calendar className="w-5 h-5" />
            </div>
            Plan Semanal
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${
              activeTab === 'profile' ? 'text-emerald-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === 'profile' ? 'bg-emerald-100/60' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            Mi Perfil
          </button>
        </div>
      </nav>
    </div>
  );
}

// Vista de Planificación
function PlanView({ targetProtein, targetCarbs, targetFat, totalDailyTarget }) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const [selectedDay, setSelectedDay] = useState('Lunes');

  return (
    <div className="space-y-5">
      {/* Selector de Días Horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Resumen de Macros Objetivos */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Meta Diaria de Nutrientes
          </h2>
          <span className="text-xs text-slate-400">{selectedDay}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MacroCard label="Proteínas" value={`${targetProtein}g`} color="bg-rose-500" bgColor="bg-rose-50" textColor="text-rose-700" />
          <MacroCard label="Carbos" value={`${targetCarbs}g`} color="bg-amber-500" bgColor="bg-amber-50" textColor="text-amber-700" />
          <MacroCard label="Grasas" value={`${targetFat}g`} color="bg-blue-500" bgColor="bg-blue-50" textColor="text-blue-700" />
        </div>
      </div>

      {/* Tarjeta de Comidas del Día */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Menú Configurado</h3>
        <div className="text-center py-8 text-slate-400 space-y-2">
          <Utensils className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-xs font-medium">Aún no has añadido comidas para este día.</p>
          <button className="mt-2 text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 hover:underline">
            <Plus className="w-3.5 h-3.5" /> Añadir alimento
          </button>
        </div>
      </div>
    </div>
  );
}

// Tarjeta individual de Macro
function MacroCard({ label, value, color, bgColor, textColor }) {
  return (
    <div className={`${bgColor} p-3 rounded-2xl border border-black/5 flex flex-col justify-between`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-2 h-2 rounded-full ${color}`}></span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <span className={`text-base font-extrabold ${textColor}`}>{value}</span>
    </div>
  );
}

// Vista del Perfil y Calculadora MET
function ProfileView({ profile, setProfile, bmr, totalDailyTarget }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Ajuste de Datos Corporales
        </h2>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Peso (kg)</label>
              <input 
                type="number" 
                name="weight" 
                value={profile.weight} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Altura (cm)</label>
              <input 
                type="number" 
                name="height" 
                value={profile.height} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Edad</label>
              <input 
                type="number" 
                name="age" 
                value={profile.age} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Gasto Deporte (kcal)</label>
              <input 
                type="number" 
                name="sportsCalories" 
                value={profile.sportsCalories} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desglose Metabólico */}
      <div className="bg-emerald-950 text-white p-5 rounded-3xl shadow-xl shadow-emerald-950/10 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resultados Calculados</h3>
        <div className="flex justify-between items-baseline border-b border-emerald-900/60 pb-2">
          <span className="text-xs text-emerald-200/80">Metabolismo Basal (BMR)</span>
          <span className="text-sm font-bold text-white">{Math.round(bmr)} kcal</span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-xs text-emerald-200/80">Meta Diaria (+10% TEF)</span>
          <span className="text-lg font-extrabold text-emerald-400">{totalDailyTarget} kcal</span>
        </div>
      </div>
    </div>
  );
}