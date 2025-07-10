# 3D Room Generator

## Overview

This project is a web-based 3D room generator built with [Three.js](https://threejs.org/). It allows users to define room dimensions, switch between metric and imperial units, add custom furniture pieces, and export a snapshot of the generated room.

## Features

* **Room Customization**: Specify width, length, and height in meters or feet.
* **Axis Display**: Toggle X, Y, Z axes with unit ticks and labels.
* **Furniture Placement**: Choose from predefined furniture types (chair, table, sofa, desk, bookshelf), adjust dimensions, drag to reposition, and snap to grid or other furniture.
* **Texture Upload**: Apply custom image textures to furniture surfaces.
* **Export**: Save the current scene as a PNG image.
* **Responsive Controls**: Orbit, pan, and zoom interactions via mouse controls.

## Demo

![3D Room Generator Screenshot](./demo/screenshot.png)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/3d-room-generator.git
   cd 3d-room-generator
   ```
2. **Serve files**

   * Option A: Open `index.html` directly in a browser.
   * Option B: Use a simple HTTP server (recommended for texture loading):

     ```bash
     npx http-server .
     ```
3. **Open**
   Visit `http://localhost:8080` (or the port provided) in your browser.

## Usage

1. Adjust **Room Dimensions** and click **Generate Room**.
2. Toggle **Axis** visibility or switch units (meters ↔ feet).
3. Define **Box** or **Furniture** dimensions, select type, and click **Add**.
4. Drag furniture items around the room; enable **Snap** for grid or furniture alignment.
5. Upload a custom texture via the **Upload Texture** button.
6. Click **Export as PNG** to download the room snapshot.

## Project Structure

```
├── index.html               # Main HTML page
├── css/
│   └── styles.css           # Styling for controls and layout
└── js/
    ├── 3Dgeneration.js      # Scene initialization, room creation, animation
    ├── axis.js              # Axis system with ticks, labels, and toggles
    ├── furniture-template.js# Definitions and generators for furniture types
    └── moveable-furniture.js# Drag-and-drop, snapping, and interaction logic
```

## Technologies

* **Three.js** for 3D rendering
* **JavaScript (ES6+)**
* **HTML5 & CSS3**

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add YourFeature"`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

MIT © Your Name
