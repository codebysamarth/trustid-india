import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <PlayCircle className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
              Evaluation Flow
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Guided 10-Step Classroom Demonstration Flow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Follow this 5–7 minute walkthrough covering each cryptographic and blockchain verification scenario for evaluation.
          </p>
        </div>

        <button
          onClick={resetAllDemoState}
          disabled={isResetting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
        >
          <RotateCcw className={`w-4 h-4 text-emerald-600 ${isResetting ? 'animate-spin' : ''}`} />
          Reset Demo to Step A
        </button>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-4 overflow-x-auto shadow-sm">
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
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-emerald-50/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                      : 'bg-slate-100 border border-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : s.letter}
                </div>
                <span className="text-[11px] font-medium truncate max-w-[85px] text-center">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Hero Card */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono font-extrabold text-base text-emerald-700">
              {currentStep.letter}
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 font-bold">
                Step {currentStep.stepNumber} of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              title="Previous Step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              title="Next Step"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> 1. Demonstration Objective
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">
              {currentStep.objective}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-amber-800 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 2. Action to Perform
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">
              {currentStep.actionDescription}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-teal-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 3. Expected Result
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">
              {currentStep.expectedResult}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-slate-800 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> 4. Underlying Principle
            </span>
            <p className="text-slate-600 leading-relaxed">
              {currentStep.underlyingConcept}
            </p>
          </div>
        </div>

        {/* Action Button: Jump to module */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Click to navigate directly to the interactive portal for this step.
          </span>
          <button
            onClick={handleLaunchStep}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition active:scale-95"
          >
            <span>Launch Step {currentStep.letter} Module</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
