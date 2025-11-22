import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';

// --- Utdragna hjälpkoponenter (flyttade utanför App för att undvika React 19-varning) ---
interface LawSectionProps {
    title: string;
    lawMath: string;
    rule: React.ReactNode; // allowing TeXDisplay component
    memo: string;
    examples: string[];
}

const LawSection: React.FC<LawSectionProps> = ({ title, lawMath, rule, memo, examples }) => (
    <section className="content-section section-full">
        <h2 className="section-title">{title}</h2>
        <div className="section-inner-grid">
            <div className="rule-card">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Regel</h3>
                <div className="text-lg text-gray-600">{rule}</div>
                <p className="text-xl font-semibold italic mt-2 text-pink-500">{memo}</p>
            </div>
            <div className="formula-card">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Formel & Exempel</h3>
                <div className="formula-box">
                    <MathDisplay content={lawMath} className="block" />
                </div>
                <div className="examples-list">
                    {examples.map((ex, i) => (
                        <div key={i} className="example-item">
                            <MathDisplay content={ex} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

interface QuizBlockProps {
    questions: QuizQuestion[];
    title: string;
    allQuestions: QuizQuestion[];
    answers: { userAnswer: string; isCorrect: boolean | null; checked: boolean }[];
    onChange: (index: number, value: string) => void;
    onSubmit: (index: number) => void;
}

const QuizBlock: React.FC<QuizBlockProps> = ({ questions, title, allQuestions, answers, onChange, onSubmit }) => (
    <section className="quiz-section section-full">
        <h2 className="section-title">{title}</h2>
        <p className="text-xl mb-8 text-gray-700">
            Använd lagarna i avsnitten ovan för att förenkla/beräkna uttrycken.
        </p>
        <div className="quiz-grid">
            {questions.map((q) => {
                const globalIndex = allQuestions.findIndex(item => item.id === q.id);
                if (globalIndex === -1) return null;
                return (
                    <QuizItem
                        key={q.id}
                        question={q}
                        index={globalIndex}
                        state={answers[globalIndex]}
                        onChange={(value) => onChange(globalIndex, value)}
                        onSubmit={() => onSubmit(globalIndex)}
                    />
                );
            })}
        </div>
    </section>
);

// --- Färgpalett: Konstanter för enkel modularitet ---
const COLORS = {
 primary: 'rgb(67, 97, 238)', // Tailwind: blue-600
 accentPink: 'rgb(247, 37, 133)', // Tailwind: pink-500
 accentPurple: 'rgb(114, 9, 183)', // Tailwind: purple-700
 success: 'rgb(16, 185, 129)', // Tailwind: green-500
 error: 'rgb(239, 68, 68)', // Tailwind: red-500
};

// --- Custom Styles: Kombinerar MathML-färger med den manuellt definierade CSS:en ---
const MANUAL_TAILWIND_REPLACEMENT_CSS = `
/* Removed Tailwind CSS. Handcrafted utility subset added below for classes used in components. */
/* Global box-sizing to prevent width overflow calculations */
*,*::before,*::after { box-sizing: border-box; }

/* Utility replacements */
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-green-50 { background-color: #ecfdf5; }
.bg-green-100 { background-color: #d1fae5; }
.bg-red-50 { background-color: #fef2f2; }
.bg-red-100 { background-color: #fee2e2; }
.bg-purple-700 { background-color: #6d28d9; }
.hover\\:bg-purple-800\\:hover:hover { background-color: #5b21b6; }
.bg-gradient-to-r { background-image: linear-gradient(to right,var(--tw-gradient-from),var(--tw-gradient-to)); }
.from-pink-500 { --tw-gradient-from: #ec4899; }
.via-purple-700 { --tw-gradient-to: #6d28d9; }
.to-blue-600 { --tw-gradient-to: #2563eb; }
.to-purple-700 { --tw-gradient-to: #6d28d9; }
.bg-clip-text { -webkit-background-clip: text; background-clip: text; }
.text-transparent { color: transparent; }
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.text-6xl { font-size: 3.75rem; }
.text-7xl { font-size: 4.5rem; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-mono { font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; }
.italic { font-style: italic; }
.leading-tight { line-height: 1.1; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,.1),0 10px 10px -5px rgba(0,0,0,.04); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05); }
.shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0,0,0,.06); }
.border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
.border-2 { border-width: 2px; border-style: solid; }
.border-l-4 { border-left-width: 4px; border-left-style: solid; }
.border-gray-200 { border-color: #e5e7eb; }
.border-green-400 { border-color: #34d399; }
.border-green-500 { border-color: #22c55e; }
.border-green-600 { border-color: #16a34a; }
.border-blue-600 { border-color: #2563eb; }
.border-red-400 { border-color: #f87171; }
.border-red-500 { border-color: #ef4444; }
.border-red-600 { border-color: #dc2626; }
.border-purple-700 { border-color: #6d28d9; }
.p-2 { padding: .5rem; }
.p-3 { padding: .75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.pt-10 { padding-top: 2.5rem; }
.pt-20 { padding-top: 5rem; }
.pb-16 { padding-bottom: 4rem; }
.pb-20 { padding-bottom: 5rem; }
.mb-2 { margin-bottom: .5rem; }
.mb-3 { margin-bottom: .75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.mt-2 { margin-top: .5rem; }
.mt-4 { margin-top: 1rem; }
.mr-2 { margin-right: .5rem; }
.mr-3 { margin-right: .75rem; }
.w-full { width: 100%; }
.w-8 { width: 2rem; }
.h-2 { height: .5rem; }
.h-8 { height: 2rem; }
.grid { display: grid; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-8 { gap: 2rem; }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: .25rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: .5rem; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.gap-x-8 { column-gap: 2rem; }
.gap-y-4 { row-gap: 1rem; }
.max-w-7xl { max-width: 80rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
.rounded-r-lg { border-top-right-radius: .5rem; border-bottom-right-radius: .5rem; }
.rounded-sm { border-radius: .125rem; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-blue-600 { color: #2563eb; }
.text-pink-500 { color: #ec4899; }
.text-green-700 { color: #15803d; }
.text-green-800 { color: #166534; }
.text-red-800 { color: #991b1b; }
.bg-gradient-to-r { background: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to)); }
.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
.transition { transition-property: all; }
.duration-150 { transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.transition-all { transition-property: all; }
.hover\\:bg-gray-50\\:hover:hover { background-color: #f9fafb; }
.hover\\:bg-purple-800\\:hover:hover { background-color: #5b21b6; }
.disabled\\:bg-gray-400:disabled { background-color: #9ca3af; }
.cursor-pointer { cursor: pointer; }
.inline { display: inline; }
.block { display: block; }
.grid-cols-2 { grid-template-columns: repeat(2,minmax(0,1fr)); }
.md\\:grid-cols-2 { grid-template-columns: repeat(2,minmax(0,1fr)); }
.focus\\:ring-purple-200:focus { outline: 2px solid #e9d5ff; }
.focus\\:ring-purple-500:focus { outline: 2px solid #a855f7; }
.focus\\:border-purple-700:focus { border-color: #6d28d9; }
.ring-green-500 { box-shadow: 0 0 0 3px rgba(34,197,94,0.5); }
.ring-red-500 { box-shadow: 0 0 0 3px rgba(239,68,68,0.5); }
.focus\\:ring-purple-200:focus { box-shadow: 0 0 0 3px rgba(233,213,255,0.5); }
.focus\\:ring-purple-500:focus { box-shadow: 0 0 0 3px rgba(168,85,247,0.5); }
.app-root { min-height: 100vh; background-color: #f9fafb; }
.neon-bar { position: fixed; top:0; left:0; width:100%; height:.5rem; background: linear-gradient(to right,#ec4899,#6d28d9,#2563eb); z-index:10; }
.layout-container { max-width:80rem; margin:0 auto; padding:2.5rem 1rem 5rem; }
@media (min-width:640px){ .layout-container { padding-left:1.5rem; padding-right:1.5rem; } }
@media (min-width:1024px){ .layout-container { padding-left:2rem; padding-right:2rem; } }
.header-section { text-align:center; padding-top:5rem; padding-bottom:4rem; }
.header-title { font-size:3.75rem; font-weight:800; line-height:1.1; margin-bottom:.5rem; background:linear-gradient(to right,#ec4899,#6d28d9); -webkit-background-clip:text; background-clip:text; color:transparent; }
@media (min-width:640px){ .header-title { font-size:6rem; } }
.content-section { background:#fff; padding:2rem; border-radius:1rem; box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 10px 10px -5px rgba(0,0,0,.04); margin-bottom:3rem; }
.cards-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:1024px){ .cards-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.page-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:1024px){ .page-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.section-full { grid-column:1; }
@media (min-width:1024px){ .section-full { grid-column:1 / span 2; } }
.section-inner-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:768px){ .section-inner-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.section-title { font-size:2.25rem; font-weight:800; margin-bottom:2rem; color:#2563eb; border-left:4px solid #2563eb; padding-left:1rem; }
.rule-card, .formula-card { padding:1.5rem; border:1px solid #e5e7eb; border-radius:0.75rem; box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05); }
.rule-card { background:#f3f4f6; display:flex; flex-direction:column; justify-content:center; }
.formula-card { background:#ffffff; }
.formula-box { font-size:1.875rem; padding:1rem; margin:1rem 0; text-align:center; background:#eff6ff; border-radius:.5rem; box-shadow:inset 0 2px 4px rgba(0,0,0,.06); }
.examples-list { display:flex; flex-direction:column; gap:.25rem; }
.example-item { padding:.5rem; border-left:4px solid #22c55e; background:#ecfdf5; color:#15803d; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-size:1.125rem; border-radius:.125rem; }
.quiz-section { background:#fff; padding:2rem; border-radius:1rem; box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 10px 10px -5px rgba(0,0,0,.04); margin-bottom:3rem; }
.quiz-grid { display:grid; gap:2rem; grid-template-columns:minmax(0,1fr); }
@media (min-width:768px){ .quiz-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.quiz-card { padding:1.25rem; border-radius:0.75rem; box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05); transition:all .15s ease; border:1px solid #e5e7eb; background:#ffffff; min-width:0; }
.quiz-card--correct { background:#ecfdf5; border-color:#34d399; }
.quiz-card--incorrect { background:#fef2f2; border-color:#f87171; }
.quiz-number { width:2rem; height:2rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; margin-right:.75rem; font-size:.875rem; font-weight:600; background:#4361ee; color:#fff; flex-shrink:0; }
.quiz-heading { display:flex; align-items:center; font-size:1.25rem; font-weight:600; margin-bottom:1rem; color:#1f2937; }
.quiz-input { width:100%; max-width:100%; display:block; padding:.75rem; border-radius:.5rem; border:2px solid #d1d5db; font-size:1.125rem; transition: all .15s ease; }
.quiz-input:focus { border-color:#6d28d9; outline:2px solid rgba(233,213,255,0.5); }
.quiz-input--correct { border-color:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.5); }
.quiz-input--incorrect { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.5); }
.quiz-option { display:flex; align-items:center; padding:.75rem; border:1px solid #e5e7eb; border-radius:.5rem; cursor:pointer; transition:background .15s ease; }
.quiz-option:hover { background:#f9fafb; }
.quiz-option--correct { background:#d1fae5; border-color:#22c55e; }
.quiz-submit { margin-top:1rem; width:100%; padding:.75rem; border-radius:.5rem; font-weight:700; background:#6d28d9; color:#fff; transition:background .2s ease; box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06); }
.quiz-submit:hover:not(:disabled) { background:#5b21b6; }
.quiz-submit:disabled { background:#9ca3af; cursor:not-allowed; }
.quiz-feedback { margin-top:1rem; padding:1rem; border-left:4px solid #22c55e; border-radius:.5rem; }
.quiz-feedback--correct { background:#d1fae5; color:#166534; border-color:#16a34a; }
.quiz-feedback--incorrect { background:#fee2e2; color:#991b1b; border-color:#dc2626; }
.site-footer { text-align:center; padding:2rem 0; border-top:1px solid #e5e7eb; color:#6b7280; font-size:.875rem; }

:root {
 font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
 line-height: 1.5;
 font-weight: 400;

 color-scheme: light dark;
 color: black;
 background-color: #242424;

 font-synthesis: none;
 text-rendering: optimizeLegibility;
 -webkit-font-smoothing: antialiased;
 -moz-osx-font-smoothing: grayscale;
}

a {
 font-weight: 500;
 color: #646cff;
 text-decoration: inherit;
}
a:hover {
 color: #535bf2;
}

body {
 margin: 0;
 display: flex;
 place-items: center;
 min-width: 320px;
 min-height: 100vh;
}

h1 {
 font-size: 3.2em;
 line-height: 1.1;
}

button {
 border-radius: 8px;
 border: 1px solid transparent;
 padding: 0.6em 1.2em;
 font-size: 1em;
 font-weight: 500;
 font-family: inherit;
 background-color: #1a1a1a;
 cursor: pointer;
 transition: border-color 0.25s;
}
button:hover {
 border-color: #646cff;
}
button:focus,
button:focus-visible {
 outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
 :root {
  color: #213547;
  background-color: #ffffff;
 }
 a:hover {
  color: #747bff;
 }
 button {
  background-color: #f9f9f9;
 }
}
`;

const CUSTOM_STYLES = `
 /* Basstil för body */
 body { 
  font-family: 'Inter', sans-serif; 
 }

 /* MathML Färgning - Centraliserad stil för bas/exponent för att matcha temat */
 /* Alla a^x-uttryck färgas för pedagogikens skull */
 mjx-container > mjx-msup > mjx-base { 
  color: ${COLORS.primary} !important; 
  transition: color 0.3s;
 }
 mjx-container > mjx-msup > mjx-script { 
  color: ${COLORS.accentPink} !important; 
  transition: color 0.3s;
 }
 
 /* Speciell hantering för division: Nämnarens exponent får en annan färg */
 mjx-container > mjx-mfrac > mjx-num > mjx-msup > mjx-base,
 mjx-container > mjx-mfrac > mjx-den > mjx-msup > mjx-base { 
  color: ${COLORS.primary} !important; 
 }
 mjx-container > mjx-mfrac > mjx-num > mjx-msup > mjx-script { 
  color: ${COLORS.accentPink} !important; 
 }
 mjx-container > mjx-mfrac > mjx-den > mjx-msup > mjx-script { 
  color: ${COLORS.accentPurple} !important; 
 }

 /* Anpassad styling för definitionsexemplet */
 .math-base-def {
  color: ${COLORS.primary} !important;
 }
 .math-exponent-def {
  color: ${COLORS.accentPink} !important;
 }

${MANUAL_TAILWIND_REPLACEMENT_CSS}
`;

// --- Interfaces for Quiz Data ---

/** Definierar strukturen för ett flervalsalternativ. */
interface MultipleChoiceOption {
 value: string;
 label: string; // MathML string för visning
}

/** Definierar kärnstrukturen för alla quizfrågor. */
interface Question {
 id: number;
 questionMath: string; // MathML string för frågan
 correctAnswer: string; // Standardiserad sträng för kontroll (t.ex. 'x^7' eller '9' eller '3sqrt2')
 correctDisplay: string; // MathML string för att visa det korrekta svaret
 hint: string;
}

/** Definierar strukturen för en fritextfråga. */
interface FreeTextQuestion extends Question {
 type: 'free-text';
}

/** Definierar strukturen för en flervalsfråga. */
interface MultipleChoiceQuestion extends Question {
 type: 'multiple-choice';
 options: MultipleChoiceOption[];
}

type QuizQuestion = FreeTextQuestion | MultipleChoiceQuestion;

// --- Data (Uppdaterad med 4 potensfrågor + 4 rotfrågor) ---
const quizQuestions: QuizQuestion[] = [
 {
  id: 1,
  type: 'free-text',
  questionMath: '<msup><mn>3</mn><mn>4</mn></msup><mo>&sdot;</mo><msup><mn>3</mn><mn>5</mn></msup>',
  correctAnswer: '3^9',
  correctDisplay: '<msup><mn>3</mn><mn>9</mn></msup>',
  hint: 'Använd multiplikationsregeln: addera exponenterna (4 + 5).',
 },
 {
  id: 2,
  type: 'free-text',
  questionMath: '<mfrac><msup><mi>x</mi><mn>8</mn></msup><msup><mi>x</mi><mn>2</mn></msup></mfrac>',
  correctAnswer: 'x^6',
  correctDisplay: '<msup><mi>x</mi><mn>6</mn></msup></p>',
  hint: 'Använd divisionsregeln: subtrahera exponenterna (8 - 2).',
 },
 {
  id: 3,
  type: 'free-text',
  questionMath: '<msup><mn>7</mn><mn>0</mn></msup><mo>+</mo><msup><mn>2</mn><mn>3</mn></msup>',
  correctAnswer: '9',
  correctDisplay: '9',
  hint: 'Kom ihåg att $a^0 = 1$ och beräkna $2^3$.',
 },
 {
  id: 4,
  type: 'multiple-choice',
  questionMath: '<msup><mrow><mo>(</mo><msup><mn>5</mn><mn>2</mn></msup><mo>)</mo></mrow><mn>3</mn></msup>',
  options: [
   { value: '5^5', label: '<msup><mn>5</mn><mn>5</mn></msup>' },
   { value: '5^6', label: '<msup><mn>5</mn><mn>6</mn></msup>' }, // Korrekt
   { value: '5^8', label: '<msup><mn>5</mn><mn>8</mn></msup>' },
  ],
  correctAnswer: '5^6',
  correctDisplay: '<msup><mn>5</mn><mn>6</mn></msup>',
  hint: 'Använd regeln Potens av Potens: multiplicera exponenterna (2 * 3).',
 },
 // --- NYA RÖTTER FRÅGOR ---
 {
  id: 5,
  type: 'free-text',
  questionMath: '<msqrt><mn>49</mn></msqrt><mo>+</mo><msqrt><mn>16</mn></msqrt>',
  correctAnswer: '11',
  correctDisplay: '11',
  hint: 'Beräkna rötterna separat och addera (7 + 4).',
 },
 {
  id: 6,
  type: 'free-text',
  questionMath: '<msqrt><mn>2</mn></msqrt><mo>&sdot;</mo><msqrt><mn>32</mn></msqrt>',
  correctAnswer: '8',
  correctDisplay: '8',
  hint: 'Använd multiplikationslagen: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$. Räkna sedan ut roten ur produkten.',
 },
 {
  id: 7,
  type: 'free-text',
    questionMath: '<mfrac><msqrt><mn>72</mn></msqrt><msqrt><mn>2</mn></msqrt></mfrac>',
  correctAnswer: '6',
  correctDisplay: '6',
  hint: 'Använd divisionslagen: $\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$. Räkna sedan ut roten ur kvoten.',
 },
 {
  id: 8,
  type: 'multiple-choice',
  questionMath: '<mroot><mn>27</mn><mn>3</mn></mroot>',
  options: [
   { value: '3', label: '3' }, // Korrekt
   { value: '9', label: '9' },
   { value: '1', label: '1' },
  ],
  correctAnswer: '3',
  correctDisplay: '3',
  hint: 'Tredje roten ur 27 är det tal $b$ så att $b^3=27$.',
 },
 // --- Avancerade / Bråkpotenser & Referenser ---
 {
  id: 9,
  type: 'free-text',
  questionMath: '<msup><mi>x</mi><mfrac><mn>5</mn><mn>3</mn></mfrac></msup><mo>·</mo><msup><mi>x</mi><mfrac><mn>1</mn><mn>3</mn></mfrac></msup>',
  correctAnswer: 'x^2',
  correctDisplay: '<msup><mi>x</mi><mn>2</mn></msup>',
  hint: 'Adderar bråkexponenter: 5/3 + 1/3 = 6/3 = 2.'
 },
 {
  id: 10,
  type: 'free-text',
  questionMath: '<mroot><msup><mi>a</mi><mn>5</mn></msup><mn>3</mn></mroot>',
  correctAnswer: 'a^{5/3}',
  correctDisplay: '<msup><mi>a</mi><mfrac><mn>5</mn><mn>3</mn></mfrac></msup>',
  hint: 'Rot som potens: \n-th root blir 1/n i exponenten: (a^5)^(1/3) = a^{5/3}.'
 },
 {
  id: 11,
  type: 'multiple-choice',
  questionMath: '<msup><mn>81</mn><mfrac><mn>1</mn><mn>4</mn></mfrac></msup>',
  options: [
   { value: '3', label: '3' }, // korrekt
   { value: '4', label: '4' },
   { value: '9', label: '9' },
  ],
  correctAnswer: '3',
  correctDisplay: '3',
  hint: 'Fjärde roten ur 81: 3^4 = 81.'
 },
 {
  id: 12,
  type: 'free-text',
  questionMath: '<msup><mrow><mo>(</mo><msup><mi>x</mi><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>)</mo></mrow><mn>4</mn></msup>',
  correctAnswer: 'x^2',
  correctDisplay: '<msup><mi>x</mi><mn>2</mn></msup>',
  hint: 'Potens av potens: (x^{1/2})^4 = x^{(1/2)*4} = x^2.'
 },
 {
  id: 13,
  type: 'free-text',
  questionMath: '<mfrac><msup><mi>x</mi><mfrac><mn>7</mn><mn>4</mn></mfrac></msup><msup><mi>x</mi><mfrac><mn>3</mn><mn>4</mn></mfrac></msup></mfrac>',
  correctAnswer: 'x',
  correctDisplay: '<mi>x</mi>',
  hint: 'Subtrahera exponenter: 7/4 - 3/4 = 4/4 = 1.'
 },
 {
  id: 14,
  type: 'multiple-choice',
  questionMath: '<mroot><msup><mi>x</mi><mn>2</mn></msup><mn>3</mn></mroot>',
  options: [
   { value: 'x^{2/3}', label: '<msup><mi>x</mi><mfrac><mn>2</mn><mn>3</mn></mfrac></msup>' }, // korrekt
   { value: 'x^{3/2}', label: '<msup><mi>x</mi><mfrac><mn>3</mn><mn>2</mn></mfrac></msup>' },
   { value: 'x^{1/3}', label: '<msup><mi>x</mi><mfrac><mn>1</mn><mn>3</mn></mfrac></msup>' },
  ],
  correctAnswer: 'x^{2/3}',
  correctDisplay: '<msup><mi>x</mi><mfrac><mn>2</mn><mn>3</mn></mfrac></msup>',
  hint: 'Rot som potens: (x^2)^{1/3} = x^{2/3}.'
 },
 {
  id: 15,
  type: 'free-text',
  questionMath: '<mroot><mn>125</mn><mn>3</mn></mroot>',
  correctAnswer: '5',
  correctDisplay: '5',
  hint: 'Tredjeroten av 125 är 5 (5·5·5=125).'
 },
 {
  id: 16,
  type: 'free-text',
  questionMath: '<msqrt><mi>x</mi></msqrt><mo>·</mo><msqrt><mi>x</mi></msqrt>',
  correctAnswer: 'x',
  correctDisplay: '<mi>x</mi>',
  hint: 'Multiplikation av rötter: √x · √x = √(x·x) = √(x^2) = x.'
 },
];

// --- Components ---

/** Renderar MathML-innehåll. Fallback: om strängen saknar taggar, wrappa i <mn> */
const MathDisplay: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
    const hasTag = /<\w+/.test(content);
    const normalized = hasTag ? content : `<mn>${content}</mn>`;
    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: `<math display="inline">${normalized}</math>` }}
        />
    );
};

