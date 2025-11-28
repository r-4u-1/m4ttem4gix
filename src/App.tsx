import React, { useEffect, useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';

// --- Färgpalett ---
const COLORS = {
    primary: 'rgb(67, 97, 238)',
    accentPink: 'rgb(247, 37, 133)',
    accentPurple: 'rgb(114, 9, 183)',
    success: 'rgb(16, 185, 129)',
    error: 'rgb(239, 68, 68)'
};



// --- Styles ---
const MANUAL_TAILWIND_REPLACEMENT_CSS = `
*,*::before,*::after { box-sizing: border-box; }
.app-root { min-height: 100vh; background: #fff; color: #111; }
.layout-container { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
.page-grid { display: grid; gap: 2rem; }
.header-section { text-align: center; margin-bottom: 1rem; }
.header-title { font-size: 2.25rem; font-weight: 800; color: #1f2937; margin: 0; }
.neon-bar { height: 6px; width: 100%; background: linear-gradient(90deg, rgba(67,97,238,1) 0%, rgba(247,37,133,1) 100%); margin-bottom: 1rem; border-radius: 999px; }
.content-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.section-full { grid-column: 1 / -1; }
.section-title { font-size: 1.5rem; font-weight: 800; color: #1f2937; margin: 0 0 1rem 0; }
.section-inner-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 768px) { .section-inner-grid { grid-template-columns: 1fr 1fr; } }
.rule-card, .formula-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; }
.formula-box { display: block; padding: 0.75rem 1rem; background: #fff; border: 1px dashed #d1d5db; border-radius: 0.5rem; margin-bottom: 0.75rem; overflow-x: auto; }
.examples-list { display: grid; gap: 0.5rem; }
.example-item { padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
.math-base-def { color: rgb(67,97,238); }
.math-exponent-def { color: rgb(247,37,133); }
`;

const QUIZ_STYLES = `
.quiz-section { padding: 1rem; }
.quiz-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
@media (min-width: 640px) { .quiz-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.quiz-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.quiz-card--correct { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.15) inset; }
.quiz-card--incorrect { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.15) inset; }
.quiz-heading { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin: 0 0 0.75rem 0; }
.quiz-number { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 0.5rem; color: #fff; border-radius: 999px; font-weight: 700; }
.quiz-input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 1rem; }
.quiz-input--correct { border-color: #10b981; }
.quiz-input--incorrect { border-color: #ef4444; }
.quiz-submit { margin-top: 0.5rem; background: rgb(67,97,238); color: #fff; border: none; padding: 0.5rem 0.875rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
.quiz-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.quiz-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem; }
.quiz-option--correct { outline: 2px solid rgba(16,185,129,0.2); }
.quiz-feedback { margin-top: 0.75rem; font-size: 0.95rem; }
.quiz-feedback--correct { color: #065f46; }
.quiz-feedback--incorrect { color: #991b1b; }
`;

const CUSTOM_STYLES = MANUAL_TAILWIND_REPLACEMENT_CSS + QUIZ_STYLES;

// --- Quiz Types ---
interface MultipleChoiceOption { value: string; label: string; }
interface Question {
    id: number;
    questionMath: string;
    correctAnswer: string;
    correctDisplay: string;
    hint: string;
}
interface FreeTextQuestion extends Question { type: 'free-text'; }
interface MultipleChoiceQuestion extends Question { type: 'multiple-choice'; options: MultipleChoiceOption[]; }
type QuizQuestion = FreeTextQuestion | MultipleChoiceQuestion;

// --- Math Renderers ---
const MathDisplay: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
    const hasTag = /<\w+/.test(content);
    const normalized = hasTag ? content : `<mn>${content}</mn>`;
    return (
        <span className={className} dangerouslySetInnerHTML={{ __html: `<math display="inline">${normalized}</math>` }} />
    );
};

