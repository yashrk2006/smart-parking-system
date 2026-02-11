import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ElementType;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    title = 'No data yet',
    message = 'Nothing to display at the moment.',
    icon: Icon = Inbox,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-tactical-border mb-6">
                <Icon size={48} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-300 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
