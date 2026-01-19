// Final fix for all mobile components
const fs = require('fs');

const components = [
  {
    name: 'real-estate-tax',
    title: '🏠 Thuế BDS',
    subtitle: 'Thuế bất động sản 2026'
  },
  {
    name: 'utility-calculator', 
    title: '⚡ Điện nước',
    subtitle: 'Tính hóa đơn điện nước'
  }
];

components.forEach(comp => {
  const htmlFile = `src/app/features/${comp.name}.component.html`;
  
  if (fs.existsSync(htmlFile)) {
    console.log(`Final fixing ${comp.name}...`);
    
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Remove all existing mobile headers and wrappers
    content = content.replace(/<app-mobile-header[\s\S]*?<\/app-mobile-header>/g, '');
    content = content.replace(/<div class="mobile-content">/g, '');
    
    // Remove old headers
    content = content.replace(/<div class="header-section">[\s\S]*?<\/div>/g, '');
    content = content.replace(/<h[12][^>]*>.*?<\/h[12]>/g, '');
    
    // Clean up duplicate content-box-minor
    content = content.replace(/<div class="content-box-minor">\s*<div class="content-box-minor">/g, '<div class="content-box-minor">');
    
    // Add proper mobile structure at the beginning
    content = `<app-mobile-header 
  title="${comp.title}" 
  subtitle="${comp.subtitle}">
</app-mobile-header>

<div class="mobile-content">
  <div class="content-box-minor">
${content.trim()}
  </div>
</div>`;
    
    // Fix div balance
    const openDivs = (content.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    
    if (closeDivs > openDivs) {
      // Remove extra closing divs
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
    
    fs.writeFileSync(htmlFile, content);
    console.log(`${comp.name} fixed!`);
  }
});

console.log('Final fix completed!');