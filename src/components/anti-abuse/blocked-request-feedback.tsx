'use client';

import { ShieldAlert, Bot, Timer } from 'lucide-react';

interface BlockedRequestFeedbackProps {
  /** Reason why the request was blocked */
  reason: 'rate-limit' | 'bot-detected' | 'too-fast' | 'cooldown';
  /** Additional details about the block */
  details?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BlockedRequestFeedback Component
 * Displays visual feedback when a request is blocked by anti-abuse protection
 */
export function BlockedRequestFeedback({
  reason,
  details,
  className = '',
}: BlockedRequestFeedbackProps) {
  const config = {
    'rate-limit': {
      icon: Timer,
      title: 'Rate-Limit aktiv',
      message:
        'Du hast zu viele Anfragen in kurzer Zeit gesendet. Bitte warte einen Moment.',
      color:
        'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400',
    },
    'bot-detected': {
      icon: Bot,
      title: 'Ungewöhnliche Aktivität erkannt',
      message:
        'Deine Anfrage wurde als automatisiert erkannt. Bitte versuche es erneut.',
      color: 'border-destructive/50 bg-destructive/10 text-destructive',
    },
    'too-fast': {
      icon: ShieldAlert,
      title: 'Zu schnelle Eingabe',
      message:
        'Bitte nimm dir einen Moment Zeit, bevor du das Formular absendest.',
      color:
        'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    },
    cooldown: {
      icon: Timer,
      title: 'Cooldown aktiv',
      message:
        'Bitte warte einen kurzen Moment zwischen den Anfragen. Dies schützt unsere Server.',
      color:
        'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    },
  };

  const { icon: Icon, title, message, color } = config[reason];

  return (
    <div
      className={`flex items-start gap-3 rounded-md border p-4 ${color} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm">{message}</p>
        {details && (
          <p className="text-xs mt-2 opacity-75">
            <strong>Details:</strong> {details}
          </p>
        )}
      </div>
    </div>
  );
}

