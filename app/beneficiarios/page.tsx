import { Suspense } from 'react';
import BeneficiariosPageClient from './BeneficiariosPageClient';

function BeneficiariosPageFallback() {
  return <div className="min-h-screen bg-slate-50" />;
}

export default function BeneficiariosPage() {
  return (
    <Suspense fallback={<BeneficiariosPageFallback />}>
      <BeneficiariosPageClient />
    </Suspense>
  );
}
