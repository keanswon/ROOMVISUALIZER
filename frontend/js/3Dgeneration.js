let scene, camera, renderer, controls, room;
let roomWidth = 5, roomLength = 6, roomHeight = 3;

// Initialize the 3D scene
function init() {
    const canvas = document.getElementById('renderCanvas');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(8, 6, 8);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        preserveDrawingBuffer: true 
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(0, roomHeight - 0.5, 0);
    scene.add(pointLight);

    // Simple orbit controls implementation
    setupControls();

    // Generate initial room
    generateRoom();
    setupBoxInteraction();
    animate();
}

function setupControls() {
    let mouseDown = false;
    let mouseButton = 0;
    let mouseX = 0;
    let mouseY = 0;
    const rotateSpeed = 0.005;
    const panSpeed = 0.01;

    const canvas = renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
        // Check if box interaction is active - if so, don't activate camera controls
        if (typeof isBoxInteractionActive === 'function' && isBoxInteractionActive()) {
            return;
        }
        
        mouseDown = true;
        mouseButton = e.button;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        // Check if box interaction is active - if so, don't move camera
        if (typeof isBoxInteractionActive === 'function' && isBoxInteractionActive()) {
            return;
        }
        
        if (!mouseDown) return;

        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;

        if (mouseButton === 0) { // Left click - rotate
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            spherical.theta -= deltaX * rotateSpeed;
            spherical.phi += deltaY * rotateSpeed;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, roomHeight/2, 0);
        } else if (mouseButton === 2) { // Right click - pan
            const right = new THREE.Vector3();
            const up = new THREE.Vector3(0, 1, 0);
            right.crossVectors(camera.getWorldDirection(new THREE.Vector3()), up);
            
            camera.position.add(right.multiplyScalar(-deltaX * panSpeed));
            camera.position.add(up.multiplyScalar(deltaY * panSpeed));
        }

        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevent page scrolling
        
        // Check if box interaction is active - if so, don't zoom
        if (typeof isBoxInteractionActive === 'function' && isBoxInteractionActive()) {
            return;
        }
        
        const zoomSpeed = 0.1;
        const direction = camera.position.clone().normalize();
        if (e.deltaY > 0) {
            camera.position.add(direction.multiplyScalar(zoomSpeed));
        } else {
            camera.position.sub(direction.multiplyScalar(zoomSpeed));
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

function createRoom(width, length, height) {
    const roomGroup = new THREE.Group();

    // Materials
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        transparent: true,
        opacity: 0.9
    });
    
    const wallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xE6E6FA,
        transparent: true,
        opacity: 0.8
    });

    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xF0F8FF,
        transparent: true,
        opacity: 0.7
    });

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(width, length);
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    roomGroup.add(ceiling);

    // Walls
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, height/2, -length/2);
    roomGroup.add(backWall);

    // Front wall (transparent)
    const frontWallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xE6E6FA,
        transparent: true,
        opacity: 0.3
    });
    const frontWall = new THREE.Mesh(backWallGeometry, frontWallMaterial);
    frontWall.position.set(0, height/2, length/2);
    roomGroup.add(frontWall);

    // Left wall
    const sideWallGeometry = new THREE.PlaneGeometry(length, height);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width/2, height/2, 0);
    roomGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(width/2, height/2, 0);
    roomGroup.add(rightWall);

    // Add wireframe outline
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, length));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    wireframe.position.y = height / 2;
    roomGroup.add(wireframe);

    return roomGroup;
}

function generateRoom() {
    // Get input values
    roomWidth = parseFloat(document.getElementById('roomWidth').value);
    roomLength = parseFloat(document.getElementById('roomLength').value);
    roomHeight = parseFloat(document.getElementById('roomHeight').value);

    // Remove existing room
    if (room) {
        scene.remove(room);
    }

    // Create new room
    room = createRoom(roomWidth, roomLength, roomHeight);
    scene.add(room);

    // Update camera position for better view
    const maxDimension = Math.max(roomWidth, roomLength, roomHeight);
    const distance = maxDimension * 1.5;
    camera.position.set(distance, distance * 0.8, distance);
    camera.lookAt(0, roomHeight/2, 0);

    // Update dimensions display
    document.getElementById('dimensionsDisplay').textContent = 
        `Room: ${roomWidth.toFixed(1)}m × ${roomLength.toFixed(1)}m × ${roomHeight.toFixed(1)}m`;

    // Check if moveable box is outside new room bounds
    if (moveableBox) {
        const halfBoxWidth = boxWidth / 2;
        const halfBoxDepth = boxDepth / 2;
        const pos = moveableBox.position;
        if (pos.x < -roomWidth/2 + halfBoxWidth || pos.x > roomWidth/2 - halfBoxWidth ||
            pos.z < -roomLength/2 + halfBoxDepth || pos.z > roomLength/2 - halfBoxDepth) {
            scene.remove(moveableBox);
            moveableBox = null;
        }
    }
}

function exportImage() {
    // Render the scene
    renderer.render(scene, camera);
    
    // Create download link
    const canvas = renderer.domElement;
    const link = document.createElement('a');
    link.download = `room_${roomWidth}x${roomLength}x${roomHeight}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function handleResize() {
    const canvas = document.getElementById('renderCanvas');
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// Event listeners
window.addEventListener('resize', handleResize);

// Initialize when page loads
window.addEventListener('load', init);