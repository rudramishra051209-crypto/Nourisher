import { jsPDF } from 'jspdf';
import { MealItem, MealAlternative } from '../types';
import { NutritionEngineOutput } from './nutritionEngine';

/**
 * Sanitizes any string to ensure strictly clean, compatible ASCII representation.
 * Prevents any weird symbols, encoding artifacts (like â€“ or â‚¹), or broken glyphs
 * when rendering in PDF standard fonts.
 */
export function sanitizePdfText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // en-dash and em-dash
    .replace(/[\u20B9₹]/g, 'Rs. ')   // Indian Rupee symbol
    .replace(/•/g, '-')              // bullet
    .replace(/→/g, '->')             // arrows
    .replace(/←/g, '<-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E\r\n\t]/g, ' ') // Strip non-ASCII or replace with space
    .replace(/[ ]+/g, ' ')           // Collapse multiple consecutive spaces
    .trim();
}

export interface PdfExportParams {
  userName?: string;
  ageGroup: string;
  exactAge: string;
  height: string;
  weight: string;
  sex?: string;
  activity?: string;
  foodStyle: string;
  mainGoal: string;
  energyGoal: string;
  budget: string;
  planOutput: NutritionEngineOutput;
  activeMeals: MealItem[];
}

export function generateDietPlanPdf({
  userName,
  ageGroup,
  exactAge,
  height,
  weight,
  sex,
  activity,
  foodStyle,
  mainGoal,
  energyGoal,
  budget,
  planOutput,
  activeMeals,
}: PdfExportParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = margin + 4;
      drawPageHeaderMini();
    }
  };

  const drawPageHeaderMini = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NOURISH PRO  |  ATHLETIC NUTRITION BLUEPRINT', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizePdfText(foodStyle + ' - ' + energyGoal), pageWidth - margin, y, { align: 'right' });
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // 1. MAIN COVER / HEADER BANNER
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  // Accent badge
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(margin, y, 3, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('NOURISH PRO - ATHLETIC PERFORMANCE BLUEPRINT', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    sanitizePdfText(`Personalized Daily Nutrition Protocol & Macro Calibration  |  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`),
    margin + 6,
    y + 14
  );

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    sanitizePdfText(`Goal: ${mainGoal} (${energyGoal})  |  Diet: ${foodStyle}  |  Budget: ${budget}`),
    margin + 6,
    y + 20
  );

  y += 30;

  // 2. ATHLETE PROFILE & CALORIC BREAKDOWN CARDS
  checkPageBreak(38);

  // Profile Card (Left) & Macro Card (Right)
  const colWidth = (contentWidth - 4) / 2;

  // Left Box: Athlete Profile
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colWidth, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ATHLETE PROFILE PARAMETERS', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const profileRows = [
    userName ? `Athlete: ${sanitizePdfText(userName)}` : `Athlete: Registered User`,
    `Demographic: ${sanitizePdfText(ageGroup)} ${exactAge ? `(${exactAge} yrs)` : ''}  |  Sex: ${sex || 'Standard reference'}`,
    `Biometrics: ${height ? `${height} cm` : 'Ref height'}  |  ${weight ? `${weight} kg` : 'Ref weight'}`,
    `Activity Level: ${sanitizePdfText(activity || 'Moderate')}  |  Diet: ${sanitizePdfText(foodStyle)}`,
    `Energy Objective: ${sanitizePdfText(energyGoal)}`,
  ];

  let profileY = y + 11;
  profileRows.forEach((row) => {
    doc.text(row, margin + 4, profileY);
    profileY += 4.8;
  });

  // Right Box: Target Calories & Macros
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DAILY CALORIC & MACRO ALLOCATION', margin + colWidth + 8, y + 6);

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`${planOutput.targetCalories.toLocaleString()} kcal / day`, margin + colWidth + 8, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Target Range: ${planOutput.calorieRange.low} - ${planOutput.calorieRange.high} kcal  |  BMR: ${planOutput.bmr} kcal`,
    margin + colWidth + 8,
    y + 18
  );

  // Macro metrics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Protein: ${planOutput.macros.protein}g (${planOutput.macros.proteinPct}%)  |  Carbs: ${planOutput.macros.carbs}g (${planOutput.macros.carbsPct}%)`,
    margin + colWidth + 8,
    y + 24
  );
  doc.text(
    `Fats: ${planOutput.macros.fats}g (${planOutput.macros.fatsPct}%)  |  Dietary Fiber: ~${planOutput.macros.fiber}g/day`,
    margin + colWidth + 8,
    y + 29
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Calibrated at ~2.0g protein/kg bodyweight for optimal MPS synthesis`,
    margin + colWidth + 8,
    y + 33.5
  );

  y += 40;

  // 3. RATIONALE & MANIFESTO QUOTE
  checkPageBreak(16);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');
  doc.setFillColor(5, 150, 105); // emerald line
  doc.rect(margin, y, 2.5, 12, 'F');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const rationaleLines = doc.splitTextToSize(`"${sanitizePdfText(planOutput.goalRationale)}"`, contentWidth - 8);
  doc.text(rationaleLines, margin + 5, y + 4.5);

  y += 16;

  // 4. SECTION HEADER: 4-STAGE ATHLETIC FUEL PROTOCOL
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. FOUR-STAGE ATHLETIC FUEL PROTOCOL', margin, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Portions calibrated to ${sanitizePdfText(planOutput.calorieTier.toUpperCase())} tier and ${sanitizePdfText(budget)} budget`, margin, y + 8);
  y += 11;

  // 5. RENDER EACH MEAL ITEM
  const mealCues = [
    'Morning Fuel - High Satiety & Micronutrients',
    'Midday Sustained Energy - Complex Carbs & Glycogen',
    'Pre/Post Training - Rapid Amino Acid Delivery',
    'Evening Recovery - Slow-Digesting Casein / Cellular Repair',
  ];

  activeMeals.forEach((meal, idx) => {
    // Estimate meal block height
    const prepLines = doc.splitTextToSize(`Preparation: ${sanitizePdfText(meal.preparationSteps)}`, contentWidth - 10);
    const ingrLines = doc.splitTextToSize(`Key Ingredients: ${sanitizePdfText(meal.ingredients)}`, contentWidth - 10);
    const budgetTipText = meal.budgetTip ? doc.splitTextToSize(`Budget Tip: ${sanitizePdfText(meal.budgetTip)}`, contentWidth - 10) : [];

    const estHeight = 24 + prepLines.length * 3.6 + ingrLines.length * 3.6 + (budgetTipText.length ? budgetTipText.length * 3.6 + 2 : 0);

    checkPageBreak(estHeight + 4);

    // Meal Card Container
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, estHeight, 1.5, 1.5, 'FD');

    // Stage tag badge
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 3, y + 3, 24, 4.5, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`STAGE 0${idx + 1}`, margin + 5, y + 6.2);

    // Timing Cue
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(sanitizePdfText(mealCues[idx] || meal.mealName), margin + 30, y + 6.2);

    // Calorie & Protein Pill
    const metricText = `${sanitizePdfText(meal.proteinEstimate)}  ${meal.caloriesEstimate ? `|  ${sanitizePdfText(meal.caloriesEstimate)}` : ''}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text(metricText, pageWidth - margin - 4, y + 6.2, { align: 'right' });

    // Dish Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(sanitizePdfText(meal.dishTitle), margin + 4, y + 12);

    // Quantity / Portion
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Serving Portion: ${sanitizePdfText(meal.quantity)}  |  Split: ${sanitizePdfText(meal.macroSplit || 'Balanced')}`, margin + 4, y + 16.5);

    let innerY = y + 21;

    // Ingredients
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(ingrLines, margin + 4, innerY);
    innerY += ingrLines.length * 3.6 + 1;

    // Preparation Steps
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(prepLines, margin + 4, innerY);
    innerY += prepLines.length * 3.6 + 1;

    // Budget Tip (if available)
    if (budgetTipText.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(budgetTipText, margin + 4, innerY);
    }

    y += estHeight + 4;
  });

  // 6. ALTERNATIVES & SWAPS SECTION
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. SMART MEAL ALTERNATIVES & SWAPS GUIDE', margin, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Maintain macro adherence when schedules or pantries require meal substitutions.', margin, y + 8);
  y += 11;

  const altKeys = Object.keys(planOutput.alternatives);
  altKeys.forEach((mealKey) => {
    const alts: MealAlternative[] = planOutput.alternatives[mealKey] || [];
    if (!alts || alts.length === 0) return;

    checkPageBreak(12 + alts.length * 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Alternative Options for ${sanitizePdfText(mealKey)}:`, margin, y + 3);
    y += 5;

    alts.forEach((alt) => {
      const altText = `- ${sanitizePdfText(alt.name)}: ${sanitizePdfText(alt.description)}`;
      const splitAlt = doc.splitTextToSize(altText, contentWidth - 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(splitAlt, margin + 2, y + 2);
      y += splitAlt.length * 3.6 + 1;
    });

    y += 2;
  });

  // 7. TACTICAL BUDGET & HIGH-PROTEIN STAPLES STRATEGY
  checkPageBreak(28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. TACTICAL BUDGET & HIGH PROTEIN-PER-RUPEE STRATEGY (${sanitizePdfText(budget)})`, margin, y + 4);
  y += 7;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('EXECUTION DIRECTIVE:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const budgetLines = doc.splitTextToSize(sanitizePdfText(planOutput.budgetExecutionPlan), contentWidth - 8);
  doc.text(budgetLines, margin + 4, y + 9);

  const stapleTip = doc.splitTextToSize(
    'Top protein-per-rupee staples: bulk soya chunks (52% protein, ~Rs. 45/kg), roasted sattu flour, whole eggs (~Rs. 7/egg), seasonal dal/chana, and fresh curd.',
    contentWidth - 8
  );
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(stapleTip, margin + 4, y + 16);

  y += 25;

  // 8. SPORTS SCIENCE DISCLAIMER & CLOSING
  checkPageBreak(18);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('"Good nutrition should fit your life - not take over your life."', pageWidth / 2, y + 2, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Educational fitness planning protocol. Not medical or clinical nutrition therapy. Consult a licensed dietitian or physician for personal health conditions.',
    pageWidth / 2,
    y + 2,
    { align: 'center' }
  );

  // 9. STAMP NUMBERED FOOTERS ON ALL PAGES
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `NOURISH PRO ATHLETIC PROTOCOL  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Safe clean filename without any weird symbols
  const cleanGoal = sanitizePdfText(mainGoal).replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDiet = sanitizePdfText(foodStyle).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `NourishPro_DietPlan_${cleanDiet}_${cleanGoal}.pdf`;

  doc.save(filename);
}