// --- TeXDisplay: minimal TeX -> MathML (supports \frac, \sqrt) ---
interface TeXDisplayProps { tex: string; className?: string; }
const TeXDisplay: React.FC<TeXDisplayProps> = ({ tex, className = '' }) => {
    const core = tex.trim().replace(/^\$/,'').replace(/\$$/,'');
    // Order matters: handle fractions first so nested forms like \sqrt{\frac{a}{b}} are parsed correctly
    let transformed = core
        // Fractions
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, num, den) => `<mfrac>${wrapSimple(num)}${wrapSimple(den)}</mfrac>`)
    // Braced fractional exponents a^{p/q} (numbers or letters)
    .replace(/([a-zA-Z0-9])\^\{([A-Za-z0-9]+)\/([A-Za-z0-9]+)\}/g, (_m, base, num, den) => `<msup>${wrapSimple(base)}<mfrac>${wrapSimple(num)}${wrapSimple(den)}</mfrac></msup>`)
    // Braced simple exponents a^{k} (multi-char allowed)
    .replace(/([a-zA-Z0-9])\^\{([^}]+)\}/g, (_m, base, exp) => `<msup>${wrapSimple(base)}${wrapSimple(exp)}</msup>`)
        // Square roots (after fractions so inner may already contain MathML)
        .replace(/\\sqrt\{([^}]+)\}/g, (_m, inner) => `<msqrt>${wrapSimple(inner)}</msqrt>`)
        // Indexed roots \sqrt[n]{a}
        .replace(/\\sqrt\[([a-zA-Z0-9]+)\]\{([^}]+)\}/g, (_m, index, radicand) => `<mroot>${wrapSimple(radicand)}${wrapSimple(index)}</mroot>`)
        // Superscripts like a^b
        .replace(/([a-zA-Z0-9])\^([a-zA-Z0-9]+)/g, (_m, base, exp) => `<msup>${wrapSimple(base)}${wrapSimple(exp)}</msup>`)
        // Common operators
    .replace(/\\cdot/g, '<mo>·</mo>')
        .replace(/\\ne|\\neq/g, '<mo>≠</mo>')
    // slash operator when used with spaces (avoid touching URLs or units)
    .replace(/\s\/\s/g, ' <mo>/</mo> ')
        .replace(/=/g, '<mo>=</mo>');
    // Simple remaining wrap if no tags
    if (!/<(mfrac|msqrt|mo|mn|mi)/.test(transformed)) {
        transformed = wrapSimple(transformed);
    }
    // Ensure any bare identifiers or numbers around inserted operators are wrapped
    transformed = wrapBareMathTokens(transformed);
    return <span className={className} dangerouslySetInnerHTML={{ __html: `<math display="inline">${transformed}</math>` }} />;
};

