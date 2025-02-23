export const nutrientContents = {
    'Potasyum nitrat': {
        'K2O': 46.6,
        'N': 13.5
    },
    'Kalsiyum Nitrat': {
        'CaO': 24.2,
        'N': 15.5
    },
    'Magnezyum Nitrat': {
        'MgO': 16.4,
        'N': 10.9
    },
    'Magnezyum Sulfat': {
        'MgO': 13,
        'S': 17.5
    },
    'MAP': {
        'N': 12,
        'P': 61,
        'P2O5': 52
    },
    'Üre': {
        'N': 46
    },
    // Add other materials as needed
};

export const calculateNutrients = (ingredients, totalWeight) => {
    const nutrients = {};
    
    ingredients.forEach(ingredient => {
        const content = nutrientContents[ingredient.name];
        if (content) {
            const ratio = ingredient.quantity / totalWeight;
            Object.entries(content).forEach(([nutrient, percentage]) => {
                const contribution = (percentage * ratio) / 100;
                nutrients[nutrient] = (nutrients[nutrient] || 0) + contribution;
            });
        }
    });
    
    return nutrients;
};
