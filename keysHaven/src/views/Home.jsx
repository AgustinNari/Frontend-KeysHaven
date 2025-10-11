import React from 'react';
import Hero from '../components/ui/Hero';
import SectionTitle from '../components/ui/SectionTitle';
import PlaceholderGrid from '../components/ui/PlaceholderGrid';

export default function Home() {
  return (
    <div>
      <Hero />

      <SectionTitle>Tendencias</SectionTitle>
      <PlaceholderGrid count={4} />

      <SectionTitle>Top Sellers</SectionTitle>
      <PlaceholderGrid count={4} />

      <SectionTitle>Recomendados</SectionTitle>
      <PlaceholderGrid count={6} />
    </div>
  );
}
