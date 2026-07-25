'use client';

import { use } from 'react';
import FlowBuilder from '../components/FlowBuilder';

export default function WhatsAppFlowEditorPage({ params }) {
  const { id } = use(params);
  return <FlowBuilder flowId={id} />;
}
