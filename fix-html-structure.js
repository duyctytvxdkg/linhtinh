// Fix HTML structure for all components
const fs = require('fs');

const components = [
  'thue-tncn',
  'tide', 
  'exchange-rate',
  'real-estate-tax',
  'shipping-calculator',
  'utility-calculator'
];

components.forEach(comp => {
  const htmlFile = `src/app/features/${comp}.component.html`;
  
  if (fs.existsSync(htmlFile)) {
    console.log(`Fixing HTML structure for ${comp}...`);
    
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Count opening and closing divs
    const openDivs = (content.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    
    console.log(`${comp}: ${openDivs} open divs, ${closeDivs} close divs`);
    
    // If we have extra closing divs, remove them from the end
    if (closeDivs > openDivs) {
      const extraDivs = closeDivs - openDivs;
      const lines = content.split('\n');
      
      for (let i = 0; i < extraDivs; i++) {
        for (let j = lines.length - 1; j >= 0; j--) {
          if (lines[j].trim() === '</div>') {
            lines.splice(j, 1);
            break;
          }
        }
      }
      
      content = lines.join('\n');
    }
    
    // If we need more closing divs, add them
    if (openDivs > closeDivs) {
      const neededDivs = openDivs - closeDivs;
      for (let i = 0; i < neededDivs; i++) {
        content += '\n</div>';
      }
    }
    
    fs.writeFileSync(htmlFile, content);
  }
});

console.log('HTML structure fixed!');