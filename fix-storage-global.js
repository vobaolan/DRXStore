const fs = require('fs');
let code = fs.readFileSync('js/storage.js', 'utf8');

// 2. Replace getter and setter for Cart, Wishlist, Library, Coupon globally
const replacements = [
  { key: 'CART' },
  { key: 'WISHLIST' },
  { key: 'LIBRARY' },
  { key: 'COUPON' }
];

replacements.forEach(rep => {
  // get...
  let getRegex = new RegExp(`getItem\\(STORAGE_KEYS\\.${rep.key}\\)`, 'g');
  code = code.replace(getRegex, `getItem(STORAGE_KEYS.${rep.key} + this._getUserSuffix())`);
  
  // set/save...
  let setRegex = new RegExp(`setItem\\(STORAGE_KEYS\\.${rep.key},`, 'g');
  code = code.replace(setRegex, `setItem(STORAGE_KEYS.${rep.key} + this._getUserSuffix(),`);

  // remove...
  let removeRegex = new RegExp(`removeItem\\(STORAGE_KEYS\\.${rep.key}\\)`, 'g');
  code = code.replace(removeRegex, `removeItem(STORAGE_KEYS.${rep.key} + this._getUserSuffix())`);
});

fs.writeFileSync('js/storage.js', code, 'utf8');
console.log('Successfully updated js/storage.js globally.');
