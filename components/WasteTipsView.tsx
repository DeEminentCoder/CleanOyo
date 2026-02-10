
import React, { useState } from 'react';
import { getWasteManagementTips } from '../services/geminiService';

export const WasteTipsView: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tips = [
    { title: 'Drainage Protection', icon: '🌊', text: 'Never dump waste into gutters. During the rainy season in Ibadan, blocked drains are the #1 cause of flash floods in areas like Challenge and Akobo.', category: 'Safety' },
    { title: 'Organic Composting', icon: '🍎', text: 'Peelings from yam, cassava, and plantain can be turned into rich fertilizer for your home garden instead of filling up bins.', category: 'Sustainability' },
    { title: 'Plastic Sorting', icon: '♻️', text: 'Separate PET bottles (Pure Water sachets, Coke bottles). Clean plastics can often be sold to local recyclers in Dugbe.', category: 'Recycling' },
    { title: 'PSP Coordination', icon: '📞', text: 'Ensure your waste bin is accessible on collection mornings to avoid missed pickups and waste accumulation.', category: 'Efficiency' }
  ];

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsLoading(true);
    // Reuse the existing service or a similar logic
    const answer = await getWasteManagementTips(question); 
    setAiAnswer(answer);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clean Ibadan Knowledge Base</h2>
          <p className="text-slate-500 text-sm">Educational resources for sustainable waste management.</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">Ibadan Waste Pilot v1.0</span>
      </div>
      
      {/* AI Assistant Section */}
      <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl">🤖</div>
          <h3 className="font-bold text-slate-800">Ask WasteUp AI</h3>
        </div>
        <form onSubmit={handleAskAI} className="relative">
          <input 
            type="text"
            className="w-full p-4 pr-32 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="e.g. How do I dispose of old batteries in Ibadan?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white px-6 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : 'Ask AI'}
          </button>
        </form>
        {aiAnswer && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-slate-700 leading-relaxed italic">"{aiAnswer}"</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">{tip.icon}</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">{tip.category}</span>
                <h3 className="font-bold text-slate-900">{tip.title}</h3>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">{tip.text}</p>
          </div>
        ))}
      </div>

      {/* Local Recycling Directory */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-4">Ibadan Recycling Directory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="font-bold text-emerald-400">Dugbe Metals</p>
            <p className="text-xs text-slate-400">Scrap metal & heavy recycling</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="font-bold text-emerald-400">Challenge Plastics</p>
            <p className="text-xs text-slate-400">PET bottle collection hub</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="font-bold text-emerald-400">Bodija Eco-Market</p>
            <p className="text-xs text-slate-400">Paper and carton processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};
