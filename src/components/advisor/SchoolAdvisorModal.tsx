import React, { useState } from 'react';
import { X, Sparkles, Send, HelpCircle, ShieldAlert, BookOpen, Compass, ChevronRight, CheckCircle2, Check } from 'lucide-react';
import { MOCK_ADVISOR_FAQ } from '../../data/schools';
import { useSearch } from '../../context/SearchContext';
import { useShortlist } from '../../context/ShortlistContext';
import { useComparison } from '../../context/ComparisonContext';

interface SchoolAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextSchoolName?: string;
}

interface Message {
  id: string;
  sender: 'advisor' | 'user';
  text: string;
  checklist?: string[];
  caveats?: string[];
}

export const SchoolAdvisorModal: React.FC<SchoolAdvisorModalProps> = ({
  isOpen,
  onClose,
  contextSchoolName,
}) => {
  const { searchState } = useSearch();
  const { savedSchools } = useShortlist();
  const { comparisonSchools } = useComparison();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'advisor',
      text: contextSchoolName
        ? `Hello! I am your FindMySchool Advisor. I can analyze how ${contextSchoolName} fits your stated priorities (Class 5, CBSE/Cambridge, Tambaram/OMR commute, and ₹1.2L budget), or answer questions on admission timelines and hidden expenses.`
        : `Welcome to the FindMySchool Decision Advisor. I help parents in Chennai evaluate schools realistically based on commute tolerances, board choices, transparent fee disclosures, and curriculum philosophies. What would you like to explore today?`,
      checklist: [
        'Commute reality checks (peak OMR / GST traffic buffers)',
        'Hidden school fees (transport, uniforms, admission non-refundable kit)',
        'CBSE vs Cambridge for Indian competitive exams',
      ],
    },
  ]);

  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAsk = (presetKey?: string, customText?: string) => {
    const questionText = customText || (presetKey ? getPresetText(presetKey) : inputQuestion);
    if (!questionText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
    };

    let replyText = '';
    let checklist: string[] | undefined;
    let caveats: string[] | undefined;

    if (presetKey && MOCK_ADVISOR_FAQ[presetKey]) {
      replyText = MOCK_ADVISOR_FAQ[presetKey];
    } else if (questionText.toLowerCase().includes('drawback') || questionText.toLowerCase().includes('risk')) {
      replyText = `Based on curated school disclosures and commute models:
1. Commute fatigue: For schools along OMR or Porur, afternoon return trips during monsoon can exceed 45 minutes.
2. Incidental fee escalations: Some private institutions increase fees 8-12% annually without prior notice in the prospectus.
3. Elective sports vs core syllabus: Ensure robotics and swimming are part of weekly timetable hours rather than expensive after-school clubs.`;
      caveats = [
        'Always confirm bus routes directly with the school transport coordinator before paying fees.',
        'Request the previous 3 years fee revision history.',
      ];
    } else if (questionText.toLowerCase().includes('compare') || questionText.toLowerCase().includes('shortlist')) {
      replyText = `Comparing your current shortlisted options:
• The Shriram Millennium School (OMR): Best balance for modern robotics, semi-covered swimming, and progressive CBSE/Cambridge inquiry.
• The PSBB Millennium School (Gerugambakkam): Superior traditional academic rigor and competitive exam foundation, but swimming is off-site.
• Bala Vidya Mandir (Adyar): Most budget-friendly (~₹82,000/yr) with exceptional academic reputation, but at the maximum edge of your commute radius.`;
      checklist = [
        'Visit campuses during morning drop-off hours (8:00 AM)',
        'Check child-to-washroom ratio on primary school floors',
      ];
    } else {
      const budgetMax = searchState.filters?.budgetMax || 150000;
      const targetGrade = searchState.filters?.grade || 'Any Grade';
      const radiusKm = searchState.filters?.radiusKm || 12;
      replyText = `For ${contextSchoolName || 'your Chennai search'} with a budget limit of ₹${(budgetMax / 100000).toFixed(1)}L and target grade ${targetGrade}:
1. Curriculum alignment: Matched with your stated preferences.
2. Commute: Average travel radius is ${radiusKm} km.
3. Verification advice: Request official receipts for sports and laboratory activity funds to ensure no surprise charges.`;
      checklist = [
        'Verify transport pick-up timing at your exact residential gate',
        'Inquire about parent-teacher conference frequency',
      ];
    }

    const advisorMsg: Message = {
      id: `a-${Date.now() + 1}`,
      sender: 'advisor',
      text: replyText,
      checklist,
      caveats,
    };

    setMessages((prev) => [...prev, userMsg, advisorMsg]);
    setInputQuestion('');
  };

  const getPresetText = (key: string) => {
    switch (key) {
      case 'why-match':
        return 'Why is this school recommended for my requirements?';
      case 'hidden-costs':
        return 'What hidden or incidental fees should I watch out for in private schools?';
      case 'cbse-vs-cambridge':
        return 'How do CBSE and Cambridge compare for my child?';
      case 'omr-commute':
        return 'What are the potential drawbacks for an 8 km commute on OMR?';
      case 'montessori-vs-playway':
        return 'What is the difference between Montessori and Play-way learning approaches?';
      case 'preschool-checklist':
        return 'What key things should I verify during a preschool or daycare campus visit?';
      case 'standalone-vs-k12':
        return 'Should I choose a standalone preschool or an integrated K-12 campus?';
      default:
        return 'Can you give me key recommendations for admissions?';
    }
  };

  const isPreschoolMode = searchState.filters?.educationTarget === 'preschool' || 
    Boolean(searchState.filters?.preschool?.programs && searchState.filters.preschool.programs.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FAF9F6] w-full max-w-xl rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[600px] max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-modal-title"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 id="advisor-modal-title" className="font-editorial text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="truncate">FindMySchool Decision Advisor</span>
                <span className="text-[10px] bg-teal-900 text-teal-200 px-2 py-0.2 rounded font-mono shrink-0">
                  Chennai Intelligence
                </span>
              </h2>
              <p className="text-[11px] text-stone-400 truncate font-sans">
                Objective parent decision intelligence · Zero marketing bias
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
            aria-label="Close Advisor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips with Semantic Colors */}
        <div className="p-2 sm:p-2.5 bg-[#F5F1E8] border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs shrink-0 font-sans">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider shrink-0 mr-1">
            Quick Ask:
          </span>

          {isPreschoolMode ? (
            <>
              <button
                type="button"
                onClick={() => handleAsk('montessori-vs-playway')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Montessori vs Play-way
              </button>
              <button
                type="button"
                onClick={() => handleAsk('preschool-checklist')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Daycare & Visit Checklist
              </button>
              <button
                type="button"
                onClick={() => handleAsk('standalone-vs-k12')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Standalone vs K-12
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleAsk('why-match')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Why this match?
              </button>
              <button
                type="button"
                onClick={() => handleAsk('hidden-costs')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Fee items to confirm
              </button>
              <button
                type="button"
                onClick={() => handleAsk('cbse-vs-cambridge')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                CBSE vs Cambridge
              </button>
              <button
                type="button"
                onClick={() => handleAsk('omr-commute')}
                className="px-3 py-1.5 min-h-[36px] flex items-center rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 whitespace-nowrap text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Commute drawbacks
              </button>
            </>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F6] text-sm font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 leading-relaxed text-xs sm:text-sm ${
                  m.sender === 'user'
                    ? 'bg-[#0D9488] text-white shadow-2xs'
                    : 'bg-white text-stone-800 border border-stone-200 shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                {/* Structured verification points */}
                {m.checklist && m.checklist.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 text-xs">
                    <span className="font-bold text-stone-900 block mb-1.5">
                      Parent Verification Points:
                    </span>
                    <ul className="space-y-1 text-stone-600">
                      {m.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Caution flags if present */}
                {m.caveats && m.caveats.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-amber-100 text-xs bg-amber-50/80 p-2.5 rounded-xl text-amber-950 border border-amber-200/70">
                    <span className="font-bold block mb-0.5">Parent Cautionary Flag:</span>
                    <ul className="space-y-0.5">
                      {m.caveats.map((c, idx) => (
                        <li key={idx}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(undefined, inputQuestion);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask about admissions, fee transparency, or boards..."
              className="flex-1 bg-[#FAF9F6] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:bg-white transition-all min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim()}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 bg-[#0D9488] hover:bg-[#115E59] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
          <div className="mt-1 text-[11px] text-stone-500 text-center font-sans">
            Independent guidance based on curated school disclosures and parent priorities.
          </div>
        </div>
      </div>
    </div>
  );
};
