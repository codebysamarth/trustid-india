import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Sparkles,
  ExternalLink,
  Target,
  Zap,
} from 'lucide-react';
import { useDemo, DEMO_STEPS } from '../context/DemoContext';

export const GuidedDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStepIndex,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    resetAllDemoState,
    isResetting,
  } = useDemo();

  const handleLaunchStep = () => {
    navigate(currentStep.route);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-lg shadow-md shadow-cyan-950">
              <PlayCircle className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              Structured Presentation Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Guided 10-Step Demonstration Flow
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Designed for a 5–7 minute classroom evaluation covering every cryptographic and blockchain verification scenario.
          </p>
        </div>

        <button
          onClick={resetAllDemoState}
          disabled={isResetting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <RotateCcw className={`w-4 h-4 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
          Reset Demo to Step A
        </button>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-[#131F42]/60 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {DEMO_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
                  isCurrent
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-white'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-800/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/50'
                      : isCompleted
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : s.letter}
                </div>
                <span className="text-[10px] font-medium truncate max-w-[85px] text-center">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Hero Card */}
      <div className="bg-gradient-to-b from-[#131F42] to-[#0A1024] border border-slate-700 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-lg text-cyan-400">
              {currentStep.letter}
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
                Step {currentStep.stepNumber} of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              title="Previous Step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              title="Next Step"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Details Cards: Objective, Action, Expected, Concept */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-[#0D1630] border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> 1. Demonstration Objective
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {currentStep.objective}
            </p>
          </div>

          <div className="bg-[#0D1630] border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 2. Action to Perform
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {currentStep.actionDescription}
            </p>
          </div>

          <div className="bg-[#0D1630] border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 3. Expected Result
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {currentStep.expectedResult}
            </p>
          </div>

          <div className="bg-[#0D1630] border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> 4. Underlying Principle
            </span>
            <p className="text-slate-300 leading-relaxed">
              {currentStep.underlyingConcept}
            </p>
          </div>
        </div>

        {/* Action Button: Jump to feature */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Clicking below will navigate directly to the interactive module for this step.
          </span>
          <button
            onClick={handleLaunchStep}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950 transition"
          >
            Launch Step {currentStep.letter} Module <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
