import { CheckCircle } from 'lucide-react';
import NavigationControls from '../NavigationControls';

interface Step3Props {
    data: any;
    onSubmit: () => void;
    onBack: () => void;
}

export default function Step3_Review({ data, onSubmit, onBack }: Step3Props) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-emerald-400 font-bold mb-1">Ready to Create Zone</h4>
                    <p className="text-emerald-400/70 text-sm">Please review the details below before activating the zone in the system.</p>
                </div>
            </div>

            <div className="bg-tactical-card border border-tactical-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-tactical-border bg-slate-800/50">
                    <h3 className="font-bold text-white">Zone Summary</h3>
                </div>

                <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-6">
                    <DetailRow label="Zone Name" value={data.name} />
                    <DetailRow label="Location" value={data.location_name} />
                    <DetailRow label="Coordinates" value={`${data.location_lat}, ${data.location_lng}`} />

                    <div className="col-span-2 border-t border-tactical-border my-2"></div>

                    <DetailRow label="Total Capacity" value={`${data.max_capacity} Spots`} highlight />
                    <DetailRow label="Reserved" value={`${data.reserved_slots} Spots`} />
                    <DetailRow label="Fine / Hour" value={`₹${data.fine_per_excess}`} />
                    <DetailRow label="Grace Period" value={`${data.grace_threshold} mins`} />
                </div>
            </div>

            <NavigationControls
                onBack={onBack}
                onNext={onSubmit}
                isLastStep={true}
            />
        </div>
    );
}

function DetailRow({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) {
    return (
        <div>
            <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</span>
            <span className={`block font-medium ${highlight ? 'text-xl text-white' : 'text-gray-200'}`}>{value}</span>
        </div>
    );
}
