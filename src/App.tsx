/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PlanBuilder } from './components/PlanBuilder';
import { PlanResults } from './components/PlanResults';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { CravingFix } from './components/CravingFix';
import { GymTools } from './components/GymTools';
import { BodyFatCalculator } from './components/BodyFatCalculator';
import { SavedPlansModal } from './components/SavedPlansModal';
import { Footer } from './components/Footer';
import { 
  UserProfile, 
  AgeGroup, 
  Sex, 
  ActivityLevel, 
  FoodStyle, 
  MainGoal, 
  EnergyGoal, 
  BudgetTier 
} from './types';
import { triggerWorkoutDoneConfetti } from './utils/confetti';

export default function App() {
  // Biometric & Nutrition questionnaire state
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [exactAge, setExactAge] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [activity, setActivity] = useState<ActivityLevel | ''>('');
  const [foodStyle, setFoodStyle] = useState<FoodStyle | ''>('');
  const [mainGoal, setMainGoal] = useState<MainGoal | ''>('');
  const [energyGoal, setEnergyGoal] = useState<EnergyGoal | ''>('');
  const [budget, setBudget] = useState<BudgetTier | ''>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('nourish_saved_profiles_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading saved profiles', e);
    }
    return [];
  });

  // Restore cached profile on first load
  useEffect(() => {
    try {
      const cached = localStorage.getItem('nourish_profile_v1_merged');
      if (cached) {
        const parsed: UserProfile = JSON.parse(cached);
        setActiveProfile(parsed);
        if (parsed.ageGroup) setAgeGroup(parsed.ageGroup);
        if (parsed.age) setExactAge(parsed.age);
        if (parsed.height) setHeight(parsed.height);
        if (parsed.weight) setWeight(parsed.weight);
        if (parsed.sex) setSex(parsed.sex);
        if (parsed.activity) setActivity(parsed.activity);
        if (parsed.foodStyle) setFoodStyle(parsed.foodStyle);
        if (parsed.mainGoal) setMainGoal(parsed.mainGoal);
        if (parsed.energyGoal) setEnergyGoal(parsed.energyGoal);
        if (parsed.budget) setBudget(parsed.budget);
      }
    } catch (e) {
      console.error('Error loading cached profile', e);
    }
  }, []);

  const handleBuildPlan = () => {
    if (!ageGroup) {
      setValidationError('Please select an Age Group in Section 1.');
      return;
    }
    if (!foodStyle) {
      setValidationError('Please select your Preferred Food Style in Section 4.');
      return;
    }
    if (!mainGoal) {
      setValidationError('Please select your Main Performance Goal in Section 5.');
      return;
    }
    if (!energyGoal) {
      setValidationError('Please select a Caloric Strategy in Section 7.');
      return;
    }
    if (!budget) {
      setValidationError('Please select a Daily Nutrition Budget Tier in Section 8.');
      return;
    }

    setValidationError(null);

    const newProfile: UserProfile = {
      id: activeProfile?.id || `profile_${Date.now()}`,
      name: `${foodStyle} • ${mainGoal}`,
      ageGroup,
      age: exactAge,
      height,
      weight,
      sex,
      activity,
      foodStyle,
      mainGoal,
      energyGoal,
      budget,
      createdAt: new Date().toISOString(),
    };

    setActiveProfile(newProfile);
    setShowResults(true);

    try {
      localStorage.setItem('nourish_profile_v1_merged', JSON.stringify(newProfile));
    } catch (e) {}

    // Auto-save/update in saved profiles list
    setSavedProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === newProfile.id);
      let updated: UserProfile[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = newProfile;
      } else {
        updated = [newProfile, ...prev];
      }
      try {
        localStorage.setItem('nourish_saved_profiles_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    triggerWorkoutDoneConfetti();

    setTimeout(() => {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleResetPlan = () => {
    setShowResults(false);
    setTimeout(() => {
      const el = document.getElementById('form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectSavedProfile = (profile: UserProfile) => {
    setAgeGroup(profile.ageGroup);
    setExactAge(profile.age || '');
    setHeight(profile.height || '');
    setWeight(profile.weight || '');
    setSex(profile.sex || '');
    setActivity(profile.activity || '');
    setFoodStyle(profile.foodStyle);
    setMainGoal(profile.mainGoal);
    setEnergyGoal(profile.energyGoal);
    setBudget(profile.budget);
    setActiveProfile(profile);
    setShowResults(true);
    setValidationError(null);

    try {
      localStorage.setItem('nourish_profile_v1_merged', JSON.stringify(profile));
    } catch (e) {}

    setTimeout(() => {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleDeleteSavedProfile = (id: string) => {
    setSavedProfiles((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('nourish_saved_profiles_v1', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] text-slate-900 dark:text-[#E2E8F0] font-sans antialiased transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:bg-[#CCFF00]/30 dark:selection:text-[#CCFF00]">
        {/* Global Floating Navigation */}
        <Header 
          profile={activeProfile}
          savedProfilesCount={savedProfiles.length}
          onOpenSavedModal={() => setIsSavedModalOpen(true)}
        />

        {/* Main Content Flow */}
        <main className="px-4 sm:px-6 pt-24 pb-12 max-w-7xl mx-auto">
          {/* 1. Hero Presentation & Quick Calculator */}
          <Hero />

          {/* 2. Personalized Nutrition Questionnaire */}
          <PlanBuilder 
            ageGroup={ageGroup}
            setAgeGroup={setAgeGroup}
            exactAge={exactAge}
            setExactAge={setExactAge}
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            sex={sex}
            setSex={setSex}
            activity={activity}
            setActivity={setActivity}
            foodStyle={foodStyle}
            setFoodStyle={setFoodStyle}
            mainGoal={mainGoal}
            setMainGoal={setMainGoal}
            energyGoal={energyGoal}
            setEnergyGoal={setEnergyGoal}
            budget={budget}
            setBudget={setBudget}
            onBuildPlan={handleBuildPlan}
            validationError={validationError}
          />

          {/* 3. Realtime Calibrated Results & Swappable Protocol */}
          {showResults && activeProfile && (
            <PlanResults 
              ageGroup={activeProfile.ageGroup}
              exactAge={activeProfile.age}
              height={activeProfile.height}
              weight={activeProfile.weight}
              sex={activeProfile.sex}
              activity={activeProfile.activity}
              foodStyle={activeProfile.foodStyle}
              mainGoal={activeProfile.mainGoal}
              energyGoal={activeProfile.energyGoal}
              budget={activeProfile.budget}
              onReset={handleResetPlan}
            />
          )}

          {/* 4. Athletic Craving Fixes */}
          <CravingFix currentFoodStyle={activeProfile?.foodStyle} />

          {/* 5. Precision Training Split Generator */}
          <WorkoutBuilder />

          {/* 6. Gym Rest Timer, 1RM Strength Matrix, and Hydration Tracker */}
          <GymTools 
            userWeight={activeProfile?.weight}
            userGoal={activeProfile?.mainGoal}
          />

          {/* 7. U.S. Navy & BMI Body Fat % Calculator */}
          <BodyFatCalculator 
            initialSex={activeProfile?.sex}
            initialHeight={activeProfile?.height}
            initialWeight={activeProfile?.weight}
            initialAge={activeProfile?.age}
          />
        </main>

        {/* Saved Plans & Presets Modal */}
        <SavedPlansModal 
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          savedProfiles={savedProfiles}
          onSelectProfile={handleSelectSavedProfile}
          onDeleteProfile={handleDeleteSavedProfile}
        />

        {/* Footer with branding and quick jump links */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}
