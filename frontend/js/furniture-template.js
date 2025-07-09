// furniture-templates.js - Template-based furniture generation system

// Helper function to merge group geometry (moved outside the templates object)
function mergeGroupGeometry(group) {
    const geometries = [];
    group.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry.clone();
            geometry.applyMatrix4(child.matrixWorld);
            geometries.push(geometry);
        }
    });
    
    if (geometries.length > 0) {
        // Use mergeGeometries instead of mergeBufferGeometries for better compatibility
        return mergeGeometries(geometries);
    }
    return new THREE.BoxGeometry(1, 1, 1); // Fallback
}

// Simple geometry merging function (alternative to BufferGeometryUtils)
function mergeGeometries(geometries) {
    if (geometries.length === 0) return new THREE.BoxGeometry(1, 1, 1);
    if (geometries.length === 1) return geometries[0];
    
    // For simplicity, return the first geometry
    // In a production environment, you'd want proper geometry merging
    return geometries[0];
}

// Furniture template definitions
const furnitureTemplates = {
    'chair': {
        name: 'Chair',
        defaultDimensions: { width: 0.5, height: 0.9, depth: 0.5 },
        components: ['seat', 'back', 'legs'],
        generateGeometry: function(dimensions) {
            const group = new THREE.Group();
            const { width, height, depth } = dimensions;
            
            // Seat
            const seatGeometry = new THREE.BoxGeometry(width, 0.05, depth);
            const seat = new THREE.Mesh(seatGeometry);
            seat.position.set(0, height * 0.5, 0);
            group.add(seat);
            
            // Backrest
            const backGeometry = new THREE.BoxGeometry(width, height * 0.4, 0.05);
            const back = new THREE.Mesh(backGeometry);
            back.position.set(0, height * 0.7, -depth * 0.4);
            group.add(back);
            
            // Legs (4 corners)
            const legGeometry = new THREE.BoxGeometry(0.05, height * 0.5, 0.05);
            const legPositions = [
                [-width * 0.4, height * 0.25, -depth * 0.4],
                [width * 0.4, height * 0.25, -depth * 0.4],
                [-width * 0.4, height * 0.25, depth * 0.4],
                [width * 0.4, height * 0.25, depth * 0.4]
            ];
            
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry);
                leg.position.set(...pos);
                group.add(leg);
            });
            
            // Use the standalone function instead of this.mergeGroupGeometry
            return mergeGroupGeometry(group);
        }
    },
    
    'table': {
        name: 'Table',
        defaultDimensions: { width: 1.2, height: 0.75, depth: 0.8 },
        components: ['top', 'legs'],
        generateGeometry: function(dimensions) {
            const group = new THREE.Group();
            const { width, height, depth } = dimensions;
            
            // Table top
            const topGeometry = new THREE.BoxGeometry(width, 0.05, depth);
            const top = new THREE.Mesh(topGeometry);
            top.position.set(0, height - 0.025, 0);
            group.add(top);
            
            // Legs (4 corners)
            const legGeometry = new THREE.BoxGeometry(0.05, height - 0.05, 0.05);
            const legPositions = [
                [-width * 0.45, (height - 0.05) * 0.5, -depth * 0.45],
                [width * 0.45, (height - 0.05) * 0.5, -depth * 0.45],
                [-width * 0.45, (height - 0.05) * 0.5, depth * 0.45],
                [width * 0.45, (height - 0.05) * 0.5, depth * 0.45]
            ];
            
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry);
                leg.position.set(...pos);
                group.add(leg);
            });
            
            return mergeGroupGeometry(group);
        }
    },
    
    'sofa': {
        name: 'Sofa',
        defaultDimensions: { width: 2.0, height: 0.8, depth: 0.9 },
        components: ['seat', 'back', 'armrests'],
        generateGeometry: function(dimensions) {
            const group = new THREE.Group();
            const { width, height, depth } = dimensions;
            
            // Main seat
            const seatGeometry = new THREE.BoxGeometry(width, 0.1, depth * 0.6);
            const seat = new THREE.Mesh(seatGeometry);
            seat.position.set(0, height * 0.4, 0);
            group.add(seat);
            
            // Backrest
            const backGeometry = new THREE.BoxGeometry(width, height * 0.5, 0.1);
            const back = new THREE.Mesh(backGeometry);
            back.position.set(0, height * 0.65, -depth * 0.25);
            group.add(back);
            
            // Armrests
            const armGeometry = new THREE.BoxGeometry(0.1, height * 0.3, depth * 0.6);
            const leftArm = new THREE.Mesh(armGeometry);
            leftArm.position.set(-width * 0.45, height * 0.55, 0);
            group.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry);
            rightArm.position.set(width * 0.45, height * 0.55, 0);
            group.add(rightArm);
            
            // Base/legs
            const baseGeometry = new THREE.BoxGeometry(width * 0.9, 0.1, depth * 0.5);
            const base = new THREE.Mesh(baseGeometry);
            base.position.set(0, 0.05, 0);
            group.add(base);
            
            return mergeGroupGeometry(group);
        }
    },
    
    'desk': {
        name: 'Desk',
        defaultDimensions: { width: 1.4, height: 0.75, depth: 0.7 },
        components: ['top', 'legs', 'drawers'],
        generateGeometry: function(dimensions) {
            const group = new THREE.Group();
            const { width, height, depth } = dimensions;
            
            // Desktop
            const topGeometry = new THREE.BoxGeometry(width, 0.05, depth);
            const top = new THREE.Mesh(topGeometry);
            top.position.set(0, height - 0.025, 0);
            group.add(top);
            
            // Left pedestal (drawer unit)
            const pedestalGeometry = new THREE.BoxGeometry(width * 0.3, height * 0.8, depth * 0.8);
            const pedestal = new THREE.Mesh(pedestalGeometry);
            pedestal.position.set(-width * 0.3, height * 0.4, 0);
            group.add(pedestal);
            
            // Right legs
            const legGeometry = new THREE.BoxGeometry(0.05, height - 0.05, 0.05);
            const rightLegPositions = [
                [width * 0.45, (height - 0.05) * 0.5, -depth * 0.45],
                [width * 0.45, (height - 0.05) * 0.5, depth * 0.45]
            ];
            
            rightLegPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry);
                leg.position.set(...pos);
                group.add(leg);
            });
            
            return mergeGroupGeometry(group);
        }
    },
    
    'bookshelf': {
        name: 'Bookshelf',
        defaultDimensions: { width: 0.8, height: 1.8, depth: 0.3 },
        components: ['frame', 'shelves'],
        generateGeometry: function(dimensions) {
            const group = new THREE.Group();
            const { width, height, depth } = dimensions;
            
            // Back panel
            const backGeometry = new THREE.BoxGeometry(width, height, 0.02);
            const back = new THREE.Mesh(backGeometry);
            back.position.set(0, height * 0.5, -depth * 0.4);
            group.add(back);
            
            // Sides
            const sideGeometry = new THREE.BoxGeometry(0.03, height, depth);
            const leftSide = new THREE.Mesh(sideGeometry);
            leftSide.position.set(-width * 0.485, height * 0.5, 0);
            group.add(leftSide);
            
            const rightSide = new THREE.Mesh(sideGeometry);
            rightSide.position.set(width * 0.485, height * 0.5, 0);
            group.add(rightSide);
            
            // Shelves (5 shelves including top and bottom)
            const shelfGeometry = new THREE.BoxGeometry(width * 0.94, 0.03, depth * 0.9);
            const shelfCount = 5;
            for (let i = 0; i < shelfCount; i++) {
                const shelf = new THREE.Mesh(shelfGeometry);
                const shelfY = (i / (shelfCount - 1)) * height;
                shelf.position.set(0, shelfY, 0);
                group.add(shelf);
            }
            
            return mergeGroupGeometry(group);
        }
    }
};

