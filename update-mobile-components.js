// Script để cập nhật tất cả component cho mobile
const fs = require('fs');
const path = require('path');

const components = [
  {
    name: 'thue-tncn',
    title: '⚖️ Thuế TNCN',
    subtitle: 'Tính thuế thu nhập cá nhân 2026'
  },
  {
    name: 'tide',
    title: '🌊 Thủy triều',
    subtitle: 'Theo dõi thủy triều HCM'
  },
  {
    name: 'exchange-rate',
    title: '💱 Tỷ giá',
    subtitle: 'Tỷ giá ngoại tệ realtime'
  },
  {
    name: 'real-estate-tax',
    title: '🏠 Thuế BDS',
    subtitle: 'Thuế bất động sản 2026'
  },
  {
    name: 'shipping-calculator',
    title: '📦 Phí ship',
    subtitle: 'So sánh giá giao hàng'
  },
  {
    name: 'utility-calculator',
    title: '⚡ Điện nước',
    subtitle: 'Tính hóa đơn điện nước'
  }
];

components.forEach(comp => {
  const tsFile = `src/app/features/${comp.name}.component.ts`;
  const htmlFile = `src/app/features/${comp.name}.component.html`;
  
  console.log(`Updating ${comp.name}...`);
  
  // Update TypeScript file
  if (fs.existsSync(tsFile)) {
    let tsContent = fs.readFileSync(tsFile, 'utf8');
    
    // Add import
    if (!tsContent.includes('MobileHeaderComponent')) {
      tsContent = tsContent.replace(
        /import.*from.*'@angular\/common';/,
        `$&\nimport { MobileHeaderComponent } from '../shared/mobile-header.component';`
      );
      
      // Add to imports array
      tsContent = tsContent.replace(
        /imports:\s*\[([\s\S]*?)\]/,
        (match, imports) => {
          if (!imports.includes('MobileHeaderComponent')) {
            return match.replace(']', ',\n    MobileHeaderComponent\n  ]');
          }
          return match;
        }
      );
      
      fs.writeFileSync(tsFile, tsContent);
    }
  }
  
  // Update HTML file
  if (fs.existsSync(htmlFile)) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Add mobile header if not exists
    if (!htmlContent.includes('app-mobile-header')) {
      // Remove old h1/h2 titles
      htmlContent = htmlContent.replace(/<h[12][^>]*>.*?<\/h[12]>/g, '');
      
      // Add mobile header and wrapper
      htmlContent = `<app-mobile-header 
  title="${comp.title}" 
  subtitle="${comp.subtitle}">
</app-mobile-header>

<div class="mobile-content">
  <div class="content-box-minor">
${htmlContent.trim()}
  </div>
</div>`;
      
      fs.writeFileSync(htmlFile, htmlContent);
    }
  }
});

console.log('All components updated!');