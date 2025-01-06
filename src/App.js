import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(300);
  const [commands, setCommands] = useState([]);
  const [gcodeInput, setGcodeInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [animationId, setAnimationId] = useState(null);

  const samples = {
    star: `
G0 X0 Y50
G1 X19.1 Y15.45
G1 X47.6 Y15.45
G1 X30 Y-9.1
G1 X-30 Y-9.1
G1 X-47.6 Y15.45
G1 X-19.1 Y15.45
G1 X0 Y50`,
    square: `
G0 X0 Y0
G1 X50 Y0
G1 X50 Y50
G1 X0 Y50
G1 X0 Y0`
  };

  const parseGCode = (gcode) => {
    return gcode.trim().split('\n').map(line => {
      const parts = line.split(' ');
      const cmd = parts.shift();
      const params = {};
      parts.forEach(part => {
        const key = part[0];
        const value = parseFloat(part.slice(1));
        params[key] = value;
      });
      return { cmd, params };
    });
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

  const visualizeGCode = (commands) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    ctx.beginPath();
    ctx.moveTo(250, 250);

    let x = 250, y = 250;

    commands.forEach((command, index) => {
      const id = setTimeout(() => {
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
          x = newX;
          y = newY;
        }
      }, index * speed);
      setAnimationId(id);
    });
  };

  const handleRun = () => {
    const parsedCommands = parseGCode(gcodeInput);
    setCommands(parsedCommands);
    visualizeGCode(parsedCommands);
  };

  const handleSampleRun = (sample) => {
    const parsedCommands = parseGCode(samples[sample]);
    setCommands(parsedCommands);
    visualizeGCode(parsedCommands);
  };

  const handleReset = () => {
    clearTimeout(animationId);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGrid(ctx);
  };

  const handleClear = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGrid(ctx);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const imageUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'gcode-simulation.png';
    a.click();
  };

  const handleSpeedChange = (e) => {
    setSpeed(e.target.value);
  };

  return (
    <div className="App">
      <h1>CNC 2D G-Code Simulator</h1>
      <div className="card fade-in">
        <button onClick={() => setShowInput(!showInput)}>Enter Custom G-Code</button>
        <button onClick={() => setShowSamples(!showSamples)}>Try a Sample</button>

        {showInput && (
          <div>
            <textarea
              value={gcodeInput}
              onChange={(e) => setGcodeInput(e.target.value)}
              placeholder="Enter your G-Code here..."
            />
            <button onClick={handleRun}>Run G-Code</button>
          </div>
        )}

        {showSamples && (
          <select onChange={(e) => handleSampleRun(e.target.value)}>
            <option value="" disabled selected>Select a sample</option>
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
            onChange={handleSpeedChange}
          />
          <span>{speed}ms</span>
        </div>

        <div>
          <button onClick={handleDownload}>Download Image</button>
          <button onClick={handleReset}>Reset Canvas</button>
          <button onClick={handleClear}>Clear Canvas</button>
        </div>
      </div>

      <div id="canvas-container" className="fade-in">
        <canvas ref={canvasRef} width="500" height="500"></canvas>
      </div>
    </div>
  );
}

export default App;
