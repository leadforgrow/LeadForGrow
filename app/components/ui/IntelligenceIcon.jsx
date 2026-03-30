'use client';

import { 
  Sparkles, 
  Flame, 
  RefreshCw, 
  PhoneForwarded, 
  Archive, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Eye, 
  Inbox, 
  CheckCircle2, 
  PartyPopper,
  Clock,
  Search,
  Target,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const iconMap = {
  // Action Center Icons
  'phone-forwarded': PhoneForwarded,
  'flame': Flame,
  'zap': Sparkles,
  'intelligence': Sparkles,
  'sparkles': Sparkles,
  'refresh-cw': RefreshCw,
  'archive': Archive,
  'calendar': Calendar,
  'dollar-sign': DollarSign,
  'message-square': MessageSquare,
  'eye': Eye,
  'search': Search,
  'target': Target,
  
  // Status / Journey Icons
  'inbox': Inbox,
  'check-circle': CheckCircle2,
  'party-popper': PartyPopper,
  'clock': Clock,
  'shield-check': ShieldCheck,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle
};

export default function IntelligenceIcon({ name, className = "w-5 h-5", strokeWidth = 2, ...props }) {
  const Icon = iconMap[name] || HelpCircle;
  
  return <Icon className={className} strokeWidth={strokeWidth} {...props} />;
}

import { HelpCircle } from 'lucide-react';
