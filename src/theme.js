/**
 * @file theme.js
 * @description Dynamic light/dark theme detector and semantic colour mappings.
 */

import chalk from 'chalk'
import { execSync } from 'child_process'

let activeTheme = 'dark'

export function detectActiveTheme(configTheme) {
  if (configTheme === 'dark' || configTheme === 'light') {
    activeTheme = configTheme;
    return activeTheme;
  }
  
  // Auto detect
  const fgbg = process.env.COLORFGBG || '';
  if (fgbg.includes(';15') || fgbg.includes(';base03')) {
    activeTheme = 'light';
    return activeTheme;
  } else if (fgbg) {
    activeTheme = 'dark';
    return activeTheme;
  }
  
  if (process.platform === 'darwin') {
    try {
      const style = execSync('defaults read -g AppleInterfaceStyle 2>/dev/null', { timeout: 100 }).toString().trim();
      activeTheme = style === 'Dark' ? 'dark' : 'light';
    } catch {
      activeTheme = 'light';
    }
  } else {
    activeTheme = 'dark';
  }
  
  return activeTheme;
}

export function getTheme() {
  return activeTheme;
}

// Semantic colors
export const themeColors = {
  text: (str) => activeTheme === 'light' ? chalk.black(str) : chalk.white(str),
  textBold: (str) => activeTheme === 'light' ? chalk.black.bold(str) : chalk.white.bold(str),
  dim: (str) => activeTheme === 'light' ? chalk.gray(str) : chalk.dim(str),
  dimYellow: (str) => activeTheme === 'light' ? chalk.rgb(180, 150, 0)(str) : chalk.dim.yellow(str),
  bgCursor: (str) => activeTheme === 'light' ? chalk.bgRgb(220, 220, 240).black(str) : chalk.bgRgb(30, 30, 60)(str),
  bgCursorInstall: (str) => activeTheme === 'light' ? chalk.bgRgb(220, 220, 240).black(str) : chalk.bgRgb(24, 44, 62)(str),
  bgCursorSettingsList: (str) => activeTheme === 'light' ? chalk.bgRgb(220, 240, 220).black(str) : chalk.bgRgb(30, 45, 30)(str),
  bgCursorLegacy: (str) => activeTheme === 'light' ? chalk.bgRgb(240, 220, 240).black(str) : chalk.bgRgb(55, 25, 55)(str),
  
  bgModelCursor: (str) => activeTheme === 'light' ? chalk.bgRgb(230, 210, 230).black(str) : chalk.bgRgb(155, 55, 135)(str),
  bgModelRecommended: (str) => activeTheme === 'light' ? chalk.bgRgb(200, 240, 200).black(str) : chalk.bgRgb(15, 40, 15)(str),
  bgModelFavorite: (str) => activeTheme === 'light' ? chalk.bgRgb(250, 230, 190).black(str) : chalk.bgRgb(88, 64, 10)(str),
  
  overlayBgSettings: (str) => activeTheme === 'light' ? chalk.bgRgb(245, 245, 250).black(str) : chalk.bgRgb(0, 0, 0).white(str),
  overlayBgHelp: (str) => activeTheme === 'light' ? chalk.bgRgb(250, 250, 250).black(str) : chalk.bgRgb(0, 0, 0).white(str),
  overlayBgRecommend: (str) => activeTheme === 'light' ? chalk.bgRgb(240, 250, 245).black(str) : chalk.bgRgb(0, 0, 0).white(str),
  overlayBgFeedback: (str) => activeTheme === 'light' ? chalk.bgRgb(255, 245, 245).black(str) : chalk.bgRgb(46, 20, 20).white(str),

  // Header badges text color override
  badgeText: (str) => activeTheme === 'light' ? chalk.rgb(255, 255, 255)(str) : chalk.rgb(0, 0, 0)(str),
}
