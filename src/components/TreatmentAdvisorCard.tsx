import { motion } from 'framer-motion';
import { Pill, Activity, AlertTriangle, ShieldAlert, Heart, Info, ClipboardList, CheckCircle2 } from 'lucide-react';
import { getWHOTreatmentAdvisor } from '../lib/treatmentAdvisor';
import type { PatientDetails } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface TreatmentAdvisorCardProps {
  disease: 'pneumonia' | 'malaria';
  detected: boolean;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  patientDetails: PatientDetails;
}

export function TreatmentAdvisorCard({
  disease,
  detected,
  severity = 'Moderate',
  patientDetails
}: TreatmentAdvisorCardProps) {
  const advisor = getWHOTreatmentAdvisor(
    disease,
    detected,
    severity,
    patientDetails.age,
    patientDetails.weight
  );

  if (!advisor) return null;

  const urgencyColors = {
    low: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    moderate: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30',
    high: 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30'
  };

  const urgencyLabel = {
    low: 'Routine Outpatient Care',
    moderate: 'Outpatient Treatment / Monitor closely',
    high: 'CRITICAL: High Priority Emergency Referral'
  };

  const UrgencyIcon = advisor.referralUrgency === 'high' ? ShieldAlert : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      <Card className="border border-black/[0.08] overflow-hidden shadow-elegant bg-white text-slate-900 text-left">
        {/* Banner header based on referral urgency */}
        <div className={`p-4 border-b flex items-center justify-between ${urgencyColors[advisor.referralUrgency]}`}>
          <div className="flex items-center gap-2.5">
            <UrgencyIcon className="size-4.5 animate-pulse" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">
                WHO Clinical Protocol Advisor
              </span>
              <span className="text-xs font-extrabold tracking-tight">
                {urgencyLabel[advisor.referralUrgency]}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-black/5 rounded-full select-none">
            {disease.toUpperCase()} : {severity.toUpperCase()}
          </span>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Action Suggested */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Action</span>
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {advisor.actionSuggested}
            </p>
          </div>

          {/* Dosage / Drug details if available */}
          {advisor.drugDosage && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-slate-700">
                <Pill className="size-4 text-slate-500" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                  Recommended First-Line Dosing
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-800">{advisor.drugDosage.drugName}</span>
                  <span className="text-[10px] font-mono text-slate-500">Weight-adjusted</span>
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-white border border-slate-100 px-3 py-1.5 rounded-lg">
                  {advisor.drugDosage.schedule}
                </p>
                <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                  {advisor.drugDosage.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Supportive Care Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <ClipboardList className="size-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Supportive Care Protocols</span>
            </div>
            <ul className="space-y-1.5 pl-0">
              {advisor.supportiveCare.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed list-none">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Warning Disclaimer */}
          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-slate-400">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            <p className="text-[9.5px] leading-relaxed">
              <strong>Medical Disclaimer:</strong> This decision support tool is for reference only and aligns with WHO guidelines. Dosages assume uncomplicated cases unless labeled severe. Confirm patient status with standard diagnostic oximetry or blood films before starting therapy.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