function wrapSimple(s: string) {
    const trimmed = s.trim();
    if (!trimmed) return '';
    // If already contains tags, return as-is
    if (/<[a-z]+/i.test(trimmed)) return trimmed;
    // Distinguish number vs identifier
    if (/^[0-9]+$/.test(trimmed)) return `<mn>${trimmed}</mn>`;
    return `<mi>${trimmed}</mi>`;
}

// After operator replacement, wrap stray tokens outside tags into proper MathML nodes
function wrapBareMathTokens(html: string) {
    // Split into tags and text; only process text chunks
    const parts = html.split(/(<[^>]+>)/g);
    const wrapped = parts.map(part => {
        if (part.startsWith('<')) return part; // keep tags intact
        // Replace letter sequences with <mi> and number sequences with <mn>
        // Do numbers first to avoid wrapping digits inside identifiers like x2 in one go
        let p = part;
        // Wrap numbers (integers or decimals)
        p = p.replace(/(?<![\w>])(\d+(?:\.\d+)?)(?![\w<])/g, (_m, num) => `<mn>${num}</mn>`);
        // Wrap identifiers (letters, including simple latin); allow Greek names already escaped by TeX to be handled prior
        p = p.replace(/(?<![<\w])([A-Za-z]+)(?![\w>])/g, (_m, id) => `<mi>${id}</mi>`);
        return p;
    }).join('');
    return wrapped;
}

