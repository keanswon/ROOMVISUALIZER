// js for the movable box feature

let moveableBoxes = []; // Array to store all boxes
let boxWidth = 1;
let boxHeight = 1;
let boxDepth = 1;
let isDragging = false;
let dragOffset = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedBox = null; // Currently selected box
let snapToGrid = false;
let snapIncrement = 1.0;
let lastBoxAddTime = 0; // For cooldown
let boxColors = [0xff6b6b, 0x4ecdc4, 0xffa500, 0x9b59b6, 0x2ecc71, 0xe74c3c, 0x3498db, 0xf39c12];
let colorIndex = 0;

// Create moveable box
function createMoveableBox(width, height, depth) {
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const color = boxColors[colorIndex % boxColors.length];
    colorIndex++;
    
    const boxMaterial = new THREE.MeshLambertMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
    });
    
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, height/2, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    
    // Store original color for later use
    box.userData.originalColor = color;
    box.userData.selectedColor = color * 0.8; // Darker version when selected
    
    // Add wireframe outline
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    box.add(wireframe);
    
    return box;
} 

// Generate box function
function generateBox() {
    // Check cooldown (1 second)
    const currentTime = Date.now();
    if (currentTime - lastBoxAddTime < 1000) {
        console.log('Please wait before adding another box');
        return;
    }
    
    boxWidth = parseFloat(document.getElementById('boxWidth').value);
    boxHeight = parseFloat(document.getElementById('boxHeight').value);
    boxDepth = parseFloat(document.getElementById('boxDepth').value);
    
    // Create new box
    const newBox = createMoveableBox(boxWidth, boxHeight, boxDepth);
    
    // Position it slightly offset from center to avoid overlap
    const offset = moveableBoxes.length * 0.5;
    newBox.position.set(offset, boxHeight/2, offset);
    
    // Constrain to room boundaries
    const halfBoxWidth = boxWidth / 2;
    const halfBoxDepth = boxDepth / 2;
    newBox.position.x = Math.max(-roomWidth/2 + halfBoxWidth, Math.min(roomWidth/2 - halfBoxWidth, newBox.position.x));
    newBox.position.z = Math.max(-roomLength/2 + halfBoxDepth, Math.min(roomLength/2 - halfBoxDepth, newBox.position.z));
    
    moveableBoxes.push(newBox);
    scene.add(newBox);
    
    lastBoxAddTime = currentTime;
    
    console.log(`Added box ${moveableBoxes.length} with color ${newBox.userData.originalColor.toString(16)}`);
}


// Setup box interaction
function setupBoxInteraction() {
    const canvas = renderer.domElement;
    
    canvas.addEventListener('mousedown', onBoxMouseDown);
    canvas.addEventListener('mousemove', onBoxMouseMove);
    canvas.addEventListener('mouseup', onBoxMouseUp);
}

function onBoxMouseDown(event) {
    if (moveableBoxes.length === 0) return;
    
    // Convert mouse position to normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Check if clicking on any box
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(moveableBoxes);
    
    // First, deselect all boxes
    moveableBoxes.forEach(box => {
        box.material.opacity = 0.8;
        box.material.color.setHex(box.userData.originalColor);
    });
    selectedBox = null;
    
    if (intersects.length > 0) {
        // Select the closest box
        selectedBox = intersects[0].object;
        isDragging = true;
        
        // Visual feedback - make box slightly more opaque and change color
        selectedBox.material.opacity = 0.9;
        selectedBox.material.color.setHex(selectedBox.userData.selectedColor);
        
        // Calculate offset from box center to intersection point
        const intersectionPoint = intersects[0].point;
        dragOffset.subVectors(selectedBox.position, intersectionPoint);
        
        // Prevent event from propagating to camera controls
        event.preventDefault();
        event.stopPropagation();
    }
}

