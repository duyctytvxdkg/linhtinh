// Script để fix tất cả component mobile
const fs = require('fs');

const components = [
  'real-estate-tax',
  'shipping-calculator', 
  'utility-calculator'
];

components.forEach(comp => {
  const htmlFile = `src/app/features/${comp}.component.html`;
  
  if (fs.existsSync(htmlFile)) {
    console.log(`Fixing ${comp}...`);
    
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Remove duplicate content-box-minor and old headers
    content = content.replace(/<div class="content-box-minor">\s*<div class="content-box-minor">/g, '<div class="content-box-minor">');
    content = content.replace(/<h[12][^>]*>.*?<\/h[12]>/g, '');
    
    // Fix any extra closing divs at the end
    const lines = content.split('\n');
    const lastLines = lines.slice(-10);
    const closingDivs = lastLines.filter(line => line.trim() === '</div>').length;
    
    if (closingDivs > 2) {
      // Remove one extra closing div
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '</div>') {
          lines.splice(i, 1);
          break;
        }
      }
      content = lines.join('\n');
    }
    
    fs.writeFileSync(htmlFile, content);
  }
});

console.log('All components fixed!');