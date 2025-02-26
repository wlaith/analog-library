"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import p5Types from "p5";

// Load p5 dynamically to avoid SSR issues in Next.js
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

const numInnerElectrons = 12;
const numOuterElectrons = 20;
const innerRadius = 200;
const outerRadius = 400;

const ElectronOrbit: FC = () => {
  const [clickedImage, setClickedImage] = useState<string | null>(null);
  const imagesRef = useRef<{ inner: p5Types.Image[]; outer: p5Types.Image[] }>({
    inner: [],
    outer: [],
  });

  const maskRef = useRef<p5Types.Graphics | null>(null); // Store the mask reference

  const preload = (p5: p5Types) => {
    imagesRef.current.inner = Array.from({ length: numInnerElectrons }, () =>
      p5.loadImage("/Untitled_Artwork_12-01.jpg")
    );

    imagesRef.current.outer = Array.from(
      { length: numOuterElectrons },
      (_, i) => p5.loadImage(`/images/20-pictures/${i}.jpg`)
    );

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
    p5.background(21, 21, 21);
    p5.translate(p5.width / 2, p5.height / 2);

    // Draw nucleus
    p5.fill(0, 191, 255);
    p5.noStroke();
    p5.ellipse(0, 0, 50);

    const { inner, outer } = imagesRef.current;

    // Draw inner orbit electrons
    inner.forEach((img, i) => {
      const angle = p5.frameCount * 0.4 + (i * 360) / numInnerElectrons;
      const x = p5.cos(angle) * innerRadius;
      const y = p5.sin(angle) * innerRadius;
      p5.imageMode(p5.CENTER);
      p5.image(img, x, y, 70, 70);

      // Check for click
      if (
        p5.mouseIsPressed &&
        p5.dist(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2, x, y) < 35
      ) {
        setClickedImage("/Untitled_Artwork_12-01.jpg");
      }
    });

    // Draw outer orbit electrons (pre-masked images)
    outer.forEach((img, i) => {
      const angle = p5.frameCount * 0.3 + (i * 360) / numOuterElectrons;
      const x = p5.cos(angle) * outerRadius;
      const y = p5.sin(angle) * outerRadius;
      p5.imageMode(p5.CENTER);

      // Apply the precomputed mask
      if (maskRef.current) img.mask(maskRef.current);
      p5.image(img, x, y, 100, 100);

      // Check for click
      if (
        p5.mouseIsPressed &&
        p5.dist(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2, x, y) < 50
      ) {
        setClickedImage(`/images/20-pictures/${i}.jpg`);
      }
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const p5Instance = Sketch.p5Instance;
      if (p5Instance) {
        p5Instance.resizeCanvas(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Sketch preload={preload} setup={setup} draw={draw} />
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

export default ElectronOrbit;
