"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import p5Types from "p5";

// Load p5 dynamically to avoid SSR issues in Next.js
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

const numInnerElectrons = 12;
const numOuterElectrons = 20;
const innerRadius = 250;
const outerRadius = 400;

const ElectronOrbit: FC = () => {
  const [clickedImage, setClickedImage] = useState<string | null>(null);
  const imagesRef = useRef<{ inner: p5Types.Image[]; outer: p5Types.Image[] }>({
    inner: [],
    outer: [],
  });

  const maskRef = useRef<p5Types.Graphics | null>(null); // Store the mask reference
  const middleImageRef = useRef<p5Types.Image | null>(null); // Store the middle image reference

  const preload = (p5: p5Types) => {
    // Load the middle image
    middleImageRef.current = p5.loadImage("/images/roll.png");

    // Load inner and outer electron images
    for (let i = 0; i < numInnerElectrons; i++) {
      const path = `/images/12-pictures/${i}.jpg`;
      imagesRef.current.inner[i] = p5.loadImage(path);
      if (maskRef.current) imagesRef.current.inner[i].mask(maskRef.current);
    }
    for (let i = 0; i < numOuterElectrons; i++) {
      const path = `/images/20-pictures/${i}.jpg`;
      imagesRef.current.outer[i] = p5.loadImage(path);
      if (maskRef.current) imagesRef.current.outer[i].mask(maskRef.current);
    }

    // Create a single mask for outer electrons
    maskRef.current = p5.createGraphics(100, 100);
    maskRef.current.ellipse(50, 50, 100, 100);
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(
      canvasParentRef
    );
    p5.angleMode(p5.DEGREES);
  };

  const draw = (p5: p5Types) => {
    p5.background(233, 226, 197);
    p5.translate(p5.width / 2, p5.height / 2);

    // Draw image in the middle
    if (middleImageRef.current) {
      p5.imageMode(p5.CENTER);
      p5.image(middleImageRef.current, 0, 0, 200, 200);
    }

    const { inner, outer } = imagesRef.current;

    // Clear previously appended images
    const existingImages = document.querySelectorAll(".electron-image");
    existingImages.forEach((img) => img.remove());

    // Draw inner orbit electrons
    for (let i = 0; i < numInnerElectrons; i++) {
      const angle = p5.frameCount * 0.4 + (i * 360) / numInnerElectrons;
      const x = p5.cos(angle) * innerRadius;
      const y = p5.sin(angle) * innerRadius;
      p5.imageMode(p5.CENTER);
      p5.noFill();
      p5.noStroke();
      p5.rectMode(p5.CENTER);
      p5.rect(x, y, 100, 100);

      const imgElement = document.createElement("img");
      imgElement.src = `/images/12-pictures/${i}.jpg`;
      imgElement.style.position = "absolute";
      imgElement.style.left = `${p5.width / 2 + x - 50}px`;
      imgElement.style.top = `${p5.height / 2 + y - 50}px`;
      imgElement.style.width = "100px";
      imgElement.style.borderRadius = "50%";
      imgElement.style.height = "100px";
      imgElement.style.pointerEvents = "none"; // Make sure the image doesn't interfere with p5.js mouse events
      imgElement.classList.add("electron-image"); // Add a class for easy selection

      document.body.appendChild(imgElement);
    }

    // Draw outer orbit electrons
    for (let i = 0; i < numOuterElectrons; i++) {
      const angle = p5.frameCount * 0.3 + (i * 360) / numOuterElectrons;
      const x = p5.cos(angle) * outerRadius;
      const y = p5.sin(angle) * outerRadius;
      p5.imageMode(p5.CENTER);
      p5.noFill();
      p5.noStroke();
      p5.rectMode(p5.CENTER);
      p5.rect(x, y, 100, 100);

      const imgElement = document.createElement("img");
      imgElement.src = `/images/20-pictures/${i}.jpg`;
      imgElement.style.position = "absolute";
      imgElement.style.left = `${p5.width / 2 + x - 50}px`;
      imgElement.style.top = `${p5.height / 2 + y - 50}px`;
      imgElement.style.width = "100px";
      imgElement.style.borderRadius = "50%";
      imgElement.style.height = "100px";
      imgElement.style.pointerEvents = "none"; // Make sure the image doesn't interfere with p5.js mouse events
      imgElement.classList.add("electron-image"); // Add a class for easy selection

      document.body.appendChild(imgElement);
    }

    // Click detection
    if (p5.mouseIsPressed) {
      const mouseXTranslated = p5.mouseX - p5.width / 2;
      const mouseYTranslated = p5.mouseY - p5.height / 2;

      // Check inner electrons
      for (let i = 0; i < numInnerElectrons; i++) {
        const angle = p5.frameCount * 0.4 + (i * 360) / numInnerElectrons;
        const x = p5.cos(angle) * innerRadius;
        const y = p5.sin(angle) * innerRadius;
        if (p5.dist(mouseXTranslated, mouseYTranslated, x, y) < 35) {
          setClickedImage(`/images/12-pictures/${i}.jpg`);
          break;
        }
      }

      // Check outer electrons
      for (let i = 0; i < numOuterElectrons; i++) {
        const angle = p5.frameCount * 0.3 + (i * 360) / numOuterElectrons;
        const x = p5.cos(angle) * outerRadius;
        const y = p5.sin(angle) * outerRadius;
        if (p5.dist(mouseXTranslated, mouseYTranslated, x, y) < 50) {
          setClickedImage(`/images/20-pictures/${i}.jpg`);
          break;
        }
      }
    }
  };

  useEffect(() => {
    const debounceResize = debounce(() => {
      const p5Instance = Sketch.p5Instance;
      if (p5Instance) {
        p5Instance.resizeCanvas(window.innerWidth, window.innerHeight);
      }
    }, 100);

    window.addEventListener("resize", debounceResize);
    return () => window.removeEventListener("resize", debounceResize);
  }, []);

  return (
    <>
      <Sketch preload={preload} setup={setup} draw={draw} />
      <p className="absolute left-0 top-1/2 transform -rotate-90 origin-center text-black text-5xl">
        MY ANALOG LIBRARY - 2024
      </p>
      {clickedImage && (
        <div
          className=" w-fit h-[90%] p-5
           border-white border-[0.5px] rounded-lg shadow-xl"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.2)", // 20% opacity
          }}
        >
          <button
            className="absolute top-2 right-2 p-2 bg-white rounded-full"
            onClick={() => setClickedImage(null)}
          ></button>
          <Image
            className="max-w-[100%] max-h-[80%] w-fit"
            src={clickedImage}
            alt="Clicked image"
            width="4000"
            height="900"
            objectFit="contain"
          />
        </div>
      )}
    </>
  );
};

// Debounce utility function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export default React.memo(ElectronOrbit);