function wrapSimple(s: string) {
    const trimmed = s.trim();
    if (!trimmed) return '';
    if (/<[a-z]+/i.test(trimmed)) return trimmed;
    if (/^[0-9]+$/.test(trimmed)) return `<mn>${trimmed}</mn>`;
    return `<mi>${trimmed}</mi>`;
}

function wrapBareMathTokens(html: string) {
    const parts = html.split(/(<[^>]+>)/g);
    const wrapped = parts.map(part => {
        if (part.startsWith('<')) return part;
        let p = part;
        p = p.replace(/(?<![\w>])(\d+(?:\.\d+)?)(?![\w<])/g, (_m, num) => `<mn>${num}</mn>`);
        p = p.replace(/(?<![<\w])([A-Za-z]+)(?![\w>])/g, (_m, id) => `<mi>${id}</mi>`);
        return p;
    }).join('');
    return wrapped;
}

function renderTeXInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /\$(.+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        parts.push(<TeXDisplay key={match.index} tex={`$${match[1]}$`} />);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

interface TeXDisplayProps { tex: string; className?: string; }
const TeXDisplay: React.FC<TeXDisplayProps> = ({ tex, className = '' }) => {
    const core = tex.trim().replace(/^\$/, '').replace(/\$$/, '');
    let transformed = core
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, num, den) => `<mfrac>${wrapSimple(num)}${wrapSimple(den)}</mfrac>`)
        .replace(/([a-zA-Z0-9])\^\{([A-Za-z0-9]+)\/([A-Za-z0-9]+)\}/g, (_m, base, num, den) => `<msup>${wrapSimple(base)}<mfrac>${wrapSimple(num)}${wrapSimple(den)}</mfrac></msup>`)
        .replace(/([a-zA-Z0-9])\^\{([^}]+)\}/g, (_m, base, exp) => `<msup>${wrapSimple(base)}${wrapSimple(exp)}</msup>`)
        .replace(/\\sqrt\{([^}]+)\}/g, (_m, inner) => `<msqrt>${wrapSimple(inner)}</msqrt>`)
        .replace(/\\sqrt\[([a-zA-Z0-9]+)\]\{([^}]+)\}/g, (_m, index, radicand) => `<mroot>${wrapSimple(radicand)}${wrapSimple(index)}</mroot>`)
        .replace(/([a-zA-Z0-9])\^([a-zA-Z0-9]+)/g, (_m, base, exp) => `<msup>${wrapSimple(base)}${wrapSimple(exp)}</msup>`)
        .replace(/\\cdot/g, '<mo>·</mo>')
        .replace(/\\ne|\\neq/g, '<mo>≠</mo>')
        .replace(/\s\/\s/g, ' <mo>/</mo> ')
        .replace(/=/g, '<mo>=</mo>');
    if (!/(mfrac|msqrt|mo|mn|mi)/.test(transformed)) transformed = wrapSimple(transformed);
    transformed = wrapBareMathTokens(transformed);
    return <span className={className} dangerouslySetInnerHTML={{ __html: `<math display="inline">${transformed}</math>` }} />;
};

// --- Quiz logic ---
const useQuiz = (questions: QuizQuestion[]) => {
    const initialState = questions.map(() => ({ userAnswer: '', isCorrect: null as boolean | null, checked: false }));
    const [answers, setAnswers] = useState(initialState);
    const standardize = (s: string) => s.trim().toLowerCase().replace(/\s/g, '').replace('sqrt', '√');
    const handleChange = useCallback((index: number, value: string) => {
        setAnswers(prev => { const copy = [...prev]; copy[index] = { userAnswer: value, isCorrect: null, checked: false }; return copy; });
    }, []);
    const handleSubmit = useCallback((index: number) => {
        const q = questions[index];
        const isCorrect = standardize(answers[index].userAnswer) === standardize(q.correctAnswer);
        setAnswers(prev => { const copy = [...prev]; copy[index] = { ...copy[index], isCorrect, checked: true }; return copy; });
    }, [answers, questions]);
    return { answers, handleChange, handleSubmit };
};

