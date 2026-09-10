/**
 * Admin Configuration
 * 
 * You can easily update the admin password directly in this file:
 * Simply change the value of ADMIN_PASSWORD below!
 */
export const ADMIN_CONFIG = {
  // >>> ADMIN PASSWORD (EDIT THROUGH CODE HERE) <<<
  ADMIN_PASSWORD: 'admin123',
  ADMIN_USERNAME: 'admin',
  PORTAL_NAME: 'Nourish Pro Admin Center',

  // >>> GOOGLE SHEETS CENTRALIZED CONNECTION CONFIG <<<
  GOOGLE: {
    // Authorized Admin Gmail ID
    GMAIL_ID: 'rudramishra051209@gmail.com',
    // Google OAuth Client ID
    CLIENT_ID: '777077912855-eet04k1i37klakocm9sjtp3sc88kmlp9.apps.googleusercontent.com',
    // Default centralized spreadsheet title
    DEFAULT_SHEET_TITLE: 'Nourish Pro - Centralized Athlete Submissions',
    // Auto-connect enabled
    AUTO_CONNECT: true,
  },
};
