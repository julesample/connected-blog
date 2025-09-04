import React from 'react';
import * as Icons from '@heroicons/react/24/outline';

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'h-6 w-6' }) => {
  // Convert kebab-case to PascalCase and add 'Icon'
  const iconName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';

  const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in @heroicons/react/24/outline`);
    return null;
  }

  return <IconComponent className={className} />;
};

export default Icon;
