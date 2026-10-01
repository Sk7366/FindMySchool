import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center text-white font-editorial font-bold text-lg shadow-xs">
                F
              </div>
              <span className="font-editorial font-bold text-xl text-white tracking-tight">
                FindMySchool
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
              An intelligent, transparent decision platform helping Chennai parents discover and evaluate schools based on verifiable family requirements.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>100% independent · Zero paid school rankings</span>
            </div>
          </div>

          {/* Chennai Hubs */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Chennai Hubs</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>
                <Link to="/results?location=OMR" className="hover:text-white transition-colors">
                  OMR & Sholinganallur Corridor
                </Link>
              </li>
              <li>
                <Link to="/results?location=Tambaram" className="hover:text-white transition-colors">
                  Tambaram & GST Zone
                </Link>
              </li>
              <li>
                <Link to="/results?location=Adyar" className="hover:text-white transition-colors">
                  Adyar & Besant Nagar
                </Link>
              </li>
              <li>
                <Link to="/results?location=Porur" className="hover:text-white transition-colors">
                  Porur & Gerugambakkam
                </Link>
              </li>
              <li>
                <Link to="/results?location=Anna%20Nagar" className="hover:text-white transition-colors">
                  Anna Nagar & Mogappair
                </Link>
              </li>
            </ul>
          </div>

          {/* Curriculum & Resources */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Educational Boards
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>
                <Link to="/results?curriculum=CBSE" className="hover:text-white transition-colors">
                  CBSE Schools in Chennai
                </Link>
              </li>
              <li>
                <Link to="/results?curriculum=Cambridge" className="hover:text-white transition-colors">
                  Cambridge (IGCSE / A-Levels)
                </Link>
              </li>
              <li>
                <Link to="/results?curriculum=IB" className="hover:text-white transition-colors">
                  IB World Continuum Schools
                </Link>
              </li>
              <li>
                <Link to="/results?curriculum=ICSE" className="hover:text-white transition-colors">
                  ICSE / ISC Institutions
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Board Comparison Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Parent Commitment</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              FindMySchool never accepts promotional payments to manipulate match scores. All fee structures specify audit dates and receipts source.
            </p>
            <div className="pt-2">
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-bold"
              >
                <span>Read our transparency manifesto</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4 font-sans">
          <p>© 2026 FindMySchool. Built for parents across Tamil Nadu & India.</p>
          <p className="text-stone-500 text-center md:text-right max-w-xl leading-relaxed">
            Disclaimer: Fee structures and admissions timelines are compiled from parent fee receipts and official circulars. Always verify specific transport and fee schedules directly with school administrations prior to application submission.
          </p>
        </div>
      </div>
    </footer>
  );
};