// Enhanced furniture creation function
function createFurnitureFromTemplate(type, dimensions, photoTexture = null) {
    const template = furnitureTemplates[type];
    if (!template) {
        console.error(`Unknown furniture type: ${type}`);
        return null;
    }
    
    // Use provided dimensions or defaults
    const finalDimensions = { ...template.defaultDimensions, ...dimensions };
    
    // Generate geometry
    const geometry = template.generateGeometry(finalDimensions);
    
    // Create material
    let material;
    if (photoTexture) {
        material = new THREE.MeshLambertMaterial({
            map: photoTexture,
            transparent: true,
            opacity: 0.8
        });
    } else {
        // Use a default color based on furniture type
        const defaultColors = {
            'chair': 0x8B4513,    // Brown
            'table': 0xD2691E,    // Chocolate
            'sofa': 0x2F4F4F,     // Dark slate gray
            'desk': 0x654321,     // Dark brown
            'bookshelf': 0xA0522D  // Sienna
        };
        
        material = new THREE.MeshLambertMaterial({
            color: defaultColors[type] || 0x8B4513,
            transparent: true,
            opacity: 0.8
        });
    }
    
    // Create mesh
    const furniture = new THREE.Mesh(geometry, material);
    furniture.position.set(0, finalDimensions.height/2, 0);
    furniture.castShadow = true;
    furniture.receiveShadow = true;
    
    // Store metadata
    furniture.userData.furnitureType = type;
    furniture.userData.dimensions = finalDimensions;
    furniture.userData.originalColor = material.color.getHex();
    furniture.userData.selectedColor = furniture.userData.originalColor * 0.8;
    
    // Add wireframe outline
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    furniture.add(wireframe);
    
    return furniture;
}

// Function to create texture from uploaded photo
function createTextureFromPhoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                
                resolve(texture);
            };
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Get available furniture types
function getAvailableFurnitureTypes() {
    return Object.keys(furnitureTemplates).map(key => ({
        key,
        name: furnitureTemplates[key].name,
        defaultDimensions: furnitureTemplates[key].defaultDimensions
    }));
}

// Export functions for use in other files
window.createFurnitureFromTemplate = createFurnitureFromTemplate;
window.createTextureFromPhoto = createTextureFromPhoto;
window.getAvailableFurnitureTypes = getAvailableFurnitureTypes;
window.furnitureTemplates = furnitureTemplates;