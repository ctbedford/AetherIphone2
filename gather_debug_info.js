// gather_debug_info.js
// Reads and exports the content of key configuration and source files for debugging purposes.

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname); // Assumes this script is run from the project root
const outputFileName = 'debug_context.txt';

const filesToRead = [
  'tamagui.config.ts',
  'babel.config.js',
  'providers/Providers.tsx',
  'app/_layout.tsx',
  'package.json',
  'tsconfig.json'
];

let combinedContent = `========================================\n`;
combinedContent += ` AETHERIPHONE DEBUG CONTEXT DUMP     \n`;
combinedContent += `========================================\n\n`;
combinedContent += `Date: ${new Date().toISOString()}\n\n`;


filesToRead.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  combinedContent += `========================================\n`;
  combinedContent += `FILE: ${filePath}\n`;
  combinedContent += `----------------------------------------\n\n`;
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    combinedContent += content;
    console.log(`Successfully read: ${filePath}`);
  } catch (error) {
    const errorMessage = `Error reading file ${filePath}: ${error.message}`;
    combinedContent += errorMessage;
    console.error(`Error reading file ${filePath}:`, error);
  }
  combinedContent += `\n\n[EOF: ${filePath}]\n\n`;
});

try {
  fs.writeFileSync(path.join(projectRoot, outputFileName), combinedContent);
  console.log(`\nSuccessfully wrote combined content to ${outputFileName}`);
} catch (error) {
  console.error(`\nError writing to output file ${outputFileName}:`, error);
}