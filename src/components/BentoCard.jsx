import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function BentoCard({ children, className, title, subtitle, icon, ...props }) {
    return (
        <div
            {...props}
            className={cn(
                "bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full",
                className
            )}
        >
            {(title || subtitle || icon) && (
                <div className="p-6 flex items-start justify-between">
                    <div>
                        {icon && <div className="mb-4 text-2xl">{icon}</div>}
                        {title && <h3 className="font-bold text-lg leading-tight">{title}</h3>}
                        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
                    </div>
                </div>
            )}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
