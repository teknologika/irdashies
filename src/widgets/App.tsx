import { createRoot } from 'react-dom/client';
import { Input } from './Input/Input';
import { useState, useEffect } from 'react';

const bridge = window.irsdkBridge;

bridge.onTelemetry((telemetry: any) => {
  console.log(telemetry);
});

const RandomTraces = () => {
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [clutch, setClutch] = useState(0);
  const [gear, setGear] = useState(2);
  const [speed, setSpeed] = useState(122);

  useEffect(() => {
    const interval = setInterval(() => {
      setThrottle((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05))
      );

      setBrake((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05))
      );

      setClutch((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05))
      );
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, []);
  return <Input brake={brake} throttle={throttle} clutch={clutch} gear={gear} speed={speed} />;
};

const root = createRoot(document.body);
root.render(
  <RandomTraces />
);
