// enhanced-moveable-furniture.js - Enhanced version of your moveable box system

// Enhanced variables (builds on your existing ones)
let moveableFurniture = []; // Replaces moveableBoxes
let currentFurnitureType = 'chair'; // Default furniture type
let currentPhotoTexture = null; // Store uploaded photo texture
let isDragging = false;
let dragOffset = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedFurniture = null;
let snapToGrid = false;
let snapIncrement = 1.0;
let lastFurnitureAddTime = 0;

// Enhanced furniture creation function
function createMoveableFurniture(type, dimensions, photoTexture = null) {
    const furniture = createFurnitureFromTemplate(type, dimensions, photoTexture);
    if (!furniture) return null;
    
    // Apply the same positioning logic as your boxes
    const offset = moveableFurniture.length * 0.5;
    furniture.position.set(offset, dimensions.height/2, offset);
    
    // Constrain to room boundaries using furniture dimensions
    const halfFurnitureWidth = dimensions.width / 2;
    const halfFurnitureDepth = dimensions.depth / 2;
    furniture.position.x = Math.max(-roomWidth/2 + halfFurnitureWidth, 
                                  Math.min(roomWidth/2 - halfFurnitureWidth, furniture.position.x));
    furniture.position.z = Math.max(-roomLength/2 + halfFurnitureDepth, 
                                  Math.min(roomLength/2 - halfFurnitureDepth, furniture.position.z));
    
    return furniture;
}

// Enhanced generate function (replaces your generateBox)
function generateFurniture() {
    // Check cooldown
    const currentTime = Date.now();
    if (currentTime - lastFurnitureAddTime < 1000) {
        console.log('Please wait before adding another furniture piece');
        return;
    }
    
    // Get dimensions from UI (you'll need to add these inputs)
    const width = parseFloat(document.getElementById('furnitureWidth')?.value || 1);
    const height = parseFloat(document.getElementById('furnitureHeight')?.value || 1);
    const depth = parseFloat(document.getElementById('furnitureDepth')?.value || 1);
    
    const dimensions = { width, height, depth };
    
    // Create new furniture
    const newFurniture = createMoveableFurniture(currentFurnitureType, dimensions, currentPhotoTexture);
    if (!newFurniture) return;
    
    moveableFurniture.push(newFurniture);
    scene.add(newFurniture);
    
    lastFurnitureAddTime = currentTime;
    
    console.log(`Added ${currentFurnitureType} ${moveableFurniture.length}`);
}

// Enhanced interaction setup
function setupFurnitureInteraction() {
    const canvas = renderer.domElement;
    
    canvas.addEventListener('mousedown', onFurnitureMouseDown);
    canvas.addEventListener('mousemove', onFurnitureMouseMove);
    canvas.addEventListener('mouseup', onFurnitureMouseUp);
}

function onFurnitureMouseDown(event) {
    if (moveableFurniture.length === 0) return;
    
    // Convert mouse position to normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Check if clicking on any furniture
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(moveableFurniture);
    
    // First, deselect all furniture
    moveableFurniture.forEach(furniture => {
        furniture.material.opacity = 0.8;
        furniture.material.color.setHex(furniture.userData.originalColor);
    });
    selectedFurniture = null;
    
    if (intersects.length > 0) {
        // Select the closest furniture
        selectedFurniture = intersects[0].object;
        isDragging = true;
        
        // Visual feedback
        selectedFurniture.material.opacity = 0.9;
        selectedFurniture.material.color.setHex(selectedFurniture.userData.selectedColor);
        
        // Calculate offset from furniture center to intersection point
        const intersectionPoint = intersects[0].point;
        dragOffset.subVectors(selectedFurniture.position, intersectionPoint);
        
        // Prevent event from propagating to camera controls
        event.preventDefault();
        event.stopPropagation();
    }
}

function onFurnitureMouseMove(event) {
    if (!isDragging || !selectedFurniture) return;
    
    // Convert mouse position to normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Cast ray to the floor (y = 0)
    raycaster.setFromCamera(mouse, camera);
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectionPoint);
    
    if (intersectionPoint) {
        // Apply drag offset
        let newPosition = intersectionPoint.add(dragOffset);

        // Apply snapping if enabled
        newPosition = snapToGridPosition(newPosition);
        newPosition = snapToFurniture(newPosition, selectedFurniture);
        
        // Get furniture dimensions for boundary checking
        const furnitureDimensions = selectedFurniture.userData.dimensions;
        const halfFurnitureWidth = furnitureDimensions.width / 2;
        const halfFurnitureDepth = furnitureDimensions.depth / 2;
        
        // Constrain to room boundaries
        newPosition.x = Math.max(-roomWidth/2 + halfFurnitureWidth, 
                               Math.min(roomWidth/2 - halfFurnitureWidth, newPosition.x));
        newPosition.z = Math.max(-roomLength/2 + halfFurnitureDepth, 
                               Math.min(roomLength/2 - halfFurnitureDepth, newPosition.z));
        newPosition.y = furnitureDimensions.height / 2; // Keep on floor
        
        selectedFurniture.position.copy(newPosition);
    }
    
    // Prevent camera controls from activating
    event.preventDefault();
    event.stopPropagation();
}

function onFurnitureMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        
        // Keep furniture selected but stop dragging
        if (selectedFurniture) {
            // Furniture remains visually selected
        }
        
        event.preventDefault();
        event.stopPropagation();
    }
}

// Enhanced snap to furniture function
function snapToFurniture(position, currentFurniture) {
    if (!snapToGrid) return position;
    
    const snapDistance = 0.1; // 10cm snap distance
    const snapped = position.clone();
    
    for (let furniture of moveableFurniture) {
        if (furniture === currentFurniture) continue;
        
        const furniturePos = furniture.position;
        const furnitureDims = furniture.userData.dimensions;
        const currentDims = currentFurniture.userData.dimensions;
        
        // Get furniture dimensions
        const furnitureHalfWidth = furnitureDims.width / 2;
        const furnitureHalfDepth = furnitureDims.depth / 2;
        const currentHalfWidth = currentDims.width / 2;
        const currentHalfDepth = currentDims.depth / 2;
        
        // Check X-axis alignment (side-by-side)
        const leftEdge = furniturePos.x - furnitureHalfWidth - currentHalfWidth;
        const rightEdge = furniturePos.x + furnitureHalfWidth + currentHalfWidth;
        
        if (Math.abs(snapped.x - leftEdge) < snapDistance) {
            snapped.x = leftEdge;
        } else if (Math.abs(snapped.x - rightEdge) < snapDistance) {
            snapped.x = rightEdge;
        }
        
        // Check Z-axis alignment (front-to-back)
        const frontEdge = furniturePos.z - furnitureHalfDepth - currentHalfDepth;
        const backEdge = furniturePos.z + furnitureHalfDepth + currentHalfDepth;
        
        if (Math.abs(snapped.z - frontEdge) < snapDistance) {
            snapped.z = frontEdge;
        } else if (Math.abs(snapped.z - backEdge) < snapDistance) {
            snapped.z = backEdge;
        }
        
        // Check for center alignment
        if (Math.abs(snapped.x - furniturePos.x) < snapDistance) {
            snapped.x = furniturePos.x;
        }
        if (Math.abs(snapped.z - furniturePos.z) < snapDistance) {
            snapped.z = furniturePos.z;
        }
    }
    
    return snapped;
}

// Set current furniture type
function setFurnitureType(type) {
    if (furnitureTemplates[type]) {
        currentFurnitureType = type;
        
        // Update dimension inputs with defaults
        const defaults = furnitureTemplates[type].defaultDimensions;
        if (document.getElementById('furnitureWidth')) {
            document.getElementById('furnitureWidth').value = defaults.width;
        }
        if (document.getElementById('furnitureHeight')) {
            document.getElementById('furnitureHeight').value = defaults.height;
        }
        if (document.getElementById('furnitureDepth')) {
            document.getElementById('furnitureDepth').value = defaults.depth;
        }
        
        console.log(`Selected furniture type: ${type}`);
    }
}

// Handle photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        createTextureFromPhoto(file).then(texture => {
            currentPhotoTexture = texture;
            console.log('Photo texture loaded successfully');
        }).catch(error => {
            console.error('Error loading photo texture:', error);
        });
    }
}

// Clear current photo
function clearPhoto() {
    currentPhotoTexture = null;
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.value = '';
    }
    console.log('Photo cleared');
}

// Clear all furniture
function clearAllFurniture() {
    moveableFurniture.forEach(furniture => {
        scene.remove(furniture);
    });
    moveableFurniture = [];
    selectedFurniture = null;
    isDragging = false;
    console.log('All furniture cleared');
}

// Check if furniture interaction should block camera controls
function isFurnitureInteractionActive() {
    return isDragging || selectedFurniture !== null;
}

// Utility functions for compatibility with existing code
function snapToGridPosition(position) {
    if (!snapToGrid) return position;
    
    const snapped = position.clone();
    snapped.x = Math.round(snapped.x / snapIncrement) * snapIncrement;
    snapped.z = Math.round(snapped.z / snapIncrement) * snapIncrement;
    
    return snapped;
}

function toggleSnap() {
    snapToGrid = !snapToGrid;
    const button = document.getElementById('snapToggle');
    if (button) {
        button.textContent = snapToGrid ? 'Disable Snap' : 'Enable Snap';
    }
    updateSnapIncrement();
}

function updateSnapIncrement() {
    if (typeof currentUnit !== 'undefined') {
        if (currentUnit == 'meters') {
            snapIncrement = 0.5; // 0.5 meters
        } else {
            snapIncrement = typeof feetToMeters === 'function' ? feetToMeters(1.0) : 0.3048; // 1 foot
        }
    }
}

// Export functions for global use
window.generateFurniture = generateFurniture;
window.setupFurnitureInteraction = setupFurnitureInteraction;
window.setFurnitureType = setFurnitureType;
window.handlePhotoUpload = handlePhotoUpload;
window.clearPhoto = clearPhoto;
window.clearAllFurniture = clearAllFurniture;
window.isFurnitureInteractionActive = isFurnitureInteractionActive;
window.toggleSnap = toggleSnap;
window.updateSnapIncrement = updateSnapIncrement;