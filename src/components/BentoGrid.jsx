import { useMemo } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

console.log("BentoGrid.jsx loading...");
console.log("GridLayout export:", GridLayout);

const WidthProvider = GridLayout?.WidthProvider || GridLayout?.default?.WidthProvider;
const Responsive = GridLayout?.Responsive || GridLayout?.default?.Responsive;

if (!WidthProvider || !Responsive) {
    console.error("React Grid Layout imports failed!", { GridLayout });
}

const ResponsiveGridLayout = WidthProvider ? WidthProvider(Responsive) : null;

export default function BentoGrid({
    layout = [],
    children,
    onLayoutChange,
    isEditable = false
}) {

    // Default breakpoints for Bento-like behavior
    // Bento uses a 4 column grid on desktop, 2 on tablet, 1 on mobile
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 };

    // Calculate row height based on a square ratio roughly
    // Bento cards are often square or multiples. 
    // Let's assume a base unit size.
    const rowHeight = 160;

    const gridProps = useMemo(() => ({
        className: "layout",
        breakpoints,
        cols,
        rowHeight,
        margin: [16, 16],
        containerPadding: [0, 0],
        isDraggable: isEditable,
        isResizable: isEditable,
        onLayoutChange: onLayoutChange
    }), [isEditable, onLayoutChange]);

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            <ResponsiveGridLayout
                layouts={{ lg: layout }}
                {...gridProps}
            >
                {children}
            </ResponsiveGridLayout>
        </div>
    );
}
