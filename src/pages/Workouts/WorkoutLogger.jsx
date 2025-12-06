import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import '../../styles/WorkoutLogger.css';

export default function WorkoutLogger() {
  // Form state for creating/editing a workout
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);

  // History and UI state
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [expanded, setExpanded] = useState({});

  // Scroll to top when opening the logger
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get the logged-in user from Supabase
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setMessage('⚠️ Please log in to save or view workouts.');
        return;
      }
      setUserId(data.user.id);
    }
    fetchUser();
  }, []);

  // Once we know the user, load their saved workouts
  useEffect(() => {
    if (!userId) return;
    fetchWorkouts();
  }, [userId]);

  // Fetch all workouts for the current user
  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('workout_date', { ascending: false });

    if (error) console.error('Fetch error:', error);
    else setWorkoutHistory(data);
  };

  // Add a new exercise row to the current workout
  const addExercise = () => {
    if (!newExercise.trim()) return;
    setExercises([
      ...exercises,
      { name: newExercise.trim(), sets: [{ weight: '', reps: '', notes: '' }] },
    ]);
    setNewExercise('');
  };

  // Add an additional set to an existing exercise
  const addSet = (i) => {
    const updated = [...exercises];
    updated[i].sets.push({ weight: '', reps: '', notes: '' });
    setExercises(updated);
  };

  // Update a single field of a single set for an exercise
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  // Remove an exercise from the current workout
  const deleteExercise = (i) => {
    const updated = exercises.filter((_, idx) => idx !== i);
    setExercises(updated);
  };

  // Save new workout or update an existing one in Supabase
  const saveWorkout = async () => {
    if (!workoutName.trim() || exercises.length === 0) {
      setMessage('⚠️ Please enter a workout name and add at least one exercise.');
      return;
    }
    if (!userId) {
      setMessage('⚠️ Please log in first.');
      return;
    }

    const workoutData = {
      user_id: userId,
      workout_date: workoutDate,
      workout_name: workoutName.trim(),
      exercises,
    };

    let error;

    // If editingWorkoutId exists, update the existing row
    if (editingWorkoutId) {
      ({ error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', editingWorkoutId));
      if (!error) {
        setMessage('✅ Workout updated successfully!');
        setEditingWorkoutId(null);
      }
    } else {
      // Otherwise insert a new workout
      ({ error } = await supabase.from('workouts').insert([workoutData]));
      if (!error) setMessage('✅ Workout saved successfully!');
    }

    if (error) {
      console.error('Save error:', error);
      setMessage(`❌ Error saving workout: ${error.message}`);
    } else {
      // Reset form and refresh history
      setWorkoutName('');
      setExercises([]);
      fetchWorkouts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load a workout from history into the editor
  const editWorkout = (workout) => {
    setWorkoutDate(workout.workout_date);
    setWorkoutName(workout.workout_name);
    setExercises(workout.exercises || []);
    setEditingWorkoutId(workout.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage('✏️ Editing workout...');
  };

  // Expand/collapse a workout in the history list
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="workout-logger">
      <h1 className="workout-title">Workout Logger</h1>
      <p className="workout-subtext">
        Track sets, reps, and weight for your training sessions.
      </p>

      {/* Top form: date + workout name */}
      <div className="workout-header">
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
          />
        </div>
        <div>
          <label>Workout Name:</label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g. Push Day, Lower Body, Full Body"
          />
        </div>
      </div>

      {/* Add exercise input */}
      <div className="exercise-adder">
        <input
          type="text"
          value={newExercise}
          onChange={(e) => setNewExercise(e.target.value)}
          placeholder="Add an exercise..."
        />
        <button onClick={addExercise}>Add</button>
      </div>

      {/* Exercise blocks with dynamic sets table */}
      {exercises.map((ex, i) => (
        <div key={i} className="exercise-block">
          <div className="exercise-header">
            <h3>{ex.name}</h3>
            <button className="trash-btn" onClick={() => deleteExercise(i)}>Trash</button>
          </div>

          <table className="sets-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Weight (lbs)</th>
                <th>Reps</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ex.sets.map((set, j) => (
                <tr key={j}>
                  <td>{j + 1}</td>
                  <td>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => handleSetChange(i, j, 'weight', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => handleSetChange(i, j, 'reps', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={set.notes}
                      onChange={(e) => handleSetChange(i, j, 'notes', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="add-set-btn" onClick={() => addSet(i)}>+ Add Set</button>
        </div>
      ))}

      {/* Save / update message */}
      {message && <p className="workout-message">{message}</p>}

      <button className="save-btn" onClick={saveWorkout}>
        {editingWorkoutId ? 'Update Workout' : 'Save Workout'}
      </button>

      {/* History section */}
      <h2 className="history-title">Workout History</h2>
      {workoutHistory.length === 0 && (
        <p style={{ color: '#999', textAlign: 'center' }}>No workouts logged yet.</p>
      )}

      {workoutHistory.map((workout) => (
        <div key={workout.id} className="history-card">
          <div className="history-header" onClick={() => toggleExpand(workout.id)}>
            <span>
              📅 {workout.workout_date} — <strong>{workout.workout_name}</strong>
            </span>
            <div>
              {/* Edit button inside the history card */}
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  editWorkout(workout);
                }}
              >
                Edit
              </button>
              <span>{expanded[workout.id] ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* Expandable workout details */}
          {expanded[workout.id] && (
            <div className="history-body">
              {workout.exercises?.map((ex, idx) => (
                <div key={idx} className="history-exercise">
                  <h4>{ex.name}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Set</th>
                        <th>Weight</th>
                        <th>Reps</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set, j) => (
                        <tr key={j}>
                          <td>{j + 1}</td>
                          <td>{set.weight}</td>
                          <td>{set.reps}</td>
                          <td>{set.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
