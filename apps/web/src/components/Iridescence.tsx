"use client";

import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef } from "react";

import "./Iridescence.css";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fixed?: boolean;
  zIndex?: number;
}

export default function Iridescence({
  color = [1, 1, 1],
  speed = 1.0,
  amplitude = 0.1,
  mouseReact = true,
  className = "",
  style,
  fixed = false,
  zIndex = 0,
  ...rest
}: IridescenceProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallScreen = window.matchMedia("(max-width: 680px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, smallScreen ? 1 : 1.5);
    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, dpr });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program: Program;
    let animateId = 0;
    let lastFrame = 0;

    function resize() {
      const scale = 1;
      const width = fixed ? window.innerWidth : ctn.offsetWidth;
      const height = fixed ? window.innerHeight : ctn.offsetHeight;
      renderer.setSize(width * scale, height * scale);
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    window.addEventListener("resize", resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...color) },
        uResolution: {
          value: new Color(
            fixed ? window.innerWidth : gl.canvas.width,
            fixed ? window.innerHeight : gl.canvas.height,
            fixed ? window.innerWidth / window.innerHeight : gl.canvas.width / gl.canvas.height
          ),
        },
        uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    function update(t: number) {
      animateId = requestAnimationFrame(update);
      if (document.hidden || t - lastFrame < (smallScreen ? 1000 / 24 : 1000 / 30)) return;
      lastFrame = t;
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    ctn.appendChild(gl.canvas);
    gl.canvas.setAttribute("aria-hidden", "true");
    if (reducedMotion) {
      renderer.render({ scene: mesh });
    } else {
      animateId = requestAnimationFrame(update);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = ctn.getBoundingClientRect();
      const x = fixed ? e.clientX / window.innerWidth : (e.clientX - rect.left) / rect.width;
      const y = fixed
        ? 1.0 - e.clientY / window.innerHeight
        : 1.0 - (e.clientY - rect.top) / rect.height;
      mousePos.current = { x, y };
      program.uniforms.uMouse.value[0] = x;
      program.uniforms.uMouse.value[1] = y;
    }
    if (mouseReact) {
      if (fixed) window.addEventListener("mousemove", handleMouseMove);
      else ctn.addEventListener("mousemove", handleMouseMove);
    }
    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animateId);
      else if (!reducedMotion) animateId = requestAnimationFrame(update);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (mouseReact) {
        if (fixed) window.removeEventListener("mousemove", handleMouseMove);
        else ctn.removeEventListener("mousemove", handleMouseMove);
      }
      if (ctn.contains(gl.canvas)) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [color, speed, amplitude, mouseReact, fixed]);

  const containerStyle: React.CSSProperties = {
    ...style,
    ...(fixed
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          zIndex,
          pointerEvents: mouseReact ? "auto" : "none",
        }
      : {}),
  };

  return (
    <div
      ref={ctnDom}
      className={`iridescence-container ${className}`}
      style={containerStyle}
      {...rest}
    />
  );
}
