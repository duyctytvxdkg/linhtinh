const fs = require('fs');
const path = require('path');

// List of component SCSS files that need scroll fix
const componentFiles = [
  'src/app/features/loan.component.scss',
  'src/app/features/lunar-calendar.component.scss', 
  'src/app/features/tide.component.scss',
  'src/app/features/exchange-rate.component.scss',
  'src/app/features/shipping-calculator.component.scss'
];

const scrollFixCSS = `
// Mobile scroll fix
.mobile-content {
  padding-bottom: max(120px, calc(120px + env(safe-area-inset-bottom))) !important;
}

.content-box-minor {
  padding-bottom: 60px !important;
}
`;

componentFiles.forEach(filePath => {
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Read current content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if scroll fix already exists
      if (!content.includes('Mobile scroll fix')) {
        // Append scroll fix
        content += scrollFixCSS;
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added scroll fix to ${filePath}`);
      } else {
        console.log(`⏭️ Scroll fix already exists in ${filePath}`);
      }
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('🎉 Scroll fix application completed!');