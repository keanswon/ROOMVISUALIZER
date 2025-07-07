// file for the x y and z axis.

// Axis system for 3D room generator
let axisGroup = null;
let axisVisible = true;

// Enhanced constants for better visibility
const AXIS_CONFIG = {
    majorTickLength: 0.1, // Increased from 0.05
    minorTickLength: 0.05, // Increased from 0.025
    axisLineWidth: 0.02, // Much thicker axis lines
    tickLineWidth: 0.01, // Thicker tick marks
    labelOffset: 0.25, // Increased offset for better visibility
    fontSize: 0.2, // Larger font size
    axisLength: 0.3, // Length of axis arrows
    colors: {
        x: 0xff3333, // Brighter red for X axis
        y: 0x33ff33, // Brighter green for Y axis  
        z: 0x3333ff, // Brighter blue for Z axis
        ticks: 0xaaaaaa, // Lighter gray for tick marks
        labels: 0xffffff // White for labels
    }
};

// Convert meters to feet and inches for display
function metersToFeetInches(meters) {
    const totalInches = meters * 39.3701; // 1 meter = 39.3701 inches
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches, totalInches };
}

// Create text sprite for labels
function createTextSprite(text, color = 0xffffff, size = 0.2) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Larger canvas for better quality
    canvas.width = 512;
    canvas.height = 256;
    
    // Option 1: Completely transparent background (remove fillRect entirely)
    // No background fill needed for transparency
    
    // Option 2: Semi-transparent background (uncomment if you want some background)
    // context.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Lower alpha for more transparency
    // context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configure text style with better visibility
    context.font = `bold ${Math.floor(size * 600)}px Arial`;
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add text outline for better visibility
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    
    // Draw the text
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size * 3, size * 1.5, 1); // Larger sprite
    
    return sprite;
}

// Create axis line with ticks and labels
function createAxis(direction, length, color, label) {
    const axisSubGroup = new THREE.Group();
    
    // Main axis line - much thicker cylinder
    const axisGeometry = new THREE.CylinderGeometry(
        AXIS_CONFIG.axisLineWidth/2, 
        AXIS_CONFIG.axisLineWidth/2, 
        length
    );
    const axisMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: false // Make solid for better visibility
    });
    const axisLine = new THREE.Mesh(axisGeometry, axisMaterial);
    
    // Position and rotate axis based on direction
    if (direction === 'x') {
        axisLine.rotation.z = Math.PI / 2;
        axisLine.position.x = length / 2;
    } else if (direction === 'y') {
        axisLine.position.y = length / 2;
    } else if (direction === 'z') {
        axisLine.rotation.x = Math.PI / 2;
        axisLine.position.z = length / 2;
    }
    
    axisSubGroup.add(axisLine);
    
    // Add arrow head for better direction indication
    const arrowGeometry = new THREE.ConeGeometry(AXIS_CONFIG.axisLineWidth, AXIS_CONFIG.axisLength);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: color });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    
    // Position arrow at end of axis
    if (direction === 'x') {
        arrow.rotation.z = -Math.PI / 2;
        arrow.position.x = length + AXIS_CONFIG.axisLength/2;
    } else if (direction === 'y') {
        arrow.position.y = length + AXIS_CONFIG.axisLength/2;
    } else if (direction === 'z') {
        arrow.rotation.x = Math.PI / 2;
        arrow.position.z = length + AXIS_CONFIG.axisLength/2;
    }
    
    axisSubGroup.add(arrow);
    
    // Enhanced tick marks
    const tickMaterial = new THREE.MeshBasicMaterial({ color: AXIS_CONFIG.colors.ticks });
    const totalInches = length * 39.3701;
    
    for (let inch = 0; inch <= totalInches; inch++) {
        const position = (inch / 39.3701);
        const isFoot = inch % 12 === 0;
        const tickLength = isFoot ? AXIS_CONFIG.majorTickLength : AXIS_CONFIG.minorTickLength;
        
        // Thicker tick marks
        const tickGeometry = new THREE.CylinderGeometry(
            AXIS_CONFIG.tickLineWidth/2, 
            AXIS_CONFIG.tickLineWidth/2, 
            tickLength
        );
        const tick = new THREE.Mesh(tickGeometry, tickMaterial);
        
        // Position tick based on axis direction
        if (direction === 'x') {
            tick.position.set(position, 0, 0);
            tick.rotation.z = Math.PI / 2;
        } else if (direction === 'y') {
            tick.position.set(0, position, 0);
        } else if (direction === 'z') {
            tick.position.set(0, 0, position);
            tick.rotation.x = Math.PI / 2;
        }
        
        axisSubGroup.add(tick);
        
        // Enhanced labels for foot marks
        if (isFoot && inch > 0) {
            const feet = inch / 12;
            const labelText = `${feet}'`;
            const labelSprite = createTextSprite(labelText, AXIS_CONFIG.colors.labels, AXIS_CONFIG.fontSize);
            
            // Position label with better offset
            if (direction === 'x') {
                labelSprite.position.set(position, -AXIS_CONFIG.labelOffset, 0);
            } else if (direction === 'y') {
                labelSprite.position.set(-AXIS_CONFIG.labelOffset, position, 0);
            } else if (direction === 'z') {
                labelSprite.position.set(0, -AXIS_CONFIG.labelOffset, position);
            }
            
            axisSubGroup.add(labelSprite);
        }
    }
    
    // Enhanced axis label at the end
    const axisLabel = createTextSprite(label, color, AXIS_CONFIG.fontSize * 1.5);
    if (direction === 'x') {
        axisLabel.position.set(length + AXIS_CONFIG.labelOffset * 1.5, 0, 0);
    } else if (direction === 'y') {
        axisLabel.position.set(0, length + AXIS_CONFIG.labelOffset * 1.5, 0);
    } else if (direction === 'z') {
        axisLabel.position.set(0, 0, length + AXIS_CONFIG.labelOffset * 1.5);
    }
    axisSubGroup.add(axisLabel);
    
    return axisSubGroup;
}

