const fs = require('fs');
let code = fs.readFileSync('js/storage.js', 'utf8');

// 1. Add _getUserSuffix to Storage object
code = code.replace(/const Storage = \{/, `const Storage = {
  _getUserSuffix() {
    const user = this.getCurrentUser();
    return user && user.taiKhoan ? '_' + user.taiKhoan : '_guest';
  },`);

// 2. Replace getter and setter for Cart, Wishlist, Library, Coupon
const replacements = [
  { key: 'CART', methods: ['getCart', 'saveCart'] },
  { key: 'WISHLIST', methods: ['getWishlist', 'saveWishlist'] },
  { key: 'LIBRARY', methods: ['getLibrary', 'saveLibrary'] },
  { key: 'COUPON', methods: ['getCoupon', 'setCoupon'] }
];

replacements.forEach(rep => {
  // get...
  let getRegex = new RegExp(`getItem\\(STORAGE_KEYS\\.${rep.key}\\)`);
  code = code.replace(getRegex, `getItem(STORAGE_KEYS.${rep.key} + this._getUserSuffix())`);
  
  // set/save...
  let setRegex = new RegExp(`setItem\\(STORAGE_KEYS\\.${rep.key},`);
  code = code.replace(setRegex, `setItem(STORAGE_KEYS.${rep.key} + this._getUserSuffix(),`);

  // remove...
  let removeRegex = new RegExp(`removeItem\\(STORAGE_KEYS\\.${rep.key}\\)`);
  if (code.match(removeRegex)) {
      code = code.replace(removeRegex, `removeItem(STORAGE_KEYS.${rep.key} + this._getUserSuffix())`);
  }
});

// 3. Fix initDefaultStorage to use _khach1 for default Library
code = code.replace(/!localStorage\.getItem\(STORAGE_KEYS\.LIBRARY\)/, `!localStorage.getItem(STORAGE_KEYS.LIBRARY + "_khach1")`);
code = code.replace(/localStorage\.setItem\(STORAGE_KEYS\.LIBRARY, JSON\.stringify\(defaultLibrary\)\);/, `localStorage.setItem(STORAGE_KEYS.LIBRARY + "_khach1", JSON.stringify(defaultLibrary));`);

// Fix initDefaultStorage to use _guest for default Cart and Wishlist so they don't break
code = code.replace(/!localStorage\.getItem\(STORAGE_KEYS\.CART\)/, `!localStorage.getItem(STORAGE_KEYS.CART + "_guest")`);
code = code.replace(/localStorage\.setItem\(STORAGE_KEYS\.CART, JSON\.stringify\(\[\]\)\);/, `localStorage.setItem(STORAGE_KEYS.CART + "_guest", JSON.stringify([]));`);

code = code.replace(/!localStorage\.getItem\(STORAGE_KEYS\.WISHLIST\)/, `!localStorage.getItem(STORAGE_KEYS.WISHLIST + "_guest")`);
code = code.replace(/localStorage\.setItem\(STORAGE_KEYS\.WISHLIST, JSON\.stringify\(\["GAME_001", "GAME_007"\]\)\);/, `localStorage.setItem(STORAGE_KEYS.WISHLIST + "_guest", JSON.stringify(["GAME_001", "GAME_007"]));`);

fs.writeFileSync('js/storage.js', code, 'utf8');
console.log('Successfully updated js/storage.js to scope data per user.');
