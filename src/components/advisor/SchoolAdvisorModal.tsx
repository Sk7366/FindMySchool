import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Send,
  Check,
  RotateCcw,
  Sliders,
  Scale,
  ArrowRight,
  Bookmark,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { useShortlist } from '../../context/ShortlistContext';
import { useComparison } from '../../context/ComparisonContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import {
  buildAdvisorContext,
  getSuggestedActions,
  getAdvisorResponse,
  AdvisorContext,
  SuggestedAction,
} from '../../utils/advisorContext';

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
  suggestedActions?: SuggestedAction[];
  actionTrigger?: 'adjust-radius' | 'adjust-budget' | 'open-tuner' | 'compare-nav' | 'clear-filters';
  actionTriggerLabel?: string;
}

export const SchoolAdvisorModal: React.FC<SchoolAdvisorModalProps> = ({
  isOpen,
  onClose,
  contextSchoolName,
}) => {
  const { searchState, filteredSchools, updateFilters } = useSearch();
  const { savedSchools } = useShortlist();
  const { comparisonSchools } = useComparison();
  const navigate = useNavigate();

  const [inputQuestion, setInputQuestion] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Compute live search context snapshot
  const currentContext = useMemo<AdvisorContext>(() => {
    return buildAdvisorContext(
      searchState,
      savedSchools,
      comparisonSchools,
      filteredSchools,
      contextSchoolName
    );
  }, [searchState, savedSchools, comparisonSchools, filteredSchools, contextSchoolName]);

  // Suggested actions dynamically computed from context
  const suggestedActions = useMemo<SuggestedAction[]>(() => {
    return getSuggestedActions(currentContext);
  }, [currentContext]);

  // Generate initial contextual opening message
  const createInitialMessage = (): Message => {
    const openingText = currentContext.contextSummaryText;
    return {
      id: 'm-context-init',
      sender: 'advisor',
      text: `${openingText}\n\nI can help explain why certain filters matter, contrast learning approaches, analyze fees, or prepare questions for your school visits.`,
      suggestedActions: suggestedActions.slice(0, 5),
      checklist: [
        'Commute reality check for Chennai traffic corridors',
        'Headline tuition vs total cost of ownership transparency',
        'Curriculum and learning approach alignment',
      ],
    };
  };

  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);

  // When modal is reopened, update opening message if context has shifted
  useEffect(() => {
    if (isOpen) {
      setMessages([createInitialMessage()]);
      setInputQuestion('');
    }
  }, [isOpen, contextSchoolName]);

  // Focus trap hook for accessible modal behavior
  const modalRef = useFocusTrap({
    isOpen,
    onClose,
  });

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleAsk = (presetKey?: string, customText?: string) => {
    const questionText = customText || presetKey || inputQuestion;
    if (!questionText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
    };

    const reply = getAdvisorResponse(presetKey || questionText, currentContext, filteredSchools);

    const advisorMsg: Message = {
      id: `a-${Date.now() + 1}`,
      sender: 'advisor',
      text: reply.text,
      checklist: reply.checklist,
      caveats: reply.caveats,
      suggestedActions: reply.suggestedFollowUps,
      actionTrigger: reply.actionTrigger,
      actionTriggerLabel: reply.actionTriggerLabel,
    };

    setMessages((prev) => [...prev, userMsg, advisorMsg]);
    setInputQuestion('');
  };

  const handleExecuteAction = (actionTrigger?: string) => {
    if (actionTrigger === 'compare-nav') {
      onClose();
      navigate('/compare');
    } else if (actionTrigger === 'open-tuner') {
      onClose();
      navigate('/results');
    } else if (actionTrigger === 'adjust-radius') {
      updateFilters({ radiusKm: Math.min(25, (searchState.filters.radiusKm || 12) + 5) });
      handleAsk(undefined, 'I expanded your commute radius by 5 km to include neighboring corridors.');
    } else if (actionTrigger === 'adjust-budget') {
      updateFilters({ budgetMax: (searchState.filters.budgetMax || 150000) + 50000 });
      handleAsk(undefined, 'I increased your budget ceiling by ₹50,000/year to evaluate additional institutions.');
    }
  };

  const handleResetToContext = () => {
    setMessages([createInitialMessage()]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="bg-[#FAF9F6] w-full max-w-xl rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[620px] max-h-[94vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-modal-title"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg bg-[#0D9488] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs"
              aria-hidden="true"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 id="advisor-modal-title" className="font-editorial text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="truncate">FindMySchool Decision Advisor</span>
                <span className="text-[10px] bg-teal-900 text-teal-200 px-2 py-0.2 rounded font-mono shrink-0">
                  Context-Aware
                </span>
              </h2>
              <p className="text-[11px] text-stone-400 truncate font-sans">
                Objective parent intelligence grounded in your current search criteria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 cursor-pointer"
            aria-label="Close Advisor"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live Context Ribbon */}
        <div className="px-3.5 sm:px-4 py-2 bg-stone-100/90 border-b border-stone-200 text-xs text-stone-700 flex items-center justify-between gap-2 shrink-0 font-sans">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 overflow-hidden">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
              Active Context:
            </span>
            {currentContext.contextBadgeTags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200/90 text-[11px] font-semibold text-stone-800 shadow-2xs whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetToContext}
            className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 shrink-0 p-1 rounded hover:bg-stone-200/60 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-600 cursor-pointer"
            title="Reset conversation and sync with active search context"
            aria-label="Sync Advisor with current search context"
          >
            <RotateCcw className="w-3 h-3 text-teal-700" aria-hidden="true" />
            <span className="hidden sm:inline">Sync context</span>
          </button>
        </div>

        {/* Quick Suggestion Action Chips Bar */}
        <div
          className="p-2 sm:p-2.5 bg-[#F5F1E8] border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs shrink-0 font-sans"
          role="toolbar"
          aria-label="Advisor suggested actions"
        >
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider shrink-0 mr-1">
            Suggested Actions:
          </span>

          {suggestedActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAsk(action.id, action.label)}
              className="px-3 py-1.5 min-h-[34px] flex items-center rounded-lg bg-white hover:bg-teal-50 border border-stone-200 hover:border-teal-300 text-stone-800 hover:text-teal-950 whitespace-nowrap text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Chat Conversation History */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-[#FAF9F6] text-sm font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[96%] sm:max-w-[88%] rounded-2xl p-3.5 sm:p-4 leading-relaxed text-xs sm:text-sm ${
                  m.sender === 'user'
                    ? 'bg-[#0D9488] text-white shadow-2xs font-medium'
                    : 'bg-white text-stone-800 border border-stone-200/90 shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed font-sans">{m.text}</p>

                {/* Structured Verification Points */}
                {m.checklist && m.checklist.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 text-xs">
                    <span className="font-bold text-stone-900 block mb-1.5">
                      Parent Verification Points:
                    </span>
                    <ul className="space-y-1 text-stone-600">
                      {m.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5 stroke-[3]" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cautionary Flag */}
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

                {/* Inline Action Trigger Button (e.g. Compare Matrix or Priority Tuner) */}
                {m.actionTrigger && m.actionTriggerLabel && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleExecuteAction(m.actionTrigger)}
                      className="px-3.5 py-2 bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <span>{m.actionTriggerLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* Inline Follow-up Suggested Actions */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                      Follow-up questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => handleAsk(action.id, action.label)}
                          className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-teal-50 border border-stone-200 hover:border-teal-300 text-stone-700 hover:text-teal-950 text-xs font-semibold transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-600"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
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
              placeholder="Ask about admissions, fee transparency, or visit checklists..."
              aria-label="Ask about admissions, fee transparency, or visit checklists"
              className="flex-1 bg-[#FAF9F6] border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus-visible:ring-2 focus-visible:ring-[#0D9488] focus:bg-white transition-all min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim()}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label="Send question to advisor"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
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
