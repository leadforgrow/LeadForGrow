'use client';

import { Suspense } from 'react';
import BillsWorkspace from '../components/bills/BillsWorkspace';

export default function BillsPage() {
  return (
    <Suspense fallback={null}>
      <BillsWorkspace />
    </Suspense>
  );
}