function onBoxMouseMove(event) {
    if (!isDragging || !selectedBox) return;
    
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
        // Apply drag offset
        let newPosition = intersectionPoint.add(dragOffset);

        // Apply snapping if enabled
        newPosition = snapToGridPosition(newPosition);
        newPosition = snapToBoxes(newPosition, selectedBox);
                
        // Get box dimensions (assuming all boxes use the same dimensions for simplicity)
        const halfBoxWidth = boxWidth / 2;
        const halfBoxDepth = boxDepth / 2;
        
        // Constrain to room boundaries
        newPosition.x = Math.max(-roomWidth/2 + halfBoxWidth, Math.min(roomWidth/2 - halfBoxWidth, newPosition.x));
        newPosition.z = Math.max(-roomLength/2 + halfBoxDepth, Math.min(roomLength/2 - halfBoxDepth, newPosition.z));
        newPosition.y = boxHeight / 2; // Keep on floor
        
        selectedBox.position.copy(newPosition);
    }
    
    // Prevent camera controls from activating
    event.preventDefault();
    event.stopPropagation();
}


function onBoxMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        
        // Keep box selected (visual feedback remains) but stop dragging
        if (selectedBox) {
            // Box remains visually selected
        }
        
        event.preventDefault();
        event.stopPropagation();
    }
}

// Function to check if box interaction should block camera controls
function isBoxInteractionActive() {
    return isDragging || selectedBox !== null;
}

// Toggle snap to grid
function toggleSnap() {
    snapToGrid = !snapToGrid;
    const button = document.getElementById('snapToggle');
    if (button) {
        button.textContent = snapToGrid ? 'Disable Snap' : 'Enable Snap';
    }
    
    updateSnapIncrement();
}

// Add this new function to moveable-box.js
function updateSnapIncrement() {
    if (currentUnit == 'meters') {
        snapIncrement = 0.5; // 0.5 meters
    } else {
        snapIncrement = feetToMeters(1.0); // 1 foot converted to meters
    }
}

// Snap position to grid
function snapToGridPosition(position) {
    if (!snapToGrid) return position;
    
    const snapped = position.clone();
    
    // Make sure we have the current snap increment
    if (typeof snapIncrement === 'undefined' || snapIncrement === null) {
        updateSnapIncrement();
    }
    
    // Snap to grid using the current increment
    snapped.x = Math.round(snapped.x / snapIncrement) * snapIncrement;
    snapped.z = Math.round(snapped.z / snapIncrement) * snapIncrement;
    
    return snapped;
}

function snapToBoxes(position, currentBox) {
    if (!snapToGrid) return position;
    
    const snapDistance = 0.1; // 10cm snap distance
    const snapped = position.clone();
    
    for (let box of moveableBoxes) {
        if (box === currentBox) continue;
        
        const boxPos = box.position;
        const boxGeometry = box.geometry;
        const currentGeometry = currentBox.geometry;
        
        // Get box dimensions
        const boxHalfWidth = boxGeometry.parameters.width / 2;
        const boxHalfDepth = boxGeometry.parameters.depth / 2;
        const currentHalfWidth = currentGeometry.parameters.width / 2;
        const currentHalfDepth = currentGeometry.parameters.depth / 2;
        
        // Check X-axis alignment (side-by-side)
        const leftEdge = boxPos.x - boxHalfWidth - currentHalfWidth;
        const rightEdge = boxPos.x + boxHalfWidth + currentHalfWidth;
        
        if (Math.abs(snapped.x - leftEdge) < snapDistance) {
            snapped.x = leftEdge;
        } else if (Math.abs(snapped.x - rightEdge) < snapDistance) {
            snapped.x = rightEdge;
        }
        
        // Check Z-axis alignment (front-to-back)
        const frontEdge = boxPos.z - boxHalfDepth - currentHalfDepth;
        const backEdge = boxPos.z + boxHalfDepth + currentHalfDepth;
        
        if (Math.abs(snapped.z - frontEdge) < snapDistance) {
            snapped.z = frontEdge;
        } else if (Math.abs(snapped.z - backEdge) < snapDistance) {
            snapped.z = backEdge;
        }
        
        // Check for center alignment
        if (Math.abs(snapped.x - boxPos.x) < snapDistance) {
            snapped.x = boxPos.x;
        }
        if (Math.abs(snapped.z - boxPos.z) < snapDistance) {
            snapped.z = boxPos.z;
        }
    }
    
    return snapped;
}

function clearAllBoxes() {
    moveableBoxes.forEach(box => {
        scene.remove(box);
    });
    moveableBoxes = [];
    selectedBox = null;
    isDragging = false;
    colorIndex = 0; // Reset color index
    console.log('All boxes cleared');
}

window.updateSnapIncrement = updateSnapIncrement;