// File: Client/src/components/Logo.jsx

const Logo = ({ 
    maxWidth = '300px', 
    marginBottom = '15px',
    borderRadius = '16px', // Controls corner rounding
    hasShadow = true       // Toggles the fade-out shadow effect
}) => {
    return (
        <img 
            src="/logo/inkomod512.png" 
            alt="INKoMOD Logo" 
            style={{ 
                maxWidth: maxWidth, 
                height: 'auto', 
                margin: `0 auto ${marginBottom}`, 
                display: 'block',
                borderRadius: borderRadius,
                // Creates a black shadow fading seamlessly into the background
                boxShadow: hasShadow ? '0 0 40px 15px rgba(0, 0, 0, 0.9)' : 'none'
                
                // Note for transparent PNGs:
                // If inkomod512.png has a transparent background, boxShadow will create a square shadow.
                // To make the shadow hug the exact contours of the logo, comment out the boxShadow line 
                // above and uncomment the filter line below.
                // filter: hasShadow ? 'drop-shadow(0px 0px 20px rgba(0, 0, 0, 0.9))' : 'none'
            }} 
        />
    );
};

export default Logo;