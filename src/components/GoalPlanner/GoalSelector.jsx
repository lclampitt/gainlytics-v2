import React from 'react';

const GoalSelector = ({ goal, setGoal }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Goal</label>
      <div className="flex gap-4">
        {['Cutting', 'Bulking', 'Maintenance'].map((option) => (
          <button
            key={option}
            onClick={() => setGoal(option)}
            className={`py-2 px-4 rounded border ${goal === option ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GoalSelector;
