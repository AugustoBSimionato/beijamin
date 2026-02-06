import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

// Bento Grid with actual drag and drop using react-grid-layout
export default function BentoGrid({
    layout = [],
    children,
    onLayoutChange,
    isEditable = false
}) {
    // Configuration
    const isMobile = containerWidth < 768; // Simple breakpoint
    const cols = isMobile ? 1 : 4;
    const rowHeight = isMobile ? 280 : 160; // Taller rows on mobile for better visibility
    const margin = [16, 16];
    const containerPadding = [0, 0];

    // Track container width for responsive behavior
    const [containerWidth, setContainerWidth] = useState(1200);

    // Reference callback to measure container width
    const containerRef = useCallback((node) => {
        if (node !== null) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    setContainerWidth(entry.contentRect.width);
                }
            });
            resizeObserver.observe(node);
            setContainerWidth(node.offsetWidth);
        }
    }, []);

    // Handle layout changes from drag/resize
    const handleLayoutChange = (newLayout) => {
        if (onLayoutChange && isEditable) {
            onLayoutChange(newLayout);
        }
    };

    // Calculate container height based on layout
    const maxY = layout.reduce((max, item) => {
        // Simple estimation for mobile height/scroll
        const bottom = item.y + item.h;
        return bottom > max ? bottom : max;
    }, 0);
    const containerHeight = maxY * rowHeight + (maxY + 1) * margin[1] + 32;

    // Convert children array to proper format
    const gridChildren = Array.isArray(children) ? children : [children];

    return (
        <div
            ref={containerRef}
            className="w-full max-w-[1200px] mx-auto relative px-4 md:px-0" // Added padding for mobile
            style={{ minHeight: containerHeight }}
        >
            <GridLayout
                className="layout"
                layout={layout}
                cols={cols}
                rowHeight={rowHeight}
                width={containerWidth}
                margin={margin}
                containerPadding={containerPadding}
                onLayoutChange={handleLayoutChange}
                isDraggable={isEditable}
                isResizable={isEditable}
                draggableHandle=".drag-handle"
                useCSSTransforms={true}
                compactType="vertical"
                preventCollision={false}
            >
                {gridChildren.map(child => {
                    if (!child || !child.key) return null;
                    return (
                        <div key={child.key} className="relative">
                            {child}
                            {/* Drag Handle - Only visible in edit mode */}
                            {isEditable && (
                                <div className="drag-handle absolute top-2 right-2 z-20 cursor-move bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg opacity-0 hover:opacity-100 transition-all duration-200 backdrop-blur-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="5" r="1" fill="currentColor" />
                                        <circle cx="15" cy="5" r="1" fill="currentColor" />
                                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                                        <circle cx="15" cy="12" r="1" fill="currentColor" />
                                        <circle cx="9" cy="19" r="1" fill="currentColor" />
                                        <circle cx="15" cy="19" r="1" fill="currentColor" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </GridLayout>

            {/* Edit Mode Indicator */}
            {isEditable && (
                <div className="absolute top-2 right-2 z-10 bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    ✏️ Edit Mode
                </div>
            )}
        </div>
    );
}
