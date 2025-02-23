'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Sayfa hatası:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="bg-red-500/10 p-4 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Bir Hata Oluştu</h2>
            <p className="text-slate-400 text-center max-w-md">
                Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin veya yöneticinize başvurun.
            </p>
            <button
                onClick={reset}
                className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
                Tekrar Dene
            </button>
        </div>
    );
} 