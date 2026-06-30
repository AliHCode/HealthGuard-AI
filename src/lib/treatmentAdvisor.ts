export interface TreatmentProtocol {
  referralUrgency: 'low' | 'moderate' | 'high';
  actionSuggested: string;
  drugDosage?: {
    drugName: string;
    schedule: string;
    instructions: string;
  };
  supportiveCare: string[];
}

export function getWHOTreatmentAdvisor(
  disease: 'pneumonia' | 'malaria',
  detected: boolean,
  severity?: 'Mild' | 'Moderate' | 'Severe',
  age?: number | string,
  weight?: number | string
): TreatmentProtocol | null {
  if (!detected) return null;

  const numWeight = weight ? parseFloat(String(weight)) : 0;
  const numAge = age ? parseFloat(String(age)) : 0;

  if (disease === 'malaria') {
    if (severity === 'Severe') {
      return {
        referralUrgency: 'high',
        actionSuggested: 'IMMEDIATE EMERGENCY REFERRAL TO TERTIARY MEDICAL CENTER',
        drugDosage: {
          drugName: 'Artesunate (Parenteral)',
          schedule: '2.4 mg/kg IV or IM at 0 hours, 12 hours, and 24 hours, then daily course.',
          instructions: 'Administer pre-referral rectal artesunate (10 mg/kg) if transfer delay is expected (>6 hours).'
        },
        supportiveCare: [
          'Monitor blood glucose closely (every 4 hours) to prevent hypoglycemia.',
          'Manage high fever using active cooling (lukewarm sponging) and paracetamol (15 mg/kg).',
          'Ensure patient airway is clear and place in recovery position if convulsing.',
          'Start IV fluids cautiously to avoid fluid overload / pulmonary edema.'
        ]
      };
    } else {
      // Uncomplicated Malaria
      // Calculate standard WHO ACT dosage (Artemether 20mg / Lumefantrine 120mg tablets)
      let tablets = 4;
      let reason = 'Based on default adult weight (>35kg)';
      
      if (numWeight > 0) {
        if (numWeight >= 5 && numWeight <= 14) {
          tablets = 1;
          reason = 'Standard WHO pediatric dosage for weight 5–14 kg';
        } else if (numWeight >= 15 && numWeight <= 24) {
          tablets = 2;
          reason = 'Standard WHO pediatric dosage for weight 15–24 kg';
        } else if (numWeight >= 25 && numWeight <= 34) {
          tablets = 3;
          reason = 'Standard WHO pediatric dosage for weight 25–34 kg';
        } else {
          tablets = 4;
          reason = 'Standard WHO adult dosage for weight ≥35 kg';
        }
      } else if (numAge > 0) {
        // Fallback to age-based dosing if weight not provided
        if (numAge < 3) {
          tablets = 1;
          reason = 'Estimated WHO pediatric dosage for age <3 years';
        } else if (numAge >= 3 && numAge <= 8) {
          tablets = 2;
          reason = 'Estimated WHO pediatric dosage for age 3–8 years';
        } else if (numAge >= 9 && numAge <= 14) {
          tablets = 3;
          reason = 'Estimated WHO pediatric dosage for age 9–14 years';
        } else {
          tablets = 4;
          reason = 'Estimated WHO adult dosage for age >14 years';
        }
      }

      return {
        referralUrgency: 'moderate',
        actionSuggested: 'Outpatient Artemisinin-Based Combination Therapy (ACT)',
        drugDosage: {
          drugName: 'Artemether (20 mg) + Lumefantrine (120 mg)',
          schedule: `${tablets} tablet(s) twice daily for 3 days (Total of 6 doses).`,
          instructions: `Take each dose with milk or fat-containing food to enhance absorption. ${reason}.`
        },
        supportiveCare: [
          'Give paracetamol for high fever (fever >38.5°C).',
          'If patient vomits within 30 minutes of taking a dose, repeat the full dose.',
          'Provide extra oral fluids and monitor for danger signs (lethargy, severe vomiting).',
          'Follow up in 48 hours to confirm parasite clearance.'
        ]
      };
    }
  } else {
    // Pneumonia
    if (severity === 'Severe') {
      return {
        referralUrgency: 'high',
        actionSuggested: 'CRITICAL: URGENT REFERRAL TO HOSPITAL & OXYGEN PROTOCOLS',
        drugDosage: {
          drugName: 'Ampicillin + Gentamicin or Ceftriaxone (Injectable)',
          schedule: 'Ceftriaxone 80 mg/kg IV/IM once daily, OR Ampicillin 50 mg/kg IV/IM every 6 hours + Gentamicin 7.5 mg/kg IV/IM once daily.',
          instructions: 'Give first dose of parenteral antibiotic before referral if transport is delayed.'
        },
        supportiveCare: [
          'Initiate supplementary oxygen support immediately if SpO2 < 93% or if severe chest indrawing is present.',
          'Clear nasal airway secretions gently to reduce respiratory effort.',
          'Maintain hydration through intravenous fluids or nasogastric feeding if unable to swallow.',
          'Monitor heart rate, respiratory rate, and oxygen saturation continuously.'
        ]
      };
    } else {
      // Non-severe Pneumonia
      // Oral Amoxicillin: 50 mg/kg per dose twice daily for 3-5 days
      let doseText = '250 mg dispersible tablets twice daily';
      let countText = '2 tablets per dose';
      
      if (numWeight > 0) {
        const mgPerDose = numWeight * 25; // standard WHO amoxicillin twice daily dosing
        doseText = `Amoxicillin ${Math.round(mgPerDose)} mg twice daily`;
        countText = `${Math.round(mgPerDose / 250)} x 250mg dispersible tablet(s) per dose`;
      } else if (numAge > 0) {
        if (numAge < 1) {
          doseText = 'Amoxicillin 250 mg twice daily';
          countText = '1 x 250mg dispersible tablet per dose';
        } else if (numAge >= 1 && numAge < 5) {
          doseText = 'Amoxicillin 500 mg twice daily';
          countText = '2 x 250mg dispersible tablets per dose';
        } else {
          doseText = 'Amoxicillin 1000 mg twice daily';
          countText = '4 x 250mg dispersible tablets (or 2 x 500mg) per dose';
        }
      }

      return {
        referralUrgency: 'moderate',
        actionSuggested: 'Outpatient Oral Antibiotic Treatment',
        drugDosage: {
          drugName: 'Amoxicillin (Dispersible Tablets)',
          schedule: `${doseText} (${countText}) for 3 to 5 days.`,
          instructions: 'Dissolve dispersible tablet in clean water or breastmilk. Complete the full course.'
        },
        supportiveCare: [
          'Continue breastfeeding and intake of oral fluids to prevent dehydration.',
          'Relieve cough and soothe throat with safe home remedies (honey, warm fluids).',
          'Monitor respiratory rate daily (Danger threshold: >50 breaths/min for infants, >40 for children).',
          'Return immediately if patient shows chest indrawing, stridor, or inability to drink.'
        ]
      };
    }
  }
}
