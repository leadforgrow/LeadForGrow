import {
  Video,
  Headphones,
  Phone,
  Rocket,
  Users,
  UserCheck,
  LifeBuoy,
} from 'lucide-react';

export const MEETING_TYPE_OPTIONS = [
  { id: 'demo_call', label: 'Demo Call', icon: Video, color: 'indigo' },
  { id: 'consultation', label: 'Consultation', icon: Headphones, color: 'cyan' },
  { id: 'sales_call', label: 'Sales Call', icon: Phone, color: 'navy' },
  { id: 'onboarding', label: 'Onboarding', icon: Rocket, color: 'emerald' },
  { id: 'team_meeting', label: 'Team Meeting', icon: Users, color: 'slate' },
  { id: 'interview', label: 'Interview', icon: UserCheck, color: 'violet' },
  { id: 'support_session', label: 'Support Session', icon: LifeBuoy, color: 'amber' },
];

export const WIZARD_STEPS = [
  { id: 1, label: 'Basics' },
  { id: 2, label: 'Availability' },
  { id: 3, label: 'Automation' },
  { id: 4, label: 'Publish' },
];

export const ASSIGNMENT_OPTIONS = [
  {
    id: 'round_robin',
    title: 'Round Robin',
    description: 'Distribute meetings evenly across your sales team.',
  },
  {
    id: 'priority',
    title: 'Priority Reps',
    description: 'Route to senior reps first when available.',
  },
  {
    id: 'lead_score',
    title: 'Lead Score Routing',
    description: 'High-score leads go to top performers automatically.',
  },
  {
    id: 'fixed',
    title: 'Fixed Host',
    description: 'All bookings go to a single host.',
  },
];
