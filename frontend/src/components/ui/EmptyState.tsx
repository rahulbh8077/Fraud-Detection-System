import React, { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div
          className="text-4xl mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 0 20px rgba(124,58,237,0.1)',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-base font-bold mb-2"
        style={{ color: '#cbd5e1' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-sm mb-6" style={{ color: 'rgba(148,163,184,0.65)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
