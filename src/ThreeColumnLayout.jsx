
import React from 'react';
import './ThreeColumnLayout.css';

const ThreeColumnLayout = ({ weatherCard, weatherRadar, adCarousel }) => {
  return (
    <div className="three-column-layout">
      {weatherCard}
      {weatherRadar}
      {adCarousel}
    </div>
  );
};

export default ThreeColumnLayout;


