# Electron Orbit Visualization

This project is an idea of how we can share developed analog pictures of film rolls. It is a React-based visualization of pictures orbiting a central point, inspired by atomic structures. It uses the `p5.js` library for rendering the animation and managing interactions. The electrons are represented as circular images that orbit around a central image, and users can click on individual electrons to view a larger version of the image.

## Features

- **Dynamic Electron Orbits**:
  - Inner and outer electron orbits with customizable radii and number of electrons.
  - Smooth animation of electrons orbiting the nucleus.
- **Interactive Click Detection**:

  - Click on an electron to display a larger version of the image.
  - Close the enlarged image with a button.

- **Responsive Design**:

  - The canvas resizes dynamically with the window size.
  - Optimized for both desktop and mobile views.

- **Image Masking**:

  - Electron images are masked into circular shapes using `p5.Graphics`.

- **Performance Optimization**:
  - Debounced window resize event for smoother performance.
  - Image elements are created and reused efficiently.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wlaith/analog-library.git
   cd electron-orbit-visualization
   ```
