import {
  faFighterJet,
  faFlask,
  faPhone
} from "@fortawesome/free-solid-svg-icons";
import { any, arrayOf, number, shape, string } from "prop-types";
import React from "react";
import * as Three from "three";

function SatelliteVisualisation(props) {
  const instance = React.useRef({
    containerRef: React.useRef(),
    lastDimensions: {},
    three: {
      satellites: []
    }
  }).current;

  const anglesById = React.useRef({}).current;

  React.useEffect(() => {
    instance.startTime = performance.now();
    setupRenderer();
    setupScene();
    setupCamera();
    instance.animationFrame = requestAnimationFrame(repaint);
    return () => {
      if (instance.animationFrame) {
        cancelAnimationFrame(instance.animationFrame);
      }
    };
  }, []);

  React.useEffect(() => {
    updateSatellites();
  }, [props.satellites, props.selectedSatelliteId]);

  function setupRenderer() {
    instance.three.renderer = new Three.WebGLRenderer({ antialias: true });
    instance.three.renderer.setClearColor("#20212c");
    instance.containerRef.current.appendChild(
      instance.three.renderer.domElement
    );
  }

  function setupScene() {
    instance.three.scene = new Three.Scene();
    createLight();
    createEarth();
    updateSatellites();
    updateScene(0);
  }

  function createLight() {
    const light = new Three.DirectionalLight("white", 1.28);
    light.position.z = 10;
    instance.three.scene.add(light);
  }

  function createEarth() {
    const geometry = new Three.SphereGeometry(1.08, 16, 12);
    const material = new Three.MeshPhongMaterial({
      color: "#cccdda",
      wireframe: true
    });
    instance.three.earth = new Three.Mesh(geometry, material);
    instance.three.scene.add(instance.three.earth);
  }

  function setupCamera() {
    instance.three.camera = new Three.PerspectiveCamera(
      2,
      undefined,
      0.1,
      1000
    );
    instance.three.camera.rotation.z = 0.4101;
    instance.three.camera.position.z = 100;
  }

  function updateSatellites() {
    instance.three.earth.remove(...instance.three.satellites);
    instance.three.satellites = props.satellites.map(satellite => {
      if (!anglesById[satellite.id]) {
        anglesById[satellite.id] = {
          long: Math.random() * 2 * Math.PI,
          lat: Math.random() * 2 * Math.PI
        };
      }
      const group = new Three.Group();
      group.setRotationFromEuler(
        new Three.Euler(
          anglesById[satellite.id].long,
          anglesById[satellite.id].lat,
          (satellite.angle * Math.PI) / 180
        )
      );
      const spriteMaterial = new Three.SpriteMaterial({
        color:
          satellite.id === props.selectedSatelliteId ? "#1e95ff" : "#cccdda",
        map: TEXTURES[satellite.type]
      });
      const sprite = new Three.Sprite(spriteMaterial);
      sprite.scale.setScalar(0.08);
      group.add(sprite);

      const pathCurve = new Three.EllipseCurve(0, 0, 1.32, 1.32);
      const points = pathCurve.getPoints(64);
      const pathGeometry = new Three.BufferGeometry().setFromPoints(points);
      pathGeometry.rotateX(Math.PI / 2);
      const pathMaterial = new Three.LineDashedMaterial({
        color:
          satellite.id === props.selectedSatelliteId ? "#0086ff" : "#42445b",
        dashSize: 0.05,
        gapSize: 0.02
      });
      const path = new Three.Line(pathGeometry, pathMaterial);
      path.computeLineDistances();
      group.add(path);

      const speed = satellite.reverse ? -1 : +1;
      group.userData = { speed, sprite };
      return group;
    });
    if (instance.three.satellites.length > 0) {
      instance.three.earth.add(...instance.three.satellites);
    }
  }

  function repaint() {
    const timePassed = instance.startTime - performance.now();
    instance.animationFrame = requestAnimationFrame(repaint);
    updateDimensions();
    updateScene(timePassed);
    instance.three.renderer.render(instance.three.scene, instance.three.camera);
  }

  function updateDimensions() {
    const {
      clientHeight: height,
      clientWidth: width
    } = instance.containerRef.current.parentNode;
    if (
      height === instance.lastDimensions.height &&
      width === instance.lastDimensions.width
    ) {
      return;
    }
    instance.three.camera.aspect = width / height;
    instance.three.camera.updateProjectionMatrix();
    instance.three.renderer.setSize(width, height, false);
  }

  function updateScene(timePassed) {
    instance.three.earth.rotation.y = timePassed * 2e-4;
    instance.three.satellites.forEach(satellite => {
      satellite.userData.sprite.position.setFromSpherical({
        radius: 1.32,
        theta: satellite.userData.speed * timePassed * 6e-4,
        phi: Math.PI / 2
      });
    });
  }

  return <div ref={instance.containerRef} />;
}

SatelliteVisualisation.propTypes = {
  /**
   * The satellites to be displayed.
   */
  satellites: arrayOf(
    shape({
      angle: number.isRequired,
      id: string.isRequired,
      name: string.isRequired,
      type: any.isRequired
    })
  ).isRequired,
  selectedSatelliteId: string
};

export default SatelliteVisualisation;

const TEXTURES = {
  communication: makeTexture(faPhone),
  military: makeTexture(faFighterJet),
  science: makeTexture(faFlask)
};

function makeTexture(icon) {
  const [width, height, , , path] = icon.icon;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <path d="${path}" fill="white"/>
    </svg>`;
  const image = document.createElement("img");
  image.src = "data:image/svg+xml;utf8," + svg;
  const texture = new Three.Texture(image);
  texture.minFilter = Three.LinearFilter;
  image.addEventListener("load", () => (texture.needsUpdate = true));
  return texture;
}
