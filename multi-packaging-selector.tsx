import React, { useState } from 'react';
import { X } from 'lucide-react';

const MultiPackagingSelector = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);

  const liquidPackaging = ['1L', '5L', '20L', '1000L'];
  const powderPackaging = ['1KG', '5KG', '10KG'];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleSizeSelect = (size) => {
    // Eğer zaten seçiliyse, seçimi kaldır
    if (selectedPackages.includes(size)) {
      setSelectedPackages(selectedPackages.filter(item => item !== size));
    } else {
      setSelectedPackages([...selectedPackages, size]);
    }
  };

  const removePackage = (packageToRemove) => {
    setSelectedPackages(selectedPackages.filter(item => item !== packageToRemove));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg space-y-6">
      {/* Ambalaj Tipi Seçimi */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Ambalaj Tipi</label>
        <div className="flex gap-3">
          <button
            onClick={() => handleTypeSelect('liquid')}
            className={`px-4 py-2 rounded-md font-medium transition-all
              ${selectedType === 'liquid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Sıvı
          </button>
          <button
            onClick={() => handleTypeSelect('powder')}
            className={`px-4 py-2 rounded-md font-medium transition-all
              ${selectedType === 'powder' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Toz
          </button>
        </div>
      </div>

      {/* Ambalaj Boyutu Seçimi */}
      {selectedType && (
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Ambalaj Boyutu (Birden fazla seçilebilir)</label>
          <div className="flex flex-wrap gap-3">
            {selectedType === 'liquid' ? (
              liquidPackaging.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 rounded-md font-medium transition-all
                    ${selectedPackages.includes(size)
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {size}
                </button>
              ))
            ) : (
              powderPackaging.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 rounded-md font-medium transition-all
                    ${selectedPackages.includes(size)
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {size}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Seçilen Ambalajlar Listesi */}
      {selectedPackages.length > 0 && (
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <label className="text-sm text-slate-400">Seçilen Ambalajlar</label>
          <div className="flex flex-wrap gap-2">
            {selectedPackages.map((pkg) => (
              <div
                key={pkg}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-md text-sm"
              >
                <span className="text-slate-200">
                  {pkg} {selectedType === 'liquid' ? 'Sıvı' : 'Toz'}
                </span>
                <button
                  onClick={() => removePackage(pkg)}
                  className="text-slate-400 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiPackagingSelector;