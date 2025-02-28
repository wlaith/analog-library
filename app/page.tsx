"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import p5Types from "p5";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

const numInnerElectrons = 12;
const numOuterElectrons = 20;
const innerRadius = 200;
const outerRadius = 320;

const ElectronOrbit: FC = () => {
  const [clickedImage, setClickedImage] = useState<string | null>(null);
  const imagesRef = useRef<{ inner: p5Types.Image[]; outer: p5Types.Image[] }>({
    inner: [],
    outer: [],
  });

  const maskRef = useRef<p5Types.Graphics | null>(null); // Cache the mask
  const middleImageRef = useRef<p5Types.Image | null>(null);

  const preload = (p5: p5Types) => {
    // Load the middle image
    middleImageRef.current = p5.loadImage("/images/roll.png");

    // Create the mask once and reuse it
    maskRef.current = p5.createGraphics(100, 100);
    maskRef.current.ellipse(50, 50, 100, 100); // Create a circular mask

    // Load inner electron images and apply the cached mask
    for (let i = 0; i < numInnerElectrons; i++) {
      const path = `/images/12-pictures/${i}.jpg`;
      imagesRef.current.inner[i] = p5.loadImage(path);
      imagesRef.current.inner[i].mask(maskRef.current); // Apply the cached mask
    }

    // Load outer electron images and apply the cached mask
    for (let i = 0; i < numOuterElectrons; i++) {
      const path = `/images/20-pictures/${i}.jpg`;
      imagesRef.current.outer[i] = p5.loadImage(path);
      imagesRef.current.outer[i].mask(maskRef.current); // Apply the cached mask
    }
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(
      canvasParentRef
    );
    p5.angleMode(p5.DEGREES);
  };

  const draw = (p5: p5Types) => {
    p5.background(25, 25, 25);
    p5.translate(p5.width / 2, p5.height / 2);

    const circles_space = 300;
    for (let i = 0; i < 7; i++) {
      // Draw a circle
      p5.noFill();
      p5.stroke(45);
      p5.strokeWeight(2);
      p5.ellipse(270, 0, i * circles_space, i * circles_space);
    }

    // Draw the middle image
    if (middleImageRef.current) {
      p5.imageMode(p5.CENTER);
      p5.image(middleImageRef.current, 270, 0, 200, 200);
    }

    // Update positions of inner electrons
    for (let i = 0; i < numInnerElectrons; i++) {
      const angle = p5.frameCount * 0.4 + (i * 360) / numInnerElectrons;
      const x = p5.cos(angle) * innerRadius;
      const y = p5.sin(angle) * innerRadius;

      const imgElement = document.getElementById(`inner-electron-${i}`);
      if (imgElement) {
        imgElement.style.left = `${p5.width / 2 + x + 220}px`;
        imgElement.style.top = `${p5.height / 2 + y - 50}px`;
      }
    }

    // Update positions of outer electrons
    for (let i = 0; i < numOuterElectrons; i++) {
      const angle = p5.frameCount * 0.3 + (i * 360) / numOuterElectrons;
      const x = p5.cos(angle) * outerRadius;
      const y = p5.sin(angle) * outerRadius;

      const imgElement = document.getElementById(`outer-electron-${i}`);
      if (imgElement) {
        imgElement.style.left = `${p5.width / 2 + x + 220}px`;
        imgElement.style.top = `${p5.height / 2 + y - 50}px`;
      }
    }

    // Click detection
    if (p5.mouseIsPressed) {
      const mouseXTranslated = p5.mouseX - p5.width / 2 - 270;
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

  useEffect(() => {
    // Create image elements once and reuse them
    const createImageElements = () => {
      for (let i = 0; i < numInnerElectrons; i++) {
        const imgElement = document.createElement("img");
        imgElement.id = `inner-electron-${i}`;
        imgElement.src = `/images/12-pictures/${i}.jpg`;
        imgElement.style.position = "absolute";
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        imgElement.style.borderRadius = "50%";
        imgElement.style.objectFit = "cover";
        imgElement.style.pointerEvents = "none";
        document.body.appendChild(imgElement);
      }
      for (let i = 0; i < numOuterElectrons; i++) {
        const imgElement = document.createElement("img");
        imgElement.id = `outer-electron-${i}`;
        imgElement.src = `/images/20-pictures/${i}.jpg`;
        imgElement.style.position = "absolute";
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        imgElement.style.borderRadius = "50%";
        imgElement.style.objectFit = "cover";
        imgElement.style.pointerEvents = "none";
        document.body.appendChild(imgElement);
      }
    };

    createImageElements();

    return () => {
      // Cleanup image elements on component unmount
      for (let i = 0; i < numInnerElectrons; i++) {
        const imgElement = document.getElementById(`inner-electron-${i}`);
        if (imgElement) imgElement.remove();
      }
      for (let i = 0; i < numOuterElectrons; i++) {
        const imgElement = document.getElementById(`outer-electron-${i}`);
        if (imgElement) imgElement.remove();
      }
    };
  }, []);

  return (
    <>
      <div className="absolute left-0 p-14 flex flex-col gap-8 top-0 max-h-[90%] w-[40%] text-[#ebebeb]">
        <div className="w-fill max-md:hidden flex gap-2">
          <p className="text-start w-1/2 font-bold text-5xl">ANALOG LIBRARY</p>
          <div className="w-1/2">
            <p className=" text-3xl">SEP-OCT</p>
            <p className=" text-3xl">2024</p>
          </div>
        </div>
        {clickedImage && (
          <div className="p-4 max-md:absolute max-md:w-[80vw] max-w-[30] w-fit h-fit border-white border-[0.2px] rounded-2xl shadow-xl flex flex-col gap-3 bg-[rgba(255,255,255,0.1)] z-50">
            <button
              className="w-2 f-2 p-2 bg-[#ec6a5f] rounded-full"
              onClick={() => setClickedImage(null)}
            ></button>
            <Image
              className="rounded-md max-lg:w-[80vw]"
              src={clickedImage}
              alt="Clicked image"
              width="350"
              height="200"
              objectFit="contain"
            />
          </div>
        )}
      </div>

      <Sketch preload={preload} setup={setup} draw={draw} />
    </>
  );
};

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export default React.memo(ElectronOrbit);
