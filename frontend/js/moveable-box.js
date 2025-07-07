// js for the movable box feature

let moveableBox = null;
let boxWidth = 1;
let boxHeight = 1;
let boxDepth = 1;
let isDragging = false;
let dragOffset = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isBoxSelected = false;

// Create moveable box
function createMoveableBox(width, height, depth) {
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.8
    });
    
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, height/2, 0); // Place on floor
    box.castShadow = true;
    box.receiveShadow = true;
    
    // Add wireframe outline
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    box.add(wireframe);
    
    return box;
}   

// Generate box function
function generateBox() {
    boxWidth = parseFloat(document.getElementById('boxWidth').value);
    boxHeight = parseFloat(document.getElementById('boxHeight').value);
    boxDepth = parseFloat(document.getElementById('boxDepth').value);
    
    // Remove existing box
    if (moveableBox) {
        scene.remove(moveableBox);
    }
    
    // Create new box
    moveableBox = createMoveableBox(boxWidth, boxHeight, boxDepth);
    scene.add(moveableBox);
}

// Setup box interaction
function setupBoxInteraction() {
    const canvas = renderer.domElement;
    
    canvas.addEventListener('mousedown', onBoxMouseDown);
    canvas.addEventListener('mousemove', onBoxMouseMove);
    canvas.addEventListener('mouseup', onBoxMouseUp);
}

function onBoxMouseDown(event) {
    if (!moveableBox) return;
    
    // Convert mouse position to normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Check if clicking on the box
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(moveableBox);
    
    if (intersects.length > 0) {
        // Box is selected - enable dragging and disable camera controls
        isDragging = true;
        isBoxSelected = true;
        
        // Visual feedback - make box slightly more opaque and change color
        moveableBox.material.opacity = 0.9;
        moveableBox.material.color.setHex(0xff4444);
        
        // Calculate offset from box center to intersection point
        const intersectionPoint = intersects[0].point;
        dragOffset.subVectors(moveableBox.position, intersectionPoint);
        
        // Prevent event from propagating to camera controls
        event.preventDefault();
        event.stopPropagation();
    } else {
        // Clicked elsewhere - deselect box and allow camera controls
        isBoxSelected = false;
        if (moveableBox) {
            moveableBox.material.opacity = 0.8;
            moveableBox.material.color.setHex(0xff6b6b);
        }
    }
}

function onBoxMouseMove(event) {
    if (!isDragging || !moveableBox || !isBoxSelected) return;
    
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
        // Apply drag offset and constraints
        const newPosition = intersectionPoint.add(dragOffset);
        
        // Constrain to room boundaries using half dimensions
        const halfBoxWidth = boxWidth / 2;
        const halfBoxDepth = boxDepth / 2;
        newPosition.x = Math.max(-roomWidth/2 + halfBoxWidth, Math.min(roomWidth/2 - halfBoxWidth, newPosition.x));
        newPosition.z = Math.max(-roomLength/2 + halfBoxDepth, Math.min(roomLength/2 - halfBoxDepth, newPosition.z));
        newPosition.y = boxHeight / 2; // Keep on floor
        
        moveableBox.position.copy(newPosition);
    }
    
    // Prevent camera controls from activating
    event.preventDefault();
    event.stopPropagation();
}

function onBoxMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        
        // Keep box selected (visual feedback remains) but stop dragging
        if (moveableBox && isBoxSelected) {
            // You can add additional visual feedback here if needed
        }
        
        event.preventDefault();
        event.stopPropagation();
    }
}

// Function to check if box interaction should block camera controls
function isBoxInteractionActive() {
    return isDragging || isBoxSelected;
}