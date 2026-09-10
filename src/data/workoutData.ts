import { WorkoutDays, WorkoutPlace, WorkoutStyle, WorkoutDayPlan } from '../types';

interface ExerciseItem {
  name: string;
  setsReps: string;
}

const ex = (name: string): ExerciseItem => ({ name, setsReps: '3 sets × 10–12 reps' });

function ensureSix(list: ExerciseItem[]): ExerciseItem[] {
  const result = list.slice(0, 6);
  while (result.length < 6) {
    result.push(list[result.length % list.length]);
  }
  return result;
}

const GYM_SETS = {
  push: [
    ex('Incline chest press'),
    ex('Flat chest press'),
    ex('Seated shoulder press'),
    ex('Lateral raise'),
    ex('Triceps pressdown'),
    ex('Cable fly'),
  ],
  pull: [
    ex('Lat pulldown'),
    ex('Seated cable row'),
    ex('Chest-supported row'),
    ex('Rear-delt fly'),
    ex('Biceps curl'),
    ex('Hammer curl'),
  ],
  legs: [
    ex('Squat or leg press'),
    ex('Romanian deadlift'),
    ex('Split squat'),
    ex('Leg curl'),
    ex('Calf raise'),
    ex('Core exercise'),
  ],
  sl: [
    ex('Squat or leg press'),
    ex('Romanian deadlift'),
    ex('Leg curl'),
    ex('Seated shoulder press'),
    ex('Lateral raise'),
    ex('Calf raise'),
  ],
  ct: [
    ex('Incline chest press'),
    ex('Flat chest press'),
    ex('Cable fly'),
    ex('Chest press'),
    ex('Triceps pressdown'),
    ex('Overhead triceps extension'),
  ],
  upper: [
    ex('Chest press'),
    ex('Lat pulldown'),
    ex('Seated row'),
    ex('Shoulder press'),
    ex('Biceps curl'),
    ex('Triceps pressdown'),
  ],
  lower: [
    ex('Squat or leg press'),
    ex('Romanian deadlift'),
    ex('Split squat'),
    ex('Leg curl'),
    ex('Calf raise'),
    ex('Core exercise'),
  ],
};

const HOME_SETS = {
  push: [
    ex('Push-up variation'),
    ex('Incline push-up'),
    ex('Pike push-up'),
    ex('Lateral raise with light resistance'),
    ex('Triceps extension'),
    ex('Band chest fly'),
  ],
  pull: [
    ex('Resistance-band pulldown'),
    ex('Resistance-band row'),
    ex('One-arm backpack row'),
    ex('Band rear-delt fly'),
    ex('Biceps curl with resistance'),
    ex('Hammer curl with resistance'),
  ],
  legs: [
    ex('Bodyweight squat'),
    ex('Hip hinge / Romanian deadlift with light load'),
    ex('Reverse lunge'),
    ex('Glute bridge'),
    ex('Calf raise'),
    ex('Core exercise'),
  ],
  sl: [
    ex('Bodyweight squat'),
    ex('Reverse lunge'),
    ex('Glute bridge'),
    ex('Pike push-up'),
    ex('Lateral raise with light resistance'),
    ex('Calf raise'),
  ],
  ct: [
    ex('Push-up variation'),
    ex('Incline push-up'),
    ex('Band chest fly'),
    ex('Close-grip push-up'),
    ex('Triceps extension'),
    ex('Overhead triceps extension'),
  ],
  upper: [
    ex('Push-up variation'),
    ex('Band pulldown'),
    ex('Band row'),
    ex('Pike push-up'),
    ex('Biceps curl with resistance'),
    ex('Triceps extension'),
  ],
  lower: [
    ex('Bodyweight squat'),
    ex('Hip hinge / Romanian deadlift with light load'),
    ex('Reverse lunge'),
    ex('Glute bridge'),
    ex('Calf raise'),
    ex('Core exercise'),
  ],
};

export function generateWorkoutSplit(
  days: WorkoutDays,
  place: WorkoutPlace,
  style: WorkoutStyle
): { splitTitle: string; days: WorkoutDayPlan[] } {
  const e = place === 'gym' ? GYM_SETS : HOME_SETS;
  const isShoulderLegs = style === 'shoulderLegs';

  if (days === '2') {
    return {
      splitTitle: '2-Day Full Body Split',
      days: [
        { title: 'Day 1 – Full Body A', exercises: ensureSix(e.upper) },
        { title: 'Day 2 – Full Body B', exercises: ensureSix(e.lower) },
      ],
    };
  }

  if (days === '3') {
    return {
      splitTitle: '3-Day Full Body Split',
      days: [
        { title: 'Day 1 – Full Body A', exercises: ensureSix(e.upper) },
        { title: 'Day 2 – Full Body B', exercises: ensureSix(e.lower) },
        { title: 'Day 3 – Full Body C', exercises: ensureSix(e.upper.concat(e.lower)) },
      ],
    };
  }

  if (days === '4') {
    return {
      splitTitle: '4-Day Upper / Lower Split',
      days: [
        { title: 'Day 1 – Upper A', exercises: ensureSix(e.upper) },
        { title: 'Day 2 – Lower A', exercises: ensureSix(e.lower) },
        { title: 'Day 3 – Upper B', exercises: ensureSix([...e.upper].reverse()) },
        { title: 'Day 4 – Lower B', exercises: ensureSix([...e.lower].reverse()) },
      ],
    };
  }

  if (days === '5') {
    if (isShoulderLegs) {
      return {
        splitTitle: '5-Day Chest / Pull / Legs + Shoulders Split',
        days: [
          { title: 'Day 1 – Chest + Triceps', exercises: ensureSix(e.ct) },
          { title: 'Day 2 – Pull', exercises: ensureSix(e.pull) },
          { title: 'Day 3 – Legs + Shoulders', exercises: ensureSix(e.sl) },
          { title: 'Day 4 – Upper', exercises: ensureSix(e.upper) },
          { title: 'Day 5 – Lower + Shoulders', exercises: ensureSix(e.sl) },
        ],
      };
    }
    return {
      splitTitle: '5-Day Push / Pull / Legs Split',
      days: [
        { title: 'Day 1 – Push', exercises: ensureSix(e.push) },
        { title: 'Day 2 – Pull', exercises: ensureSix(e.pull) },
        { title: 'Day 3 – Legs', exercises: ensureSix(e.legs) },
        { title: 'Day 4 – Upper', exercises: ensureSix(e.upper) },
        { title: 'Day 5 – Lower', exercises: ensureSix(e.lower) },
      ],
    };
  }

  // 6 Days
  if (isShoulderLegs) {
    return {
      splitTitle: '6-Day Chest / Pull / Legs + Shoulders × 2',
      days: [
        { title: 'Day 1 – Chest + Triceps A', exercises: ensureSix(e.ct) },
        { title: 'Day 2 – Pull A', exercises: ensureSix(e.pull) },
        { title: 'Day 3 – Legs + Shoulders A', exercises: ensureSix(e.sl) },
        { title: 'Day 4 – Chest + Triceps B', exercises: ensureSix([...e.ct].reverse()) },
        { title: 'Day 5 – Pull B', exercises: ensureSix([...e.pull].reverse()) },
        { title: 'Day 6 – Legs + Shoulders B', exercises: ensureSix([...e.sl].reverse()) },
      ],
    };
  }

  return {
    splitTitle: '6-Day Push / Pull / Legs × 2',
    days: [
      { title: 'Day 1 – Push A', exercises: ensureSix(e.push) },
      { title: 'Day 2 – Pull A', exercises: ensureSix(e.pull) },
      { title: 'Day 3 – Legs A', exercises: ensureSix(e.legs) },
      { title: 'Day 4 – Push B', exercises: ensureSix([...e.push].reverse()) },
      { title: 'Day 5 – Pull B', exercises: ensureSix([...e.pull].reverse()) },
      { title: 'Day 6 – Legs B', exercises: ensureSix([...e.legs].reverse()) },
    ],
  };
}
