import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Package {
    id: number;
    size: number;
    unit: string;
}

interface MultiPackagingSelectorProps {
    packages: Package[];
    selectedPackages: string[];
    onChange: (selectedIds: string[]) => void;
}

const MultiPackagingSelector: React.FC<MultiPackagingSelectorProps> = ({
    packages,
    selectedPackages,
    onChange
}) => {
    // Geçici seçimleri tutmak için local state
    const [tempSelectedPackages, setTempSelectedPackages] = useState<string[]>(selectedPackages);

    // Props'tan gelen selectedPackages değiştiğinde tempSelectedPackages'i güncelle
    useEffect(() => {
        setTempSelectedPackages(selectedPackages);
    }, [selectedPackages]);

    const handleTogglePackage = (packageId: string) => {
        const newSelectedPackages = tempSelectedPackages.includes(packageId)
            ? tempSelectedPackages.filter(id => id !== packageId)
            : [...tempSelectedPackages, packageId];
        
        setTempSelectedPackages(newSelectedPackages);
        onChange(newSelectedPackages); // Yeni seçimleri gönder
    };

    const handleRemovePackage = (packageId: string) => {
        const newSelectedPackages = tempSelectedPackages.filter(id => id !== packageId);
        setTempSelectedPackages(newSelectedPackages);
        onChange(newSelectedPackages); // Yeni seçimleri gönder
    };

    // Ambalajları birimlerine göre grupla ve sırala
    const groupedPackages = packages.reduce((acc, pkg) => {
        const key = pkg.unit.toUpperCase();
        if (!acc[key]) acc[key] = [];
        acc[key].push(pkg);
        return acc;
    }, {} as Record<string, Package[]>);

    // Her grubu kendi içinde boyuta göre sırala
    Object.keys(groupedPackages).forEach(unit => {
        groupedPackages[unit].sort((a, b) => a.size - b.size);
    });

    // Birimleri sırala (L önce, KG sonra)
    const sortedUnits = Object.keys(groupedPackages).sort((a, b) => {
        if (a === 'L' && b === 'KG') return -1;
        if (a === 'KG' && b === 'L') return 1;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-2">
            {/* Ambalaj Seçim Butonları */}
            <div className="flex flex-col gap-2">
                {sortedUnits.map(unit => (
                    <div key={unit} className="flex flex-wrap gap-2">
                        {groupedPackages[unit].map((pkg) => (
                            <button
                                key={pkg.id}
                                onClick={() => handleTogglePackage(pkg.id.toString())}
                                className={`
                                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${tempSelectedPackages.includes(pkg.id.toString())
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}
                                    min-w-[70px] text-center whitespace-nowrap
                                `}
                            >
                                {pkg.size} {pkg.unit}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Seçili Ambalajlar */}
            {tempSelectedPackages.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tempSelectedPackages.map((packageId) => {
                        const pkg = packages.find(p => p.id.toString() === packageId);
                        return pkg && (
                            <div
                                key={packageId}
                                className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded-lg text-sm border border-slate-700"
                            >
                                <span>{pkg.size} {pkg.unit}</span>
                                <button
                                    onClick={() => handleRemovePackage(packageId)}
                                    className="text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MultiPackagingSelector; 