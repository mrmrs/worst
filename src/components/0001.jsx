import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const GameArea = ({ onGameOver }) => {
  const [blocks, setBlocks] = useState([]);
  const [baseColor, setBaseColor] = useState('black');
  const [score, setScore] = useState(0);
  const [missedBlocks, setMissedBlocks] = useState(0);
  const [flash, setFlash] = useState('');
  const [blockSpeed, setBlockSpeed] = useState(.25);
  const [spawnInterval, setSpawnInterval] = useState(4000);

  const colorList = [
    'black', 
    'gray', 
    'silver', 
    'darkgray', 
    'slate', 
    'orange', 
  ];

  const colors = [
    'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black',
    'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 
    'silver', 'silver', 'silver', 'silver', 'silver', 'silver', 
    'darkgray', 'darkgray', 'darkgray', 'darkgray', 
    'slate', 'slate',
    'orange'
  ];
  const colorPoints = { black: 1, gray: 2, silver: 3, darkgray: 5, slate: 8, orange: 13 };
  const gameWidth = window.innerWidth;
  const gameHeight = window.innerHeight;
  const baseHeight = 64;
  const blockHeight = gameHeight / 32;
  const blockWidth = gameHeight / 16;
  const missLimit = 10;

  const accelerateNearestBlock = () => {
  const nearestBlock = blocks.reduce((nearest, block) => {
    if (!nearest || (block.y > nearest.y && block.y < gameHeight - baseHeight - blockHeight)) {
      return block;
    }
    return nearest;
  }, null);

  if (nearestBlock) {
    setBlocks(blocks => blocks.map(block => {
      if (block.id === nearestBlock.id) {
        return { ...block, y: gameHeight - baseHeight - blockHeight };
      }
      return block;
    }));
  }
};


  useEffect(() => {
    const interval = setInterval(() => {
      if (missedBlocks < missLimit) {
        const newBlock = {
          x: Math.random() * (gameWidth - blockWidth),
          y: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          id: Math.random()
        };
        setBlocks(prev => [...prev, newBlock]);
      } else {
        clearInterval(interval);
        onGameOver(score);
      }
    }, spawnInterval);
    return () => clearInterval(interval);
  }, [missedBlocks, spawnInterval]);

  useEffect(() => {
    const moveBlocks = setInterval(() => {
      setBlocks(prev => prev.map(block => ({
        ...block,
        y: block.y + blockSpeed
      })).filter(block => {
        if (block.y > gameHeight + blockHeight) {
          setMissedBlocks(missed => missed + 1);
          return false;
        }
        return true;
      }));
    }, 1);
    return () => clearInterval(moveBlocks);
  }, [gameHeight, blockSpeed]);

  useEffect(() => {
    if (score % 16 === 0 && score > 0) {
      setBlockSpeed(oldSpeed => oldSpeed + Math.random() * .125);
      setSpawnInterval(oldInterval => Math.max(200, oldInterval - (Math.random() * 50)));
    }
  }, [score]);

  const handleColorSwitch = () => {
    const nextColor = colorList[(colorList.indexOf(baseColor) + 1) % colorList.length];
    setBaseColor(nextColor);
  };

  const checkCollisions = () => {
    setBlocks(blocks => blocks.filter(block => {
      if (block.y > gameHeight - baseHeight - blockHeight && block.y < gameHeight) {
        if (block.color === baseColor) {
          setScore(prev => prev + colorPoints[block.color]);
          setFlash('rgba(0, 255, 0, 0.5)'); // Flash green on success
          setTimeout(() => setFlash(''), 150);
          return false; // Remove block from array
        }
      }
      return true; // Keep block in the array
    }));
  };

  useEffect(() => {
    const collisionCheck = setInterval(checkCollisions, 100);
    return () => clearInterval(collisionCheck);
  }, [baseColor, gameHeight, baseHeight, blockHeight]);

  return (
    <Stage width={gameWidth} height={gameHeight} 
 onClick={(e) => {
      // Check if the click is not on the base
      if (e.evt.clientY < gameHeight - baseHeight) {
        accelerateNearestBlock();
      }
    }}
    >
      <Layer>
        <Rect width={gameWidth} height={gameHeight} fill={flash || "transparent"} />

    <Rect width={gameWidth / 2} height={54} fill='black' x={gameWidth - 136} y={8}/>
        <Text text={`Score: ${score}`} fontSize={16} fill="white" x={gameWidth-128} y={16} />
    <Text text={`Misses: ${missedBlocks}`} fontSize={16} fill="white" x={gameWidth-128} y={40} />
        {blocks.map((block, i) => (
          <Rect key={i} x={block.x} y={block.y} width={blockWidth} height={blockHeight} fill={block.color}   />
        ))}
        <Rect
          x={0}
          y={gameHeight - baseHeight}
          width={gameWidth}
          height={baseHeight}
          fill={baseColor}
          onClick={handleColorSwitch}
          onTap={handleColorSwitch}
    
        />
      </Layer>
    </Stage>
  );
};

export default GameArea;
