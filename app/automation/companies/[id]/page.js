'use client';

import { useParams } from 'next/navigation';
import CompanyDetailWorkspace from '../../components/companies/CompanyDetailWorkspace';

export default function CompanyDetailPage() {
  const { id } = useParams();
  return <CompanyDetailWorkspace companyId={id} />;
}
