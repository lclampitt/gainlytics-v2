import React, { useEffect, useState } from 'react';

const GoalTimeframeEstimator = ({ goal, setTimeframe }) => {
  const [localTimeframe, setLocalTimeframe] = useState('');

  useEffect(() => {
    let tf = '';
    if (goal === 'Cutting') tf = '8–12 weeks';
    else if (goal === 'Bulking') tf = '12–16 weeks';
    else if (goal === 'Maintenance') tf = 'Ongoing';

    setLocalTimeframe(tf);
    setTimeframe(tf);
  }, [goal, setTimeframe]);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Estimated Timeframe</h2>
      <p className="text-gray-700">
        {goal ? `Expected duration: ${goal === 'Maintenance' ? 'Ongoing lifestyle focus' : localTimeframe}` : 'Select a goal to see timeframe.'}
      </p>
    </div>
  );
};

export default GoalTimeframeEstimator;
