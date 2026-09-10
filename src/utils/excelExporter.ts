import * as XLSX from 'xlsx';
import { UserInteraction } from '../types';

/**
 * Generates and downloads a clean, professional Microsoft Excel (.xlsx) spreadsheet
 * containing all visitor interactions and athlete profile submissions.
 */
export function exportInteractionsToExcel(
  interactions: UserInteraction[],
  customFilename?: string
): void {
  if (!interactions || interactions.length === 0) {
    alert('No interactions available to export.');
    return;
  }

  const rows = interactions.map((item, index) => ({
    'Sr No': index + 1,
    'Timestamp': item.timestamp,
    'Source / Platform': item.source || 'Nourish Pro Web',
    'Athlete Name': item.name || 'Anonymous Athlete',
    'Contact Info': item.contact || 'N/A',
    'Personal Goals / Notes': item.notes || 'None provided',
    'Age Bracket': item.ageGroup,
    'Exact Age': item.exactAge ? `${item.exactAge} yrs` : 'Standard Ref',
    'Sex': item.sex || 'Unspecified',
    'Height (cm)': item.height ? `${item.height} cm` : 'Ref Demographics',
    'Weight (kg)': item.weight ? `${item.weight} kg` : 'Ref Demographics',
    'Activity Level': item.activity || 'Moderate',
    'Food Style': item.foodStyle,
    'Main Performance Goal': item.mainGoal,
    'Energy Objective': item.energyGoal,
    'Daily Budget': item.budget,
    'Target Calories (kcal/day)': item.targetCalories || 'Estimated',
    'Protein Target (g/day)': item.proteinTarget ? `${item.proteinTarget}g` : 'Estimated',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for optimal viewing in Excel / Sheets
  worksheet['!cols'] = [
    { wch: 8 },  // Sr No
    { wch: 22 }, // Timestamp
    { wch: 20 }, // Source / Platform
    { wch: 22 }, // Athlete Name
    { wch: 24 }, // Contact Info
    { wch: 26 }, // Notes
    { wch: 14 }, // Age Bracket
    { wch: 12 }, // Exact Age
    { wch: 12 }, // Sex
    { wch: 14 }, // Height
    { wch: 14 }, // Weight
    { wch: 16 }, // Activity Level
    { wch: 22 }, // Food Style
    { wch: 28 }, // Main Performance Goal
    { wch: 24 }, // Energy Objective
    { wch: 20 }, // Daily Budget
    { wch: 25 }, // Target Calories
    { wch: 22 }, // Protein Target
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitor Interactions');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `NourishPro_Visitor_Interactions_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
