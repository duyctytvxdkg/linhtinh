const fs = require('fs');
const path = require('path');

// List of component SCSS files that need the new scroll fix
const componentFiles = [
  'src/app/features/loan.component.scss',
  'src/app/features/lunar-calendar.component.scss', 
  'src/app/features/tide.component.scss',
  'src/app/features/exchange-rate.component.scss',
  'src/app/features/shipping-calculator.component.scss'
];

const newScrollFixCSS = `
// Mobile scroll fix - Pseudo-element approach
.mobile-content::after {
  content: '';
  display: block;
  height: 200px;
  height: max(200px, calc(200px + env(safe-area-inset-bottom)));
  width: 100%;
  background: transparent;
}

.content-box-minor {
  margin-bottom: 40px !important;
}
`;

const oldScrollFixPattern = /\/\/ Mobile scroll fix[\s\S]*?\.content-box-minor\s*\{[\s\S]*?\}/g;

componentFiles.forEach(filePath => {
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Read current content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove old scroll fix if exists
      content = content.replace(oldScrollFixPattern, '');
      
      // Add new scroll fix
      content += newScrollFixCSS;
      
      // Write back to file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated scroll fix in ${filePath}`);
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('🎉 Pseudo-element scroll fix application completed!');