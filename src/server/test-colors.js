import picocolors from 'picocolors';

// Test all available colors
console.log('\n🎨 PICOLORS COLOR DEMO 🎨');
console.log('=========================\n');

// Basic colors
console.log('BASIC COLORS:');
console.log(picocolors.black('  black text'));
console.log(picocolors.red('  red text'));
console.log(picocolors.green('  green text'));
console.log(picocolors.yellow('  yellow text'));
console.log(picocolors.blue('  blue text'));
console.log(picocolors.magenta('  magenta text'));
console.log(picocolors.cyan('  cyan text'));
console.log(picocolors.white('  white text'));
console.log(picocolors.rgb(255, 165, 0)('  orange text'));
console.log(picocolors.gray('  gray text'));

console.log('\nBACKGROUND COLORS:');
console.log(picocolors.bgBlack('  black background'));
console.log(picocolors.bgRed('  red background'));
console.log(picocolors.bgGreen('  green background'));
console.log(picocolors.bgYellow('  yellow background'));
console.log(picocolors.bgBlue('  blue background'));
console.log(picocolors.bgMagenta('  magenta background'));
console.log(picocolors.bgCyan('  cyan background'));
console.log(picocolors.bgWhite('  white background'));

console.log('\nSTYLES:');
console.log(picocolors.bold('  bold text'));
console.log(picocolors.dim('  dim text'));
console.log(picocolors.italic('  italic text'));
console.log(picocolors.underline('  underline text'));
console.log(picocolors.inverse('  inverse text'));
console.log(picocolors.strikethrough('  strikethrough text'));

console.log('\nCOMBINATIONS:');
console.log(picocolors.bold(picocolors.red('  bold red text')));
console.log(picocolors.underline(picocolors.green('  underline green text')));
console.log(picocolors.bgBlue(picocolors.white('  white on blue')));
console.log(picocolors.bold(picocolors.italic(picocolors.cyan('  bold italic cyan'))));

console.log('\nRGB COLORS (if supported):');
// These might not work in all terminals
console.log(picocolors.rgb(255, 0, 0)('  RGB red (255, 0, 0)'));
console.log(picocolors.rgb(0, 255, 0)('  RGB green (0, 255, 0)'));
console.log(picocolors.rgb(0, 0, 255)('  RGB blue (0, 0, 255)'));
console.log(picocolors.rgb(255, 165, 0)('  RGB orange (255, 165, 0)'));

console.log('\nHEX COLORS (if supported):');
console.log(picocolors.hex('#FF0000')('  HEX red #FF0000'));
console.log(picocolors.hex('#00FF00')('  HEX green #00FF00'));
console.log(picocolors.hex('#0000FF')('  HEX blue #0000FF'));
console.log(picocolors.hex('#FFA500')('  HEX orange #FFA500'));
console.log(picocolors.hex('#800080')('  HEX purple #800080'));

console.log('\n🌈 COLOR GRADIENT EXAMPLE:');
const rainbow = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
const text = 'Rainbow text!';
let result = '';
for (let i = 0; i < text.length; i++) {
  const colorIndex = Math.floor((i / text.length) * rainbow.length);
  const color = rainbow[colorIndex];
  result += picocolors[color](text[i]);
}
console.log('  ' + result);
