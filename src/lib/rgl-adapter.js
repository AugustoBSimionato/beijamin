const RGL = window.ReactGridLayout;

console.log("RGL Adapter Global:", RGL);

const WidthProvider = RGL?.WidthProvider;
const Responsive = RGL?.Responsive;

const ResponsiveGridLayout = (WidthProvider && Responsive) 
    ? WidthProvider(Responsive) 
    : null;

export { ResponsiveGridLayout };
export default ResponsiveGridLayout;