// Helper: split a text containing TeX $...$ parts into ReactNodes
function renderTeXInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /\$(.+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(<TeXDisplay key={match.index} tex={`$${match[1]}$`} />);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts;
}

/** Anpassad hook för att hantera quiz-tillstånd */
const useQuiz = (questions: QuizQuestion[]) => {
 const initialState = questions.map(() => ({
  userAnswer: '',
  isCorrect: null as boolean | null,
  checked: false,
 }));

 const [answers, setAnswers] = useState(initialState);

 const standardizeAnswer = (answer: string) => {
  // Normaliserar svaret för enklare jämförelse
  return answer.trim().toLowerCase().replace(/\s/g, '').replace('sqrt', '√'); // Accepterar "sqrt" som roten
 };

 const handleChange = useCallback((index: number, value: string) => {
  setAnswers(prev => {
   const newAnswers = [...prev];
   newAnswers[index] = { ...newAnswers[index], userAnswer: value, isCorrect: null, checked: false };
   return newAnswers;
  });
 }, []);

 const handleSubmit = useCallback((index: number) => {
  const question = questions[index];
  const userAnswer = standardizeAnswer(answers[index].userAnswer);
  const expectedAnswer = standardizeAnswer(question.correctAnswer);
  const isCorrect = userAnswer === expectedAnswer;

  setAnswers(prev => {
   const newAnswers = [...prev];
   newAnswers[index] = { ...newAnswers[index], isCorrect, checked: true };
   return newAnswers;
  });
 }, [answers, questions]);

 return { answers, handleChange, handleSubmit };
};

/** Komponent för ett enskilt quiz-objekt (Fritext eller Flervalsfråga). */
interface AnswerState {
 userAnswer: string;
 isCorrect: boolean | null;
 checked: boolean;
}

interface QuizItemProps {
 question: QuizQuestion;
 index: number;
 state: AnswerState;
 onChange: (value: string) => void;
 onSubmit: () => void;
}

const QuizItem: React.FC<QuizItemProps> = ({ question, index, state, onChange, onSubmit }) => {
 const { userAnswer, isCorrect, checked } = state;

 const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  onChange(e.target.value);
 };
 
 const handleMultipleChoiceChange = (e: ChangeEvent<HTMLInputElement>) => {
  onChange(e.target.value);
 };

 const getCardModifier = () => {
  if (!checked) return '';
  return isCorrect ? 'quiz-card--correct' : 'quiz-card--incorrect';
 };
 
 const getInputClass = () => {
  if (question.type !== 'free-text') return '';
  if (!checked) return 'quiz-input';
  return `quiz-input ${isCorrect ? 'quiz-input--correct' : 'quiz-input--incorrect'}`;
 };
 
 const placeholderText = (question: QuizQuestion) => {
  if (question.id <= 4) {
   return "Skriv ditt förenklade svar här (t.ex. x^7 eller 9)";
  }
  return "Skriv ditt svar här (t.ex. 5 eller 3sqrt2, använd 'sqrt' för roten)";
 };


 return (
  <div className={`quiz-card ${getCardModifier()}`}>
   <h4 className="quiz-heading">
    {/* Använder COLORS.primary */}
    <span className="quiz-number" style={{backgroundColor: COLORS.primary}}>{index + 1}</span>
    <span className="mr-2">Förenkla/Beräkna:</span>
    <MathDisplay content={question.questionMath} className="text-xl" />
   </h4>

   {question.type === 'free-text' ? (
    <input
     type="text"
     className={getInputClass()}
     placeholder={placeholderText(question)}
     value={userAnswer}
     onChange={handleInputChange}
     disabled={checked}
    />
   ) : (
    <div className="space-y-2">
     {question.options.map((option, optIndex) => (
      <label
       key={optIndex}
       className={`quiz-option ${checked && option.value === question.correctAnswer ? 'quiz-option--correct' : ''}`}
      >
       <input
        type="radio"
        name={`q${question.id}`}
        value={option.value}
        checked={userAnswer === option.value}
        onChange={handleMultipleChoiceChange}
        disabled={checked}
        className="mr-3 w-5 h-5"
       />
       <span className="text-lg">
        <MathDisplay content={option.label} />
       </span>
      </label>
     ))}
    </div>
   )}

   <button
    onClick={onSubmit}
    disabled={checked || userAnswer.trim().length === 0}
    className="quiz-submit"
   >
    Kontrollera Svar
   </button>

   {checked && (
    <div className={`quiz-feedback ${isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--incorrect'}`}>
     <p className="font-bold">{isCorrect ? 'Korrekt! Bra jobbat.' : 'Inte helt rätt. Här är rätt lösning:'}</p>
     {!isCorrect && (
      <p className="mt-2 text-sm">
    Korrekt svar: <MathDisplay content={question.correctDisplay} className="inline font-mono" /><br/>
    <span className="italic text-gray-600">{renderTeXInline(question.hint)}</span>
      </p>
     )}
    </div>
   )}
  </div>
 );
};