interface AnswerState { userAnswer: string; isCorrect: boolean | null; checked: boolean; }
interface QuizItemProps { question: QuizQuestion; index: number; state: AnswerState; onChange: (v: string) => void; onSubmit: () => void; }
const QuizItem: React.FC<QuizItemProps> = ({ question, index, state, onChange, onSubmit }) => {
    const { userAnswer, isCorrect, checked } = state;
    const inputClass = question.type === 'free-text'
        ? `quiz-input${checked ? (isCorrect ? ' quiz-input--correct' : ' quiz-input--incorrect') : ''}`
        : '';
    const placeholder = question.id <= 4
        ? 'Skriv ditt förenklade svar här (t.ex. x^7 eller 9)'
        : "Skriv ditt svar här (t.ex. 5 eller 3sqrt2, använd 'sqrt' för roten)";
    return (
        <div className={`quiz-card ${checked ? (isCorrect ? 'quiz-card--correct' : 'quiz-card--incorrect') : ''}`}>
            <h4 className="quiz-heading">
                <span className="quiz-number" style={{ backgroundColor: COLORS.primary }}>{index + 1}</span>
                <span className="mr-2">Förenkla/Beräkna:</span>
                <MathDisplay content={question.questionMath} className="text-xl" />
            </h4>
            {question.type === 'free-text' ? (
                <input type="text" className={inputClass} placeholder={placeholder} value={userAnswer} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} disabled={checked} />
            ) : (
                <div className="space-y-2">
                    {question.options.map((opt, i) => (
                        <label key={i} className={`quiz-option ${checked && opt.value === question.correctAnswer ? 'quiz-option--correct' : ''}`}>
                            <input type="radio" name={`q${question.id}`} value={opt.value} checked={userAnswer === opt.value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} disabled={checked} className="mr-3 w-5 h-5" />
                            <span className="text-lg"><MathDisplay content={opt.label} /></span>
                        </label>
                    ))}
                </div>
            )}
            <button onClick={onSubmit} disabled={checked || userAnswer.trim().length === 0} className="quiz-submit">Kontrollera Svar</button>
            {checked && (
                <div className={`quiz-feedback ${isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--incorrect'}`}>
                    <p className="font-bold">{isCorrect ? 'Korrekt! Bra jobbat.' : 'Inte helt rätt. Här är rätt lösning:'}</p>
                    {!isCorrect && (
                        <p className="mt-2 text-sm">Korrekt svar: <MathDisplay content={question.correctDisplay} className="inline font-mono" /><br />
                            <span className="italic text-gray-600">{renderTeXInline(question.hint)}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Law Section ---
interface LawSectionProps { title: string; lawMath: string; rule: React.ReactNode; memo: string; examples: string[]; }
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
                <div className="formula-box"><MathDisplay content={lawMath} className="block" /></div>
                <div className="examples-list">
                    {examples.map((ex, i) => (<div key={i} className="example-item"><MathDisplay content={ex} /></div>))}
                </div>
            </div>
        </div>
    </section>
);

// --- Quiz Block ---
interface QuizBlockProps { questions: QuizQuestion[]; title?: string; }
const QuizBlock: React.FC<QuizBlockProps> = ({ questions, title }) => {
    const { answers, handleChange, handleSubmit } = useQuiz(questions);
    return (
        <section className="quiz-section section-full">
            {title && <h2 className="section-title">{title}</h2>}
            <p className="text-xl mb-8 text-gray-700">Använd lagarna i avsnittet för att förenkla/beräkna uttrycken.</p>
            <div className="quiz-grid">
                {questions.map((q, i) => (
                    <QuizItem key={q.id} question={q} index={i} state={answers[i]} onChange={(v) => handleChange(i, v)} onSubmit={() => handleSubmit(i)} />
                ))}
            </div>
        </section>
    );
};

// --- App ---
const App: React.FC = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = CUSTOM_STYLES;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    return (
        <div className="app-root">
            <div className="neon-bar" />
            <div className="layout-container">
                <header className="header-section">
                    <h1 className="header-title">Potenser, Potenslagar & Rötter</h1>
                    <p className="text-xl text-gray-500">Interaktiv guide och övningar för att bemästra potenslagarna och kvadratrötter.</p>
                </header>

                <div className="page-grid">
                    {/* 1. Vad är en potens? */}
                    <section className="content-section section-full">
                        <h2 className="section-title">1. Vad är en potens?</h2>
                        <p className="text-xl mb-6 text-gray-700">En potens är ett kompakt sätt att skriva <strong>upprepad multiplikation</strong>. Den består av en bas och en exponent.</p>
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-inner">
                            <div className="text-7xl font-mono mb-4">
                                <MathDisplay content="<msup><mi class='math-base-def'>a</mi><mi class='math-exponent-def'>x</mi></msup>" />
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-lg">
                                <p className="font-bold text-blue-600">BAS (a): <span className="font-normal text-gray-600">Talet som multipliceras</span></p>
                                <p className="font-bold text-pink-500">EXPONENT (x): <span className="font-normal text-gray-600">Antalet gånger</span></p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Multiplikation av Potenser */}
                    <LawSection
                        title="2. Multiplikation av Potenser"
                        lawMath='<msup><mi>a</mi><mi>x</mi></msup><mo>·</mo><msup><mi>a</mi><mi>y</mi></msup><mo>=</mo><msup><mi>a</mi><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></msup>'
                        rule={<>När du multiplicerar två potenser med samma bas, ska du addera exponenterna.</>}
                        memo='Minnesregel: Gånger blir plus i toppen'
                        examples={[
                            '<msup><mn>2</mn><mn>3</mn></msup><mo>·</mo><msup><mn>2</mn><mn>4</mn></msup><mo>=</mo><msup><mn>2</mn><mrow><mn>3</mn><mo>+</mo><mn>4</mn></mrow></msup><mo>=</mo><msup><mn>2</mn><mn>7</mn></msup>',
                            '<msup><mi>x</mi><mn>2</mn></msup><mo>·</mo><msup><mi>x</mi><mn>5</mn></msup><mo>=</mo><msup><mi>x</mi><mn>7</mn></msup>'
                        ]}
                    />
                    <QuizBlock
                        title="Övningar: Multiplikation"
                        questions={[
                            { id: 201, type: 'free-text', questionMath: '<msup><mn>3</mn><mn>4</mn></msup><mo>·</mo><msup><mn>3</mn><mn>5</mn></msup>', correctAnswer: '3^9', correctDisplay: '<msup><mn>3</mn><mn>9</mn></msup>', hint: 'Adderar exponenter: 4 + 5.' },
                            { id: 202, type: 'free-text', questionMath: '<msup><mi>x</mi><mn>2</mn></msup><mo>·</mo><msup><mi>x</mi><mn>3</mn></msup>', correctAnswer: 'x^5', correctDisplay: '<msup><mi>x</mi><mn>5</mn></msup>', hint: 'Samma bas x ⇒ 2 + 3 = 5.' }
                        ]}
                    />

                    {/* 3. Division av Potenser */}
                    <LawSection
                        title="3. Division av Potenser"
                        lawMath='<mfrac><msup><mi>a</mi><mi>x</mi></msup><msup><mi>a</mi><mi>y</mi></msup></mfrac><mo>=</mo><msup><mi>a</mi><mrow><mi>x</mi><mo>-</mo><mi>y</mi></mrow></msup>'
                        rule={<>När du dividerar två potenser med samma bas, ska du subtrahera exponenterna (täljarens minus nämnarens).</>}
                        memo='Minnesregel: Delat med blir minus i toppen'
                        examples={[
                            '<mfrac><msup><mn>5</mn><mn>6</mn></msup><msup><mn>5</mn><mn>2</mn></msup></mfrac><mo>=</mo><msup><mn>5</mn><mrow><mn>6</mn><mo>-</mo><mn>2</mn></mrow></msup><mo>=</mo><msup><mn>5</mn><mn>4</mn></msup>',
                            '<mfrac><msup><mi>x</mi><mn>10</mn></msup><msup><mi>x</mi><mn>3</mn></msup></mfrac><mo>=</mo><msup><mi>x</mi><mn>7</mn></msup>'
                        ]}
                    />
                    <QuizBlock
                        title="Övningar: Division"
                        questions={[
                            { id: 301, type: 'free-text', questionMath: '<mfrac><msup><mi>x</mi><mn>8</mn></msup><msup><mi>x</mi><mn>2</mn></msup></mfrac>', correctAnswer: 'x^6', correctDisplay: '<msup><mi>x</mi><mn>6</mn></msup>', hint: 'Subtrahera exponenterna: 8 − 2 = 6.' },
                            { id: 302, type: 'free-text', questionMath: '<mfrac><msup><mn>5</mn><mn>6</mn></msup><msup><mn>5</mn><mn>2</mn></msup></mfrac>', correctAnswer: '5^4', correctDisplay: '<msup><mn>5</mn><mn>4</mn></msup>', hint: 'Samma bas 5 ⇒ 6 − 2 = 4.' }
                        ]}
                    />

                    {/* 4. Potens av en Potens */}
                    <LawSection
                        title="4. Potens av en Potens"
                        lawMath='<msup><mrow><mo>(</mo><msup><mi>a</mi><mi>x</mi></msup><mo>)</mo></mrow><mi>y</mi></msup><mo>=</mo><msup><mi>a</mi><mrow><mi>x</mi><mo>·</mo><mi>y</mi></mrow></msup>'
                        rule={<>När en potens upphöjs till en annan exponent, ska du multiplicera exponenterna.</>}
                        memo='Minnesregel: Parentes betyder gånger'
                        examples={[
                            '<msup><mrow><mo>(</mo><msup><mn>2</mn><mn>3</mn></msup><mo>)</mo></mrow><mn>2</mn></msup><mo>=</mo><msup><mn>2</mn><mrow><mn>3</mn><mo>·</mo><mn>2</mn></mrow></msup><mo>=</mo><msup><mn>2</mn><mn>6</mn></msup>',
                            '<msup><mrow><mo>(</mo><msup><mi>x</mi><mn>4</mn></msup><mo>)</mo></mrow><mn>5</mn></msup><mo>=</mo><msup><mi>x</mi><mn>20</mn></msup>'
                        ]}
                    />
                    <QuizBlock
                        title="Övningar: Potens av potens"
                        questions={[
                            { id: 401, type: 'free-text', questionMath: '<msup><mrow><mo>(</mo><msup><mn>5</mn><mn>2</mn></msup><mo>)</mo></mrow><mn>3</mn></msup>', correctAnswer: '5^6', correctDisplay: '<msup><mn>5</mn><mn>6</mn></msup>', hint: 'Multiplicera exponenterna: 2 · 3.' },
                            { id: 402, type: 'free-text', questionMath: '<msup><mrow><mo>(</mo><msup><mi>x</mi><mn>4</mn></msup><mo>)</mo></mrow><mn>5</mn></msup>', correctAnswer: 'x^20', correctDisplay: '<msup><mi>x</mi><mn>20</mn></msup>', hint: '(x^4)^5 ⇒ 4 · 5 = 20.' }
                        ]}
                    />

                    {/* 5. Kvadratrötter */}
                    <LawSection
                        title="5. Kvadratrötter och Rotens Definition"
                        lawMath='<msqrt><mi>a</mi></msqrt><mo>=</mo><mi>b</mi><mspace width="0.5em"></mspace><mi>om</mi><mspace width="0.5em"></mspace><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><mi>a</mi>'
                        rule={<>{renderTeXInline('Kvadratroten ur ett tal $a$ är det icke-negativa tal $b$ som multiplicerat med sig självt ger $a$. Endast icke-negativa rötter betraktas (huvudroten).')}</>}
                        memo='Minnesregel: Vad gånger sig själv blir talet under roten?'
                        examples={[
                            '<msqrt><mn>36</mn></msqrt><mo>=</mo><mn>6</mn><mspace width="0.5em"></mspace><mi>eftersom</mi><mspace width="0.5em"></mspace><msup><mn>6</mn><mn>2</mn></msup><mo>=</mo><mn>36</mn>',
                            '<msqrt><mn>81</mn></msqrt><mo>=</mo><mn>9</mn><mspace width="0.5em"></mspace><mi>eftersom</mi><mspace width="0.5em"></mspace><msup><mn>9</mn><mn>2</mn></msup><mo>=</mo><mn>81</mn>'
                        ]}
                    />
                    <QuizBlock
                        title="Övningar: Kvadratrötter"
                        questions={[
                            { id: 501, type: 'free-text', questionMath: '<msqrt><mn>49</mn></msqrt><mo>+</mo><msqrt><mn>16</mn></msqrt>', correctAnswer: '11', correctDisplay: '11', hint: '√49 = 7 och √16 = 4 ⇒ 7 + 4.' },
                            { id: 502, type: 'free-text', questionMath: '<msqrt><mn>36</mn></msqrt>', correctAnswer: '6', correctDisplay: '6', hint: 'Vilket tal gånger sig själv blir 36?' }
                        ]}
                    />

                    {/* 6. Multiplikationslag för Rötter */}
                    <LawSection
                        title="6. Multiplikationslag för Rötter"
                        lawMath='<msqrt><mi>a</mi></msqrt><mo>·</mo><msqrt><mi>b</mi></msqrt><mo>=</mo><msqrt><mrow><mi>a</mi><mi>b</mi></mrow></msqrt>'
                        rule={<>{renderTeXInline('Du kan multiplicera rötter genom att multiplicera de inre talen under ett gemensamt rottecken: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$. Division fungerar på samma sätt: $\\sqrt{a} / \\sqrt{b} = \\sqrt{a/b}$ med $b \\ne 0$.')}</>}
                        memo='Minnesregel: Sätt ihop under samma tak!'
                        examples={[
                            '<msqrt><mn>3</mn></msqrt><mo>·</mo><msqrt><mn>12</mn></msqrt><mo>=</mo><msqrt><mn>36</mn></msqrt><mo>=</mo><mn>6</mn>',
                            '<mfrac><msqrt><mn>50</mn></msqrt><msqrt><mn>2</mn></msqrt></mfrac><mo>=</mo><msqrt><mfrac><mn>50</mn><mn>2</mn></mfrac></msqrt><mo>=</mo><msqrt><mn>25</mn></msqrt><mo>=</mo><mn>5</mn>'
                        ]}
                    />
                    <QuizBlock
                        title="Övningar: Rötter · gånger/delat"
                        questions={[
                            { id: 601, type: 'free-text', questionMath: '<msqrt><mn>3</mn></msqrt><mo>·</mo><msqrt><mn>12</mn></msqrt>', correctAnswer: '6', correctDisplay: '6', hint: '√3 · √12 = √36 = 6.' },
                            { id: 602, type: 'free-text', questionMath: '<mfrac><msqrt><mn>50</mn></msqrt><msqrt><mn>2</mn></msqrt></mfrac>', correctAnswer: '5', correctDisplay: '5', hint: '√50/√2 = √(50/2) = √25 = 5.' }
                        ]}
                    />

                    {/* 7. Rot som Potens */}
                    <LawSection
                        title="7. Rot som Potens (Länken till Potenslagarna)"
                        lawMath='<mroot><mi>a</mi><mi>n</mi></mroot><mo>=</mo><msup><mi>a</mi><mfrac><mn>1</mn><mi>n</mi></mfrac></msup>'
                        rule={<>{renderTeXInline('En $n$-te rot (t.ex. kvadratrot där $n=2$, eller tredjerot där $n=3$) kan skrivas om som en potens med en bråkexponent. Detta är nyckeln till att förstå varför Potenslagarna gäller för rötter.')}</>}
                        memo='Minnesregel: Roten blir bråk i toppen'
                        examples={[
                            '<msqrt><mn>16</mn></msqrt><mo>=</mo><msup><mn>16</mn><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>=</mo><mn>4</mn>',
                            '<mroot><mn>8</mn><mn>3</mn></mroot><mo>=</mo><msup><mn>8</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>=</mo><mn>2</mn>'
                        ]}
                    />
                    <QuizBlock
                        title="Övningar: Rot som potens"
                        questions={[
                            { id: 701, type: 'free-text', questionMath: '<mroot><mn>27</mn><mn>3</mn></mroot>', correctAnswer: '3', correctDisplay: '3', hint: '³√27 är talet b med b^3 = 27.' },
                            { id: 702, type: 'free-text', questionMath: '<msup><mrow><mo>(</mo><msup><mi>x</mi><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>)</mo></mrow><mn>4</mn></msup>', correctAnswer: 'x^2', correctDisplay: '<msup><mi>x</mi><mn>2</mn></msup>', hint: '(x^{1/2})^4 = x^{(1/2)·4} = x^2.' }
                        ]}
                    />


                    <LawSection
                        title="8. Rot som Potens (Länken till Potenslagarna)"
                        lawMath='<mroot><mi>a</mi><mi>n</mi></mroot><mo>=</mo><msup><mi>a</mi><mfrac><mn>1</mn><mi>n</mi></mfrac></msup><mspace width="1em"></mspace><mo>⇔</mo><mspace width="1em"></mspace><msup><mi>a</mi><mfrac><mi>p</mi><mi>q</mi></mfrac></msup><mo>=</mo><mroot><msup><mi>a</mi><mi>p</mi></msup><mi>q</mi></mroot>'
                        rule={<>{renderTeXInline('En $n$-te rot (t.ex. kvadratrot där $n=2$) kan skrivas om som en potens med en bråkexponent. Detta är nyckeln till att förstå varför Potenslagarna gäller för rötter.')}</>}
                        memo='Minnesregel: Roten blir bråk i toppen'
                        examples={[
                            '<msqrt><mn>16</mn></msqrt><mo>=</mo><msup><mn>16</mn><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>=</mo><mn>4</mn>',
                            '<mroot><mn>8</mn><mn>3</mn></mroot><mo>=</mo><msup><mn>8</mn><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>=</mo><mn>2</mn>',
                            '<msup><mi>a</mi><mfrac><mn>5</mn><mn>3</mn></mfrac></msup><mo>=</mo><mroot><msup><mi>a</mi><mn>5</mn></msup><mn>3</mn></mroot>',
                        ]}
                    />

                    <LawSection
                        title="8. Upphöjt till Upphöjt (Potens av Potens)"
                        lawMath='
    <msup>
      <mrow>
        <mo>(</mo>
        <msup>
          <mi>a</mi>
          <mfrac><mn>1</mn><mn>3</mn></mfrac>
        </msup>
        <mo>)</mo>
      </mrow>
      <mn>6</mn>
    </msup>

    <mo>=</mo>

    <!-- nytt steg: a^(1/3 * 6) -->
    <msup>
      <mi>a</mi>
      <mrow>
        <mfrac><mn>1</mn><mn>3</mn></mfrac>
        <mo>&#x22C5;</mo>
        <mn>6</mn>
      </mrow>
    </msup>

    <mo>=</mo>

    <msup>
      <mi>a</mi>
      <mfrac><mn>6</mn><mn>3</mn></mfrac>
    </msup>

    <mo>=</mo>

    <msup><mi>a</mi><mn>2</mn></msup>
  '
                        rule={
                            <>
                                {renderTeXInline(
                                    'När en potens upphöjs med en ny exponent multiplicerar man exponenterna: $(a^m)^n = a^{mn}$.'
                                )}
                            </>
                        }
                        memo="Multiplicera exponenterna"
                        examples={[
                            // Huvudexemplet
                            '<msup><mrow><mo>(</mo><msup><mi>a</mi><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>)</mo></mrow><mn>6</mn></msup><mo>=</mo><msup><mi>a</mi><mrow><mfrac><mn>1</mn><mn>3</mn></mfrac><mo>&#x22C5;</mo><mn>6</mn></mrow></msup><mo>=</mo><msup><mi>a</mi><mfrac><mn>6</mn><mn>3</mn></mfrac></msup><mo>=</mo><msup><mi>a</mi><mn>2</mn></msup>',

                            // Extra exempel
                            '<msup><mrow><mo>(</mo><msup><mi>x</mi><mfrac><mn>2</mn><mn>5</mn></mfrac></msup><mo>)</mo></mrow><mn>5</mn></msup><mo>=</mo><msup><mi>x</mi><mrow><mfrac><mn>2</mn><mn>5</mn></mfrac><mo>&#x22C5;</mo><mn>5</mn></mrow></msup><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup>',

                            '<msup><mrow><mo>(</mo><msup><mi>y</mi><mfrac><mn>3</mn><mn>4</mn></mfrac></msup><mo>)</mo></mrow><mn>8</mn></msup><mo>=</mo><msup><mi>y</mi><mrow><mfrac><mn>3</mn><mn>4</mn></mfrac><mo>&#x22C5;</mo><mn>8</mn></mrow></msup><mo>=</mo><msup><mi>y</mi><mn>6</mn></msup>',
                        ]}
                    />

                    <QuizBlock
                        title="Övningar: Rot som Potens"
                        questions={[
                            {
                                id: 801,
                                type: 'free-text',
                                questionMath: '<msup><mi>a</mi><mfrac><mn>1</mn><mn>2</mn></mfrac></msup><mo>·</mo><msup><mi>a</mi><mfrac><mn>3</mn><mn>2</mn></mfrac></msup>',
                                correctAnswer: 'a^2',
                                correctDisplay: '<msup><mi>a</mi><mn>2</mn></msup>',
                                hint: 'Använd $a^{1/2} \\cdot a^{3/2} = a^{(1/2+3/2)} = a^2$.'
                            },
                            {
                                id: 802,
                                type: 'free-text',
                                questionMath: '<msup><mrow><mo>(</mo><msup><mi>a</mi><mfrac><mn>1</mn><mn>3</mn></mfrac></msup><mo>)</mo></mrow><mn>6</mn></msup>',
                                correctAnswer: 'a^2',
                                correctDisplay: '<msup><mi>a</mi><mn>2</mn></msup>',
                                hint: '$(a^{1/3})^6 = a^{(1/3)\\cdot 6} = a^2$.'
                            },
                            {
                                id: 803,
                                type: 'free-text',
                                questionMath: '<mroot><msup><mi>a</mi><mn>8</mn></msup><mn>4</mn></mroot>',
                                correctAnswer: 'a^2',
                                correctDisplay: '<msup><mi>a</mi><mn>2</mn></msup>',
                                hint: '$\\sqrt[4]{a^8} = a^{8/4} = a^2$.'
                            },
                            {
                                id: 804,
                                type: 'free-text',
                                questionMath: '<msup><mn>16</mn><mfrac><mn>3</mn><mn>4</mn></mfrac></msup>',
                                correctAnswer: '8',
                                correctDisplay: '8',
                                hint: '$16^{3/4} = (\\sqrt[4]{16})^3 = 2^3 = 8$.'
                            }
                        ]}
                    />



                </div>

                <footer className="site-footer">
                    <p>Design med neonfärger för bättre minne. Lycka till med Potenslagarna och Rötterna!</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
