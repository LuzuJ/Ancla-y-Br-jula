
import React from 'react';

const Perfil: React.FC = () => {
  return (
    <div className="h-full p-6 animate-fade-in overflow-y-auto pb-24">
       <h2 className="text-3xl font-light text-white tracking-widest mb-8">PERFIL</h2>
       
       <div className="space-y-6">
         {/* Identity Card */}
         <div className="bg-calm-800 p-6 rounded-2xl border border-calm-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-16 h-16 bg-calm-700 rounded-full flex items-center justify-center text-2xl shadow-inner border border-calm-600">🧘</div>
              <div>
                <h3 className="text-white font-medium text-lg">Viajero Interior</h3>
                <p className="text-sm text-calm-accent">Modo: Local First</p>
              </div>
            </div>
            <button className="mt-2 w-full py-2 bg-calm-700/50 hover:bg-calm-700 text-sm text-gray-300 rounded-lg transition-colors border border-calm-600">
               Iniciar Sesión / Respaldo
            </button>
         </div>

         {/* Stats */}
         <div className="bg-calm-800 p-6 rounded-2xl border border-calm-700">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               Estadísticas de Vitalidad
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-calm-700/50">
                 <span className="text-gray-300 text-sm">Racha de Días Conscientes</span>
                 <span className="text-white font-mono text-lg">1</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-calm-700/50">
                 <span className="text-gray-300 text-sm">Sesiones de Ancla</span>
                 <span className="text-calm-accent font-mono text-lg">0</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-calm-700/50">
                 <span className="text-gray-300 text-sm">Entradas en Bitácora</span>
                 <span className="text-calm-highlight font-mono text-lg">0</span>
               </div>
            </div>
         </div>

         {/* Settings */}
         <div className="bg-calm-800 p-6 rounded-2xl border border-calm-700">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Preferencias</h3>
            <div className="flex items-center justify-between mb-4">
               <span className="text-gray-300 text-sm">Modo Oscuro</span>
               <div className="w-10 h-6 bg-calm-accent rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-calm-900 rounded-full"></div>
               </div>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-gray-300 text-sm">Notificación Impulso</span>
               <span className="text-calm-highlight text-sm">08:00 AM</span>
            </div>
         </div>

         <div className="text-center mt-8 pb-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Ancla y Brújula v1.0</p>
         </div>
       </div>
    </div>
  );
};

export default Perfil;