// Create complete axis system
function createAxisSystem() {
    // Check if required variables exist and are properly initialized
    if (typeof scene === 'undefined' || !scene) {
        console.log('Scene not yet initialized');
        return;
    }
    
    if (typeof roomWidth === 'undefined' || typeof roomLength === 'undefined' || typeof roomHeight === 'undefined') {
        console.log('Room dimensions not yet initialized');
        return;
    }
    
    // Remove existing axis group if it exists
    if (axisGroup) {
        scene.remove(axisGroup);
    }
    
    axisGroup = new THREE.Group();
    
    // Create X, Y, Z axes based on room dimensions
    // X-axis: room width (horizontal, left-right)
    // Y-axis: room height (vertical, up-down) 
    // Z-axis: room length (horizontal, front-back)
    const xAxis = createAxis('x', roomWidth, AXIS_CONFIG.colors.x, 'X');
    const yAxis = createAxis('y', roomHeight, AXIS_CONFIG.colors.y, 'Y');
    const zAxis = createAxis('z', roomLength, AXIS_CONFIG.colors.z, 'Z');
    
    axisGroup.add(xAxis);
    axisGroup.add(yAxis);
    axisGroup.add(zAxis);
    
    // Position axis group at room corner (bottom-left-front corner)
    axisGroup.position.set(-roomWidth/2, 0, -roomLength/2);
    
    scene.add(axisGroup);
    
    // Set initial visibility
    axisGroup.visible = axisVisible;
    
    console.log('Axis system created successfully');
}

// Toggle axis visibility
function toggleAxis() {
    axisVisible = !axisVisible;
    if (axisGroup) {
        axisGroup.visible = axisVisible;
    }
    
    // Update button text
    const button = document.getElementById('axisToggle');
    if (button) {
        button.textContent = axisVisible ? 'Hide Axis' : 'Show Axis';
    }
}

// Update axis system when room dimensions change
function updateAxisSystem() {
    if (typeof scene !== 'undefined' && scene) {
        createAxisSystem();
    }
}

// Initialize axis system - called after scene is ready
function initializeAxisSystem() {
    // Wait a bit to ensure all variables are initialized
    setTimeout(() => {
        createAxisSystem();
    }, 100);
}

// Make sure axis system is created when called from other files
if (typeof window !== 'undefined') {
    window.createAxisSystem = createAxisSystem;
    window.toggleAxis = toggleAxis;
    window.updateAxisSystem = updateAxisSystem;
}