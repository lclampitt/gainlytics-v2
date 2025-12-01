import React from 'react';

const MacroPlanner = ({ macros, setMacros }) => {
  const handleChange = (e) => {
    setMacros({
      ...macros,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Macronutrients</h2>
      <div className="grid grid-cols-2 gap-4">
        {['calories', 'protein', 'carbs', 'fat'].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
            <input
              type="number"
              name={key}
              value={macros[key]}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroPlanner;
