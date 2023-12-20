// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const ProfiledContourGeometry = require("./ProfiledContourGeometry");
const random = require("canvas-sketch-util/random");

const settings = {
  duration: 15,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

let colors = ["#165b33", "#166b3a", "#f8b22a", "#ea4530", "#bb2428"];

colors = colors.map((c) => new THREE.Color(c));

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  // const geometry = new THREE.SphereGeometry(1, 32, 16);

  let detail = 100;

  let maxnumber = 150;

  let width = 0.1 * 10;
  let height = 0.1;

  let shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, width);
  shape.lineTo(height, width);
  shape.lineTo(height, 0);
  shape.lineTo(0, 0);

  let contour = [];
  let rings = [];

  for (let i = 0; i < detail; i++) {
    let angle = (2 * Math.PI * i) / detail;
    contour.push(new THREE.Vector2(Math.sin(angle), Math.cos(angle)));
  }

  let CG = new ProfiledContourGeometry(shape, contour, true, true);

  let material = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
  });

  function getMesh(index) {
    let mesh = new THREE.Mesh(CG, material.clone());
    // mesh.position.z = index / 2;
    rings.push(mesh);
    mesh.material.color = random.pick(colors);
    return mesh;
  }

  for (let i = 0; i < maxnumber; i++) {
    let mesh = getMesh(i);
    scene.add(mesh);
  }

  // Setup a material
  // const material = new THREE.MeshBasicMaterial({
  //   color: "red",
  //   wireframe: true,
  // });

  // Setup a mesh with geometry + material
  // const mesh = new THREE.Mesh(CG, material);
  // scene.add(mesh);
  scene.add(new THREE.AmbientLight("#cccccc"));

  let light = new THREE.DirectionalLight("0xffffff", 1);

  light.position.x = 50;
  light.position.y = 50;
  light.position.z = 50;

  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, playhead }) {
      rings.forEach((ring, i) => {
        let progres = (playhead + i / maxnumber) % 1;

        ring.position.z = progres * maxnumber;

        let scale = 1.04 ** (maxnumber - 2 * progres * maxnumber);
        ring.scale.set(scale, scale, scale);
      });

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
