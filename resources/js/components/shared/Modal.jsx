import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidthClass = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative w-full ${maxWidthClass} bg-white rounded-xl shadow-xl border border-gray-200`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 min-w-[40px] min-h-[40px] flex items-center justify-center">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
