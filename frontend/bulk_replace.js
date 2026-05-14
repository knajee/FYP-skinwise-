const fs = require('fs');
const path = require('path');

const dirPaths = [
  path.join(__dirname, 'src', 'app'),
  path.join(__dirname, 'src', 'components')
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Colors
  content = content.replace(/bg-skin-cream/g, 'bg-bg-base');
  content = content.replace(/bg-skin-surface/g, 'bg-bg-surface');
  content = content.replace(/text-skin-charcoal/g, 'text-text-primary');
  content = content.replace(/text-skin-muted/g, 'text-text-tertiary');
  content = content.replace(/border-skin-border/g, 'border-border-default');
  
  content = content.replace(/bg-skin-warm/g, 'bg-bg-subtle');
  content = content.replace(/hover:bg-skin-warm/g, 'hover:bg-bg-subtle');
  
  content = content.replace(/text-skin-sage/g, 'text-accent');
  content = content.replace(/bg-skin-sage/g, 'bg-accent');
  content = content.replace(/border-skin-sage/g, 'border-accent');
  
  content = content.replace(/text-skin-amber/g, 'text-severity-moderate');
  content = content.replace(/bg-skin-amber/g, 'bg-severity-moderate');
  content = content.replace(/border-skin-amber/g, 'border-severity-moderate');

  content = content.replace(/text-skin-sky/g, 'text-severity-mild');
  content = content.replace(/bg-skin-sky/g, 'bg-severity-mild');
  content = content.replace(/border-skin-sky/g, 'border-severity-mild');

  content = content.replace(/text-skin-rose/g, 'text-severity-severe');
  content = content.replace(/bg-skin-rose/g, 'bg-severity-severe');
  content = content.replace(/border-skin-rose/g, 'border-severity-severe');

  // Generic colors replacements
  content = content.replace(/text-slate-[34]00/g, 'text-text-secondary');
  content = content.replace(/text-slate-[567]00/g, 'text-text-tertiary');
  content = content.replace(/text-zinc-[34]00/g, 'text-text-secondary');
  content = content.replace(/text-zinc-[567]00/g, 'text-text-tertiary');
  content = content.replace(/text-gray-[34]00/g, 'text-text-secondary');
  content = content.replace(/text-gray-[567]00/g, 'text-text-tertiary');
  
  content = content.replace(/text-white/g, 'text-text-primary'); // Will need manual review for Auth pages left panel
  
  // Custom auth page exceptions can be handled manually

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated: ' + filePath);
  }
}

for (const dir of dirPaths) {
  processDirectory(dir);
}
