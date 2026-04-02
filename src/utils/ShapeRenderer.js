// File: Client/src/utils/ShapeRenderer.js

/**
 * Converts radial profile data into an SVG path and an optimized bounding box.
 * @param {Object} visualProfile - The visual profile object from the database.
 * @returns {Object} { pathData, viewBox }
 */
export const generateSvgPathAndViewBox = (visualProfile) => {
    // Return a safe default if the profile is missing
    if (!visualProfile || !visualProfile.corners) {
        return { pathData: 'M 0 50 A 50 50 0 1 1 0 49.9 Z', viewBox: '-55 -55 110 110' }; // Default circle
    }

    const { corners, radii, angles } = visualProfile;
    let points = [];
    
    // Variables to track the absolute boundaries of the generated shape
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < corners; i++) {
        const r = radii[i];
        // Convert angle from degrees to radians for JS Math functions
        const theta = angles[i] * (Math.PI / 180); 

        // Convert polar coordinates to cartesian coordinates
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        points.push({ x, y });

        // Update bounding box extremes
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    // Assemble the SVG path string (e.g., "M 10 20 L 30 40 L ... Z")
    const pathData = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    // Calculate dynamic dimensions
    const width = maxX - minX;
    const height = maxY - minY;

    // Add a small 10% padding so the shape doesn't touch the absolute edge of its container
    const padding = Math.max(width, height) * 0.1;
    
    // The viewBox tells the SVG engine exactly which part of the canvas to look at, automatically zooming in
    const viewBox = `${minX - padding / 2} ${minY - padding / 2} ${width + padding} ${height + padding}`;

    return { pathData, viewBox };
};