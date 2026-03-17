/**
 * @file ui-config.js
 * @description Central configuration for TUI visual styling.
 * 
 * @details
 * This module centralizes all visual styling constants for the TUI interface.
 * By keeping colors, separators, and spacing in one place, it becomes easy to
 * customize the look and feel without modifying rendering logic.
 * 
 * 📖 Configuration:
 * - BORDER_COLOR: Color of column separators (vertical bars)
 * - BORDER_STYLE: Style of separators (dim, bold, etc.)
 * - HORIZONTAL_SEPARATOR: Character used for horizontal lines
 * - HORIZONTAL_STYLE: Style of horizontal lines
 * - COLUMN_SPACING: Space between columns
 * 
 * @see render-table.js - uses these constants for rendering
 * @see tier-colors.js - for tier-specific color definitions
 */

import chalk from 'chalk';

// 📖 Column separator (vertical bar) configuration
export const BORDER_COLOR = chalk.rgb(255, 140, 0); // Gentle dark orange
export const BORDER_STYLE = 'dim'; // Options: 'dim', 'bold', 'underline', 'inverse', etc.
export const VERTICAL_SEPARATOR = BORDER_COLOR[BORDER_STYLE]('│');

// 📖 Horizontal separator configuration
export const HORIZONTAL_SEPARATOR = '─'; // Unicode horizontal line
export const HORIZONTAL_STYLE = 'dim'; // Options: 'dim', 'bold', etc.
export const HORIZONTAL_LINE = chalk[HORIZONTAL_STYLE](HORIZONTAL_SEPARATOR);

// 📖 Column spacing configuration
export const COLUMN_SPACING = ` ${VERTICAL_SEPARATOR} `; // Space around vertical separator

// 📖 Optional: Add more UI styling constants here as needed
export const TABLE_PADDING = 1; // Padding around table edges

// 📖 Export all constants for easy import
export default {
  BORDER_COLOR,
  BORDER_STYLE,
  VERTICAL_SEPARATOR,
  HORIZONTAL_SEPARATOR,
  HORIZONTAL_STYLE,
  HORIZONTAL_LINE,
  COLUMN_SPACING,
  TABLE_PADDING
};