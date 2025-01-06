import React, { useState, useRef, useEffect } from 'react';
import './CNCGCodeSimulator.css';

const CNCGCodeSimulator = () => {
  const [speed, setSpeed] = useState(300);
  const [commands, setCommands] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showSampleSelect, setShowSampleSelect] = useState(false);
  const canvasRef = useRef(null);
  const animationId = useRef(null);

  const samples = {
    star: `
G0 X0 Y50
G1 X19.1 Y15.45
G1 X47.6 Y15.45
G1 X30 Y-9.1
G1 X-30 Y-9.1
G1 X-47.6 Y15.45
G1 X-19.1 Y15.45
G1 X0 Y50
    `,
    square: `
G0 X0 Y0
G1 X50 Y0
G1 X50 Y50
G1 X0 Y50
G1 X0 Y0
    `,
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#555';
    for (let x = 0; x < ctx.canvas.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < ctx.canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  };

  const parseGCode = (gcode) => {
    return gcode.trim().split('\n').map((line) => {
      const parts = line.split(' ');
      const cmd = parts.shift();
      const params = {};
      parts.forEach((part) => {
        const key = part[0];
        const value = parseFloat(part.slice(1));
        params[key] = value;
      });
      return { cmd, params };
    });
  };

  const visualizeGCode = (commands) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    ctx.beginPath();
    ctx.moveTo(250, 250);

    let x = 250,
      y = 250;

    commands.forEach((command, index) => {
      animationId.current = setTimeout(() => {
        const { cmd, params } = command;
        if (cmd === 'G0' || cmd === 'G1') {
          const newX = 250 + (params.X || 0);
          const newY = 250 - (params.Y || 0);
          ctx.lineTo(newX, newY);
          ctx.strokeStyle = 'white';
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(newX, newY, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'red';
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(newX, newY);
        }
      }, index * speed);
    });
  };

  const handleRunCustomGCode = (e) => {
    const gcode = e.target.previousElementSibling.value.trim();
    if (gcode) {
      const parsedCommands = parseGCode(gcode);
      setCommands(parsedCommands);
      visualizeGCode(parsedCommands);
    }
  };

  const handleRunSampleGCode = (e) => {
    const selectedSample = e.target.value;
    const parsedCommands = parseGCode(samples[selectedSample]);
    setCommands(parsedCommands);
    visualizeGCode(parsedCommands);
  };

  const handleResetCanvas = () => {
    clearTimeout(animationId.current);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    drawGrid(canvas.getContext('2d'));
  }, []);

  return (
    <div>
      <h1>CNC 2D G-Code Simulator</h1>
      <div className="card fade-in">
        <button onClick={() => setShowCustomInput(true)}>Enter Custom G-Code</button>
        <button onClick={() => setShowSampleSelect(true)}>Try a Sample</button>

        {showCustomInput && (
          <div>
            <textarea placeholder="Enter your G-Code here..."></textarea>
            <button onClick={handleRunCustomGCode}>Run G-Code</button>
          </div>
        )}

        {showSampleSelect && (
          <select onChange={handleRunSampleGCode}>
            <option value="" disabled selected>
              Select a sample
            </option>
            <option value="star">Draw Star</option>
            <option value="square">Draw Square</option>
          </select>
        )}

        <div className="slider-container">
          <label>Playback Speed:</label>
          <input
            type="range"
            min="100"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
          />
          <span>{speed}ms</span>
        </div>

        <div>
          <button>Download Image</button>
          <button onClick={handleResetCanvas}>Reset Canvas</button>
          <button onClick={handleResetCanvas}>Clear Canvas</button>
        </div>
      </div>

      <div id="canvas-container" className="fade-in">
        <canvas ref={canvasRef} width="500" height="500"></canvas>
      </div>
    </div>
  );
};

export default CNCGCodeSimulator;