// --- Main App Component ---
const App: React.FC = () => {
 const { answers, handleChange, handleSubmit } = useQuiz(quizQuestions);
  
  // Dela upp frågorna
  const potensQuestions = quizQuestions.slice(0, 4);
  const rotQuestions = quizQuestions.slice(4);
    const advancedQuestions = quizQuestions.slice(8);

 useEffect(() => {
  // Injicerar de centraliserade stilarna i dokumenthuvudet
  const style = document.createElement('style');
  style.innerHTML = CUSTOM_STYLES;
  document.head.appendChild(style);
  return () => {
   document.head.removeChild(style);
  };
 }, []);

 // (Flyttat) lawSection och QuizBlock har extraherats till top-level komponenter nedanför för att undvika React 19-varningen.

 return (
  <div className="app-root">
   <div className="neon-bar"></div>

 <div className="layout-container">
    
    {/* Header Section */}
    <header className="header-section">
     <h1 className="header-title">
      Potenser, Potenslagar & Rötter
     </h1>
     <p className="text-xl text-gray-500">Interaktiv guide och övningar för att bemästra potenslagarna och kvadratrötter.</p>
          <p className="mt-8">
            
          </p>
    </header>

    <div className="page-grid">
    
    {/* --- 1. Potens Definition --- */}
 <section className="content-section section-full">
     <h2 className="section-title">1. Vad är en potens?</h2>
     <p className="text-xl mb-6 text-gray-700">En potens är ett kompakt sätt att skriva <strong>upprepad multiplikation</strong>. Den består av en bas och en exponent.</p>
     <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-inner">
      <div className="text-7xl font-mono mb-4">
       {/* MathML-klasser för att färga bas (primary) och exponent (accentPink) */}
       <MathDisplay content="<msup><mi class='math-base-def'>a</mi><mi class='math-exponent-def'>x</mi></msup>" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-lg">
       <p className="font-bold text-blue-600">BAS (a): <span className="font-normal text-gray-600">Talet som multipliceras</span></p>
       <p className="font-bold text-pink-500">EXPONENT (x): <span className="font-normal text-gray-600">Antalet gånger</span></p>
      </div>
     </div>
    </section>
    
    {/* --- Potenslagar 2-4 --- */}
    <LawSection
     title="2. Multiplikation av Potenser"
    lawMath='<msup><mi>a</mi><mi>x</mi></msup><mo>&sdot;</mo><msup><mi>a</mi><mi>y</mi></msup><mo>=</mo><msup><mi>a</mi><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></msup>'
     rule='När du multiplicerar två potenser med samma bas, ska du addera exponenterna.'
     memo='Minnesregel: Gånger blir plus i toppen'
     examples={[
      '<msup><mn>2</mn><mn>3</mn></msup><mo>&sdot;</mo><msup><mn>2</mn><mn>4</mn></msup><mo>=</mo><msup><mn>2</mn><mrow><mn>3</mn><mo>+</mo><mn>4</mn></mrow></msup><mo>=</mo><msup><mn>2</mn><mn>7</mn></msup>',
      '<msup><mi>x</mi><mn>2</mn></msup><mo>&sdot;</mo><msup><mi>x</mi><mn>5</mn></msup><mo>=</mo><msup><mi>x</mi><mn>7</mn></msup>',
     ]}
    />
    <LawSection
     title="3. Division av Potenser"
     lawMath='<mfrac><msup><mi>a</mi><mi>x</mi></msup><msup><mi>a</mi><mi>y</mi></msup></mfrac><mo>=</mo><msup><mi>a</mi><mrow><mi>x</mi><mo>-</mo><mi>y</mi></mrow></msup>'
     rule='När du dividerar två potenser med samma bas, ska du subtrahera exponenterna (täljarens minus nämnarens).'
     memo='Minnesregel: Delat med blir minus i toppen'
     examples={[
      '<mfrac><msup><mn>5</mn><mn>6</mn></msup><msup><mn>5</mn><mn>2</mn></msup></mfrac><mo>=</mo><msup><mn>5</mn><mrow><mn>6</mn><mo>-</mo><mn>2</mn></mrow></msup><mo>=</mo><msup><mn>5</mn><mn>4</mn></msup>',
    '<mfrac><msup><mi>x</mi><mn>10</mn></msup><msup><mi>x</mi><mn>3</mn></msup></mfrac><mo>=</mo><msup><mi>x</mi><mn>7</mn></msup>',
     ]}
    />
    <LawSection
     title="4. Potens av en Potens"
     lawMath='<msup><mrow><mo>(</mo><msup><mi>a</mi><mi>x</mi></msup><mo>)</mo></mrow><mi>y</mi></msup><mo>=</mo><msup><mi>a</mi><mrow><mi>x</mi><mo>&sdot;</mo><mi>y</mi></mrow></msup>'
     rule='När en potens upphöjs till en annan exponent, ska du multiplicera exponenterna.'
     memo='Minnesregel: Parentes betyder gånger'
     examples={[
      '<msup><mrow><mo>(</mo><msup><mn>2</mn><mn>3</mn></msup><mo>)</mo></mrow><mn>2</mn></msup><mo>=</mo><msup><mn>2</mn><mrow><mn>3</mn><mo>&sdot;</mo><mn>2</mn></mrow></msup><mo>=</mo><msup><mn>2</mn><mn>6</mn></msup>',
      '<msup><mrow><mo>(</mo><msup><mi>x</mi><mn>4</mn></msup><mo>)</mo></mrow><mn>5</mn></msup><mo>=</mo><msup><mi>x</mi><mn>20</mn></msup>',
     ]}
    />
    {/* (Borttagna gamla inline lawSection-anrop) */}
        
        {/* --- NYTT AVSNITT: Quiz Potenser (Efter Potenslagarna) --- */}
        <QuizBlock
            questions={potensQuestions}
            title="Quiz: Potenslagar (Frågor 1–4)"
            allQuestions={quizQuestions}
            answers={answers}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    
    {/* --- NYTT AVSNITT: Kvadratrötter 5-7 --- */}
    
    {/* 5. Kvadratroten (Definition) */}
    <LawSection
     title="5. Kvadratrötter och Rotens Definition"
     lawMath='<msqrt><mi>a</mi></msqrt><mo>=</mo><mi>b</mi><mspace width="0.5em"></mspace><mi>om</mi><mspace width="0.5em"></mspace><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><mi>a</mi>'
    rule={<>{renderTeXInline('Kvadratroten ur ett tal $a$ är det icke-negativa tal $b$ som multiplicerat med sig självt ger $a$. Endast icke-negativa rötter betraktas (huvudroten).')}</>}
     memo='Minnesregel: Vad gånger sig själv blir talet under roten?'
     examples={[
      '<msqrt><mn>36</mn></msqrt><mo>=</mo><mn>6</mn><mspace width="0.5em"></mspace><mi>eftersom</mi><mspace width="0.5em"></mspace><msup><mn>6</mn><mn>2</mn></msup><mo>=</mo><mn>36</mn>',
      '<msqrt><mn>81</mn></msqrt><mo>=</mo><mn>9</mn><mspace width="0.5em"></mspace><mi>eftersom</mi><mspace width="0.5em"></mspace><msup><mn>9</mn><mn>2</mn></msup><mo>=</mo><mn>81</mn>',
     ]}
    />

    {/* 6. Multiplikationslag för Rötter */}
    <LawSection
     title="6. Multiplikationslag för Rötter"
     lawMath='<msqrt><mi>a</mi></msqrt><mo>&sdot;</mo><msqrt><mi>b</mi></msqrt><mo>=</mo><msqrt><mrow><mi>a</mi><mi>b</mi></mrow></msqrt>'
    rule={<>{renderTeXInline('Du kan multiplicera rötter genom att multiplicera de inre talen under ett gemensamt rottecken: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$. Division fungerar på samma sätt: $\\sqrt{a} / \\sqrt{b} = \\sqrt{a/b}$ och i bråkform $\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$, med villkoret $b \\ne 0$.')}</>}
     memo='Minnesregel: Sätt ihop under samma tak!'
     examples={[
      '<msqrt><mn>3</mn></msqrt><mo>&sdot;</mo><msqrt><mn>12</mn></msqrt><mo>=</mo><msqrt><mn>36</mn></msqrt><mo>=</mo><mn>6</mn>',
            '<mfrac><msqrt><mn>50</mn></msqrt><msqrt><mn>2</mn></msqrt></mfrac><mo>=</mo><msqrt><mfrac><mn>50</mn><mn>2</mn></mfrac></msqrt><mo>=</mo><msqrt><mn>25</mn></msqrt><mo>=</mo><mn>5</mn>',
     ]}
    />
    
    {/* 7. Rot som Potens (Länken) */}
    <LawSection
     title="7. Rot som Potens (Länken till Potenslagarna)"
     lawMath='<mroot><mi>a</mi><mi>n</mi></mroot><mo>=</mo><msup><mi>a</mi><mfrac><mn>1</mn><mi>n</mi></mfrac></msup>'
        rule={<>{renderTeXInline('En $n$-te rot (t.ex. kvadratrot där $n=2$, eller tredjerot där $n=3$) kan skrivas om som en potens med en bråkexponent. Detta är nyckeln till att förstå varför Potenslagarna gäller för rötter.')}</>}
     memo='Minnesregel: Roten blir bråk i toppen'
     examples={[
      '<msqrt><mn>16</mn></msqrt><mo>=</mo><msup><mn>16</mn><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>=</mo><mn>4</mn>',
      '<mroot><mn>8</mn><mn>3</mn></mroot><mo>=</mo><msup><mn>8</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>=</mo><mn>2</mn>',
     ]}
    />


    {/* --- NYTT AVSNITT: Quiz Kvadratrötter (Efter Rotlagarna) --- */}
        <QuizBlock
            questions={rotQuestions}
            title="Quiz: Kvadratrötter (Frågor 5–8)"
            allQuestions={quizQuestions}
            answers={answers}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />

  <LawSection
    title="8. Tredjeroten (Kubikrot)"
    lawMath='<mroot><mi>a</mi><mn>3</mn></mroot><mo>=</mo><mi>b</mi><mspace width="thickmathspace"></mspace><mo>⇔</mo><mspace width="thickmathspace"></mspace><msup><mi>b</mi><mn>3</mn></msup><mo>=</mo><mi>a</mi>'
    rule={<>
        För att beräkna tredjeroten (kubikroten) ur ett tal <TeXDisplay tex="$a$" />, söker man det tal <TeXDisplay tex="$b$" /> som, multiplicerat med sig självt tre gånger, ger <TeXDisplay tex="$a$" />.
    </>}
    memo='Minnesregel: Frågan är "Vilket tal gånger sig självt, tre gånger, blir detta?"'
    examples={[
        '<mroot><mn>8</mn><mn>3</mroot><mo>=</mo><mn>2</mn></math> eftersom 2^3 = 8, alltså 2 · 2 · 2 = 8',
        '<mroot><mn>27</mn><mn>3</mroot><mo>=</mo><mn>3</mn></math> eftersom 3^3 = 27, alltså 3 · 3 · 3 = 27',
        '<msup><mn>8</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>=</mo><mn>2</mn></math>',
    ]}
/>  

<LawSection
    title="9. Rot som Potens (Länken till Potenslagarna)"
    // Uppdaterad lawMath för att explicit visa kubikroten
    lawMath='<mroot><mi>a</mi><mi>n</mi></mroot><mo>=</mo><msup><mi>a</mi><mfrac><mn>1</mn><mi>n</mi></mfrac></msup><mspace width="thickmathspace"></mspace><mspace width="2em"></mspace><mspace width="thickmathspace"></mspace><mroot><mn>8</mn><mn>3</mn></mroot><mo>=</mo><msup><mn>8</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup></math>'
    rule={<>
        En <TeXDisplay tex="$n$" />-te rot (t.ex. kvadratrot där <TeXDisplay tex="$n=2$" />, eller tredjerot där <TeXDisplay tex="$n=3$" />) kan skrivas om som en **potens med en bråkexponent**. Detta är nyckeln till att förstå varför Potenslagarna gäller för rötter.
    </>}
    memo='Minnesregel: Roten blir bråk i toppen'
    examples={[
        '<msqrt><mn>16</mn></msqrt><mo>=</mo><msup><mn>16</mn><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>=</mo><mn>4</mn>',
        '<mroot><mn>8</mn><mn>3</mroot><mo>=</mo><msup><mn>8</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>=</mo><mn>2</mn>',
    ]}
/>

{/* NY SEKTION 9 */}
<LawSection
    title="10. De första kub-talen (Referens)"
    lawMath='<msup><mi>b</mi><mn>3</mn></msup><mo>=</mo><mi>a</mi><mspace width="thickmathspace"></mspace><mo>⇔</mo><mspace width="thickmathspace"></mspace><mroot><mi>a</mi><mn>3</mn></mroot><mo>=</mo><mi>b</mi>'
    rule={<>
        För snabba beräkningar i huvudet är det bra att känna till de första heltalen upphöjda till tre (kub-talen).
    </>}
    memo='Minnesregel: Dessa tal hjälper dig att snabbt hitta tredjerötter.'
    examples={[
        '<msup><mn>1</mn><mn>3</mn></msup><mo>=</mo><mn>1</mn><mspace width="0.75em"></mspace><mtext>och</mtext><mspace width="0.75em"></mspace><mroot><mn>1</mn><mn>3</mn></mroot><mo>=</mo><mn>1</mn>',
        '<msup><mn>2</mn><mn>3</mn></msup><mo>=</mo><mn>8</mn><mspace width="0.75em"></mspace><mtext>och</mtext><mspace width="0.75em"></mspace><mroot><mn>8</mn><mn>3</mn></mroot><mo>=</mo><mn>2</mn>',
        '<msup><mn>3</mn><mn>3</mn></msup><mo>=</mo><mn>27</mn><mspace width="0.75em"></mspace><mtext>och</mtext><mspace width="0.75em"></mspace><mroot><mn>27</mn><mn>3</mn></mroot><mo>=</mo><mn>3</mn>',
        '<msup><mn>4</mn><mn>3</mn></msup><mo>=</mo><mn>64</mn><mspace width="thickmathspace"></mspace><mo>⇒</mo><mspace width="thickmathspace"></mspace><mroot><mn>64</mn><mn>3</mn></mroot><mo>=</mo><mn>4</mn>',
    '<msup><mn>5</mn><mn>3</mn></msup><mo>=</mo><mn>125</mn><mspace width="thickmathspace"></mspace><mo>⇒</mo><mspace width="thickmathspace"></mspace><mroot><mn>125</mn><mn>3</mn></mroot><mo>=</mo><mn>5</mn>',
    ]}
/>

{/* NY SEKTION 11 */}
<LawSection
    title="11. Kubtal 1^3 till 5^3"
    lawMath='<msup><mi>n</mi><mn>3</mn></msup>'
    rule={<>{renderTeXInline('Här ser du de första kubtalen. Ett kubtal är resultatet av att ett tal multipliceras med sig självt tre gånger: $n^3 = n \\cdot n \\cdot n$. Dessa är bra att kunna utantill.')}</>}
    memo='Minnesregel: Kub = tre gånger sig själv'
    examples={[
        '<msup><mn>1</mn><mn>3</mn></msup><mo>=</mo><mn>1</mn>',
        '<msup><mn>2</mn><mn>3</mn></msup><mo>=</mo><mn>8</mn>',
        '<msup><mn>3</mn><mn>3</mn></msup><mo>=</mo><mn>27</mn>',
        '<msup><mn>4</mn><mn>3</mn></msup><mo>=</mo><mn>64</mn>',
        '<msup><mn>5</mn><mn>3</mn></msup><mo>=</mo><mn>125</mn>',
    ]}
/>
{/* NY SEKTION 12 */}
<LawSection
    title="12. Kvadrattal 1^2 till 5^2"
    lawMath='<msup><mi>n</mi><mn>2</mn></msup>'
    rule={<>{renderTeXInline('Kvadrattal (square numbers) bildas när ett tal multipliceras med sig självt två gånger: $n^2 = n \\cdot n$. De första hjälper vid huvudräkning och förenkling av rötter.')}</>}
    memo='Minnesregel: Kvadrat = två gånger sig själv'
    examples={[
        '<msup><mn>1</mn><mn>2</mn></msup><mo>=</mo><mn>1</mn>',
        '<msup><mn>2</mn><mn>2</mn></msup><mo>=</mo><mn>4</mn>',
        '<msup><mn>3</mn><mn>2</mn></msup><mo>=</mo><mn>9</mn>',
        '<msup><mn>4</mn><mn>2</mn></msup><mo>=</mo><mn>16</mn>',
        '<msup><mn>5</mn><mn>2</mn></msup><mo>=</mo><mn>25</mn>',
    ]}
/>

{/* NY SEKTION 13 */}
<LawSection
    title="13. Fjärdepotenser 1^4 till 5^4"
    lawMath='<msup><mi>n</mi><mn>4</mn></msup>'
    rule={<>{renderTeXInline('Fjärdepotenser fås genom $n^4 = n \\cdot n \\cdot n \\cdot n$. De förekommer vid sammansatta potensförenklingar och jämförelser av storleksordningar.')}</>}
    memo='Minnesregel: Fyran = fyra gånger sig själv'
    examples={[
        '<msup><mn>1</mn><mn>4</mn></msup><mo>=</mo><mn>1</mn>',
        '<msup><mn>2</mn><mn>4</mn></msup><mo>=</mo><mn>16</mn>',
        '<msup><mn>3</mn><mn>4</mn></msup><mo>=</mo><mn>81</mn>',
        '<msup><mn>4</mn><mn>4</mn></msup><mo>=</mo><mn>256</mn>',
        '<msup><mn>5</mn><mn>4</mn></msup><mo>=</mo><mn>625</mn>',
    ]}
/>
{/* NY SEKTION 14 */}
<LawSection
    title="14. Sambandet till Bråkpotens"
    lawMath='<mroot><mi>a</mi><mi>n</mi></mroot><mo>=</mo><msup><mi>a</mi><mfrac><mn>1</mn><mi>n</mi></mfrac></msup><mspace width="1em"></mspace><mo>⇔</mo><mspace width="1em"></mspace><msup><mi>a</mi><mfrac><mi>p</mi><mi>q</mi></mfrac></msup><mo>=</mo><mroot><msup><mi>a</mi><mi>p</mi></msup><mi>q</mi></mroot>'
    rule={<>{renderTeXInline('En bråkpotens är en potens där exponenten är ett bråktal, t.ex. $a^{1/2}$, $a^{3/4}$ eller $a^{p/q}$. Den kopplar direkt till rötter: $a^{1/n} = \\sqrt[n]{a}$ och den mer allmänna $a^{p/q} = \\sqrt[q]{a^p}$. Detta låter oss tillämpa vanliga potenslagar även på uttryck med rötter genom att skriva om roten som en potens med bråkexponent.')}</>}
    memo='Minnesregel: Rot = bråk i exponenten'
    examples={[
        '<msqrt><mn>25</mn></msqrt><mo>=</mo><msup><mn>25</mn><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>=</mo><mn>5</mn>',
        '<mroot><mn>27</mn><mn>3</mn></mroot><mo>=</mo><msup><mn>27</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>=</mo><mn>3</mn>',
        '<mroot><mn>81</mn><mn>4</mn></mroot><mo>=</mo><msup><mn>81</mn><mfrac><mn>1</mn><mn>4</mn></mfrac></msup><mo>=</mo><mn>3</mn>',
        '<msup><mi>a</mi><mfrac><mn>3</mn><mn>2</mn></mfrac></msup><mo>=</mo><msqrt><msup><mi>a</mi><mn>3</mn></msup></msqrt>',
        '<msup><mi>a</mi><mfrac><mn>5</mn><mn>3</mn></mfrac></msup><mo>=</mo><mroot><msup><mi>a</mi><mn>5</mn></msup><mn>3</mn></mroot>',
    ]}
/>
{/* --- NYTT AVSNITT: Quiz Avancerat --- */}
<QuizBlock
    questions={advancedQuestions}
    title="Quiz: Bråkpotenser & Avancerat (Frågor 9–16)"
    allQuestions={quizQuestions}
    answers={answers}
    onChange={handleChange}
    onSubmit={handleSubmit}
/>
    </div>
   </div>

   {/* Footer */}
   <footer className="site-footer">
    <p>Design med neonfärger för bättre minne. Lycka till med Potenslagarna och Rötterna!</p>
   </footer>
  </div>
 );
};

export default App
