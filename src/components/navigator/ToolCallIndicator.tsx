'use client'

import { CheckIcon, SearchIcon } from '@/components/ui/SVGIcons'

interface ToolCallIndicatorProps {
  name: string
  status: 'running' | 'complete' | 'error'
}

const toolLabels: Record<string, string> = {
  get_user_profile: 'Reading your profile',
  save_to_profile: 'Saving to your account',
}

export default function ToolCallIndicator({ name, status }: ToolCallIndicatorProps) {
  const label = toolLabels[name] || name

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'running' ? (
        <div className="w-4 h-4 rounded-full animate-shimmer" />
      ) : (
        <CheckIcon size={14} className="text-green-500" />
      )}
      <span className={status === 'running' ? 'text-navy/40' : 'text-navy/50'}>
        {label}
        {status === 'running' ? '...' : ''}
      </span>
    </div>
  )
}
