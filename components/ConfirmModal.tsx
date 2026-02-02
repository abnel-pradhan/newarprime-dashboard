'use client';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDangerous?: boolean; // If true, button is red. If false, button is green.
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, isDangerous = false 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-gray-800 rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
        
        {/* Close Icon */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDangerous ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>
             <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-gray-400 mt-2 text-sm">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
            }`}
          >
            {isDangerous ? 'Yes, Delete' : 'Yes, Confirm'}
          </button>
        </div>

      </div>
    </div>
  );
}