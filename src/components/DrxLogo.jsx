import React from 'react';

/**
 * Component hiển thị Logo DRX (Load trực tiếp từ file ảnh thay vì vẽ SVG)
 */
export const DrxLogo = ({ className = "w-6 h-6", color = "" }) => (
  <img 
    src="/assets/logo-drx-vertical.png" 
    alt="DRX Brand Logo" 
    className={`${className} object-contain`}
  />
);

export default DrxLogo;
