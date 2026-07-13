const fs = require('fs');
const files = ['src/pages/AddProduct.jsx', 'src/pages/EditProduct.jsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-slate-50(?! dark:)/g, 'bg-slate-50 dark:bg-slate-900/50');
  content = content.replace(/bg-slate-100(?! dark:)/g, 'bg-slate-100 dark:bg-slate-800');
  content = content.replace(/border-slate-200(?! dark:)/g, 'border-slate-200 dark:border-slate-700');
  content = content.replace(/text-slate-700(?! dark:)/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-600(?! dark:)/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/text-slate-500(?! dark:)/g, 'text-slate-500 dark:text-slate-400');
  content = content.replace(/placeholder-slate-400(?! dark:)/g, 'placeholder-slate-400 dark:placeholder-slate-500');
  content = content.replace(/focus:bg-white(?! dark:)/g, 'focus:bg-white dark:focus:bg-slate-900');
  
  content = content.replace(/dark:bg-slate-900\/50 dark:bg-slate-900/g, 'dark:bg-slate-900/50');
  content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
  content = content.replace(/dark:text-slate-300 dark:text-slate-300/g, 'dark:text-slate-300');
  content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
  content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
  content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done fixing inputs');
