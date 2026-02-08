import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Bento Grid with responsive capabilities
export default function BentoGrid({
    layouts,
    children,
    onLayoutChange,
    isEditable = false
}) {
    // Default breakpoint configuration
    // lg: Desktop (4 cols)
    // md: Tablet (2 cols)
    // sm: Mobile (1 col)
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg: 8, md: 4, sm: 1, xs: 1, xxs: 1 };

    // Row height logic
    // We can't dynamic switch rowHeight easily in RGL without remounting or complex prop passing, 
    // but RGL's Responsive component accepts `rowHeight` as a number. 
    // Usually standard rowHeight is fine, but we might want taller rows on mobile.
    // However, keeping it consistent prevents jumping. Let's stick to a base 160.
    const rowHeight = 160;

    // Margins
    const margin = [16, 16];

    // Convert children to array
    const gridChildren = Array.isArray(children) ? children : [children];

    // Handle layout changes
    // currentLayout: the layout for the current breakpoint
    // allLayouts: map of all layouts { lg: [...], md: [...] }
    const handleLayoutChange = (currentLayout, allLayouts) => {
        if (onLayoutChange && isEditable) {
            onLayoutChange(currentLayout, allLayouts);
        }
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto relative px-4 md:px-0">
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={breakpoints}
                cols={cols}
                rowHeight={rowHeight}
                margin={margin}
                onLayoutChange={handleLayoutChange}
                isDraggable={isEditable}
                isResizable={isEditable}
                useCSSTransforms={true}
                draggableCancel=".no-drag"
                compactType="vertical"
                preventCollision={false}
            >
                {gridChildren.map(child => {
                    if (!child || !child.key) return null;
                    return (
                        <div key={child.key} className="relative">
                            {child}
                        </div>
                    );
                })}
            </ResponsiveGridLayout>

            {/* Edit Mode Indicator */}
            {isEditable && (
                <div className="absolute top-2 right-2 z-10 bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    ✏️ Edit Mode
                </div>
            )}
        </div>
    );
}
