import React from "react";
import { useCurrentFrame } from "remotion";
import { shake } from "../lib/effects";

interface ShakeWrapperProps {
  startFrame: number;
  intensity?: number;
  speed?: number;
  decay?: number;
  children: React.ReactNode;
}

export const ShakeWrapper: React.FC<ShakeWrapperProps> = ({
  startFrame,
  intensity = 8,
  speed = 30,
  decay = 0.9,
  children,
}) => {
  const frame = useCurrentFrame();
  const transform = shake(frame, { intensity, speed, decay, startFrame });

  return (
    <div style={{ width: "100%", height: "100%", transform }}>
      {children}
    </div>
  );
};
