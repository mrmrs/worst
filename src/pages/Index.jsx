import React, { useEffect, useState, useRef, Suspense, useMemo, createContext, useContext } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Box, Text, Environment, Grid, SoftShadows } from "@react-three/drei";
import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import "../App.css";

// --- Theme Setup ---
// Helper to generate random hex color
const getRandomHexColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

// --- Curated Palettes ---
const palettes = [
  { // Palette 1: Sunset/Synthwave
    name: "Synthwave Sunset",
    bgHorizon: "#231a3f", bgZenith: "#ff8c00",
    buttonGradTop: "#ff00ff", buttonGradBottom: "#ff69b4", buttonText: "white", buttonTextOutline: "#000",
    terrainLow: "#4b0082", terrainHigh: "#da70d6", terrainWireframe: "#ffffff",
    ambientLightIntensity: 0.15, directionalLightColor: "#ffdead", directionalLightIntensity: 1.8, fogColor: "#483d8b",
  },
  { // Palette 2: Forest/Earthy
    name: "Earthy Forest",
    bgHorizon: "#2f4f4f", bgZenith: "#8fbc8f",
    buttonGradTop: "#006400", buttonGradBottom: "#556b2f", buttonText: "white", buttonTextOutline: "#111",
    terrainLow: "#8b4513", terrainHigh: "#228b22", terrainWireframe: "#f5f5f5",
    ambientLightIntensity: 0.2, directionalLightColor: "#f5f5dc", directionalLightIntensity: 1.5, fogColor: "#708090",
  },
  { // Palette 3: Ocean/Cool
    name: "Cool Ocean",
    bgHorizon: "#000080", bgZenith: "#add8e6",
    buttonGradTop: "#4682b4", buttonGradBottom: "#00ced1", buttonText: "white", buttonTextOutline: "#000040",
    terrainLow: "#191970", terrainHigh: "#40e0d0", terrainWireframe: "#ffffff",
    ambientLightIntensity: 0.25, directionalLightColor: "#e0ffff", directionalLightIntensity: 1.6, fogColor: "#7fffd4",
  },
  { // Palette 4: Monochromatic Glitch
    name: "Monochrome Glitch",
    bgHorizon: "#111111", bgZenith: "#cccccc",
    buttonGradTop: "#333333", buttonGradBottom: "#999999", buttonText: "white", buttonTextOutline: "#000",
    terrainLow: "#050505", terrainHigh: "#444444", terrainWireframe: "#ffffff",
    ambientLightIntensity: 0.1, directionalLightColor: "#ffffff", directionalLightIntensity: 2.0, fogColor: "#666666",
 },
  { // Palette 5: Desert Heat
    name: "Desert Heat",
    bgHorizon: "#8B4513", bgZenith: "#FFA500", // Brown to Orange
    buttonGradTop: "#FF4500", buttonGradBottom: "#FF6347", // Orangered to Tomato
    buttonText: "black", buttonTextOutline: "#4d1a00",
    terrainLow: "#D2691E", terrainHigh: "#F4A460", // Chocolate to Sandy Brown
    terrainWireframe: "#FFFFF0", // Ivory
    ambientLightIntensity: 0.25, directionalLightColor: "#FFEFD5", // Papaya Whip
    directionalLightIntensity: 1.8, fogColor: "#FDF5E6", // Old Lace
  },
];

// Keep UI colors separate initially, merge with selected palette
const initialUiTheme = {
  scoreColor: 'white',
  modalBg: 'rgba(0, 0, 0, 0.9)',
  modalTextColor: 'yellow',
  modalGameOverRed: 'red',
  modalScoreBoxBg: 'white',
  modalScoreBoxColor: 'black',
  modalUsernameLabel: 'yellow',
  modalUsernameInputColor: 'yellow',
  modalUsernameInputBorder: 'yellow',
  modalUsernameButtonBg: 'yellow',
  modalUsernameButtonColor: 'black',
  modalContinueButtonBg: 'limegreen',
  modalContinueButtonColor: 'black',
  modalLeaderboardBg: 'gold',
  modalLeaderboardColor: 'black',
  modalLeaderboardBorder: 'rgba(255, 215, 0, 0.5)',
  modalPlaysColor: '#aaa',
};

const initialTheme = { ...palettes[0], ...initialUiTheme }; // Start with first palette + UI

const ThemeContext = createContext({
  theme: initialTheme,
  randomizeTheme: () => {},
});
// --- End Theme Setup ---

// ----- Background Shader Code -----

const bgVertexShader = `
  varying vec3 vWorldPosition;
  // varying vec3 vNormal; // Normal not needed for subtle shader
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    // vNormal = normalize(normalMatrix * normal); // No need to pass normal
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    gl_Position.z = gl_Position.w;
  }
`;

// Replace with the subtle version
const bgFragmentShader = `
  uniform float uTime;
  uniform vec3 uHorizonColor;
  uniform vec3 uZenithColor;
  uniform float uNoiseScale; // Single scale for subtle noise

  varying vec3 vWorldPosition;
  // varying vec3 vNormal; // Normal not needed

  // --- Noise Functions (FBM and hash3d as before) ---
  float hash3d(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 271.9))) * 43758.5453); }
  float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      mat3 rot = mat3(cos(0.5), sin(0.5), 0.0, -sin(0.5), cos(0.5), 0.0, 0.0, 0.0, 1.0);
      // Fewer octaves for smoother noise
      for (int i = 0; i < 3; i++) {
          value += amplitude * hash3d(p);
          p = rot * p * 1.8 + 100.0; // Adjusted multiplier slightly
          amplitude *= 0.65; // Adjusted gain slightly
      }
      return value; // Noise value roughly 0 to 1
  }
  // --- End Noise Functions ---

  void main() {
    // Calculate view direction (from camera to fragment world position)
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);

    // Calculate vertical factor based on view direction's Y component
    float verticalFactor = smoothstep(-0.1, 0.4, viewDirection.y);

    // Interpolate base sky color based on height
    vec3 skyColor = mix(uHorizonColor, uZenithColor, verticalFactor);

    // --- Subtle Noise ---
    // Use world position + slow time animation for noise input
    vec3 noiseCoords = vWorldPosition * uNoiseScale + vec3(0.0, uTime * 0.03, uTime * 0.04);
    float noise = fbm(noiseCoords); // Value ~0 to 1

    // Apply noise subtly to the base color
    // (noise - 0.5) gives roughly -0.5 to 0.5. Multiply by small factor.
    vec3 finalColor = skyColor + (noise - 0.5) * 0.15; // Adjust 0.15 for noise intensity

    // Clamp final color
    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;


// --- Shader Background Component ---
const ShaderBackground = () => {
  const { theme } = useContext(ThemeContext);
  const materialRef = useRef();
  const boxSize = 150; 

  // Uniforms memo depends on theme colors. A new object is created on change.
  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 }, // Start time at 0
    uHorizonColor: { value: new THREE.Color(theme.bgHorizon) }, 
    uZenithColor: { value: new THREE.Color(theme.bgZenith) },  
    uNoiseScale: { value: 0.05 }, // Use the value from the last correction
  }), [theme.bgHorizon, theme.bgZenith]); // Dependencies are key

  // ONLY update time in useFrame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // REMOVE color update logic from here
    }
  });

  return (
    <mesh renderOrder={-1}> 
      <boxGeometry args={[boxSize, boxSize, boxSize]} />
      {/* Pass the potentially new uniforms object directly */}
      {/* Add key prop */}
      <shaderMaterial
        ref={materialRef}
        key={theme.bgHorizon + theme.bgZenith} // Add key prop 
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        uniforms={uniforms} // Pass the memoized object
        depthWrite={false}
        side={THREE.BackSide} 
      />
    </mesh>
  );
};

// Component for the 3D Button
const GameButton = React.forwardRef(({ onClick, inputMethod, hovered }, ref) => {
  const { theme } = useContext(ThemeContext);
  const meshRef = useRef();
  const geometryRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // --- Pulsing Scale --- 
    const pulseScale = 1.0 + Math.sin(time * 4) * 0.05; 
    if (ref.current) {
      ref.current.scale.set(pulseScale, pulseScale, pulseScale);
    }

    // --- Subtle Rotation --- 
    if (ref.current) {
      // Twist around Y axis (like wind)
      const twistY = Math.sin(time * 0.7) * 0.08; // Slower frequency, small amplitude
      // Slight tilt on X and Z for more natural feel
      const tiltX = Math.sin(time * 0.5 + 1.0) * 0.04;
      const tiltZ = Math.cos(time * 0.6 + 2.0) * 0.04;
      
      ref.current.rotation.set(tiltX, twistY, tiltZ);
    }
  });

  // Re-run effect if theme button colors change
  useEffect(() => {
    if (geometryRef.current) {
      const geometry = geometryRef.current;
      const count = geometry.attributes.position.count;
      const colors = new Float32Array(count * 3);
      const colorBottom = new THREE.Color(theme.buttonGradBottom);
      const colorTop = new THREE.Color(theme.buttonGradTop);

      for (let i = 0; i < count; i++) {
        const yPos = geometry.attributes.position.getY(i);
        const targetColor = yPos > 0 ? colorTop : colorBottom;
        colors[i * 3] = targetColor.r;
        colors[i * 3 + 1] = targetColor.g;
        colors[i * 3 + 2] = targetColor.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [theme.buttonGradBottom, theme.buttonGradTop]);

  const buttonSize = [3, 0.75, 0.75];
  const textZOffset = buttonSize[2] / 2 + 0.01; 

  return (
    <group ref={ref} renderOrder={999}>
      <Box ref={meshRef} args={buttonSize} onClick={(event) => { event.stopPropagation(); onClick(); }} castShadow>
         <boxGeometry ref={geometryRef} args={buttonSize} />
        <meshStandardMaterial vertexColors={true} depthTest={false} roughness={0.4} metalness={0.1} />
      </Box>
      <Text
        position={[0, 0, textZOffset]} 
        fontSize={0.2} 
        fontWeight={900}
        color={theme.buttonText}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor={theme.buttonTextOutline}
        material-depthTest={false} 
      >
        {`DO NOT ${inputMethod === 'click' ? 'CLICK' : 'TAP'}`}
      </Text>
    </group>
  );
});

// --- Terrain Component --- (Reintroduce two meshes)
const Terrain = React.forwardRef((props, ref) => {
    const { theme } = useContext(ThemeContext); // Get theme
    const fillMeshRef = useRef();
    const terrainSize = 80;
    const segments = 100;
    const noiseGen = useMemo(() => new SimplexNoise(), []);
    const voxelSteps = 8;
    const baseAmplitude = 3.0;
    const scrollSpeed = 0.1; // Speed for terrain scroll

    // Generate VOXEL-LIKE displacement data
    const displacementData = useMemo(() => {
        const size = segments + 1;
        const data = new Float32Array(size * size);
        const scale = 0.06; // Noise scale

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const x = i * scale;
                const y = j * scale;
                const noiseVal = (noiseGen.noise(x, y) + 1) / 2; // Noise 0 to 1
                // Quantize noise value into steps
                const steppedVal = Math.floor(noiseVal * voxelSteps) / (voxelSteps -1);
                data[i * size + j] = steppedVal * baseAmplitude;
            }
        }
        return data;
    }, [segments, noiseGen, voxelSteps, baseAmplitude]);

    const displacementMap = useMemo(() => {
        const texture = new THREE.DataTexture(displacementData, segments + 1, segments + 1, THREE.RedFormat, THREE.FloatType);
        texture.wrapS = THREE.RepeatWrapping; // Enable wrapping for scroll
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }, [displacementData, segments]);

    // Generate vertex colors based on theme
    const colorData = useMemo(() => {
        const colors = [];
        const colorLow = new THREE.Color(theme.terrainLow);
        const colorHigh = new THREE.Color(theme.terrainHigh);
        const size = segments + 1;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const height = displacementData[i * size + j];
                const normalizedHeight = Math.max(0, Math.min(1, height / baseAmplitude));
                const interpolatedColor = colorLow.clone().lerp(colorHigh, normalizedHeight);
                colors.push(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b);
            }
        }
        return new Float32Array(colors);
    // Depend on theme colors now
    }, [displacementData, baseAmplitude, segments, theme.terrainLow, theme.terrainHigh]);

    // Attach colors to fill mesh geometry
    useEffect(() => {
        if (fillMeshRef.current && fillMeshRef.current.geometry) {
            fillMeshRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colorData, 3));
        }
    }, [colorData]);

    // Scrolling logic remains the same (targets fillMeshRef)
    useFrame((state, delta) => { 
         if (fillMeshRef.current && fillMeshRef.current.material.displacementMap) {
            fillMeshRef.current.material.displacementMap.offset.y += delta * scrollSpeed;
        }
     });

    return (
        <group ref={ref} position={[0, -baseAmplitude/2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Mesh 1: Filled */}
            <mesh
              ref={fillMeshRef}
              receiveShadow castShadow
            >
                <planeGeometry args={[terrainSize, terrainSize, segments, segments]} />
                <meshStandardMaterial
                    displacementMap={displacementMap}
                    displacementScale={0.25} 
                    displacementBias={1}    
                    metalness={1}          
                    roughness={0}          
                    vertexColors={true}
                    wireframe={false} // Fill mesh is not wireframe
                    flatShading={true}  // Re-enable flat shading
                />
            </mesh>
            {/* Mesh 2: Wireframe Overlay */}
            <mesh
              position={[0, 0.01, 0]} // Keep slight offset
            >
                <planeGeometry args={[terrainSize, terrainSize, segments, segments]} />
                <meshStandardMaterial
                    displacementMap={displacementMap} // Needs displacement too
                    displacementScale={0.25} 
                    displacementBias={1}    
                    color={theme.terrainWireframe} // Use theme color for wireframe
                    wireframe={true}
                    polygonOffset={true}
                    polygonOffsetFactor={-1}
                    polygonOffsetUnits={-1}
                    transparent={true}
                    opacity={0.7}
                />
            </mesh>
         </group>
    );
});

// --- GameScene Component (Simplified & Enhanced) ---
function GameScene({ score, handleButtonClick, inputMethod }) {
    const { theme } = useContext(ThemeContext);
    const buttonRef = useRef();
    const terrainRef = useRef(); // Ref for Terrain mesh
    const [hovered, setHovered] = useState(false);
    const raycaster = useMemo(() => new THREE.Raycaster(), []); // For hover
    const collisionRaycaster = useMemo(() => new THREE.Raycaster(), []); // For terrain collision

    useFrame((state, delta) => {
        delta = Math.min(delta, 0.05);

        // --- Button Hover Check ---
        raycaster.setFromCamera(state.pointer, state.camera);
        const buttonGroup = buttonRef.current;
        let isHoveringButton = false;
        if (buttonGroup) {
            const intersects = raycaster.intersectObject(buttonGroup, true);
            if (intersects.length > 0) isHoveringButton = true;
        }
        setHovered(isHoveringButton);

        // --- Button Position / Collision Detection (Terrain) ---
        const buttonBaseY = 6.0; // Lower base height back into view
        const buttonHalfHeight = 0.375; 
        let targetY = buttonBaseY; 
        if (terrainRef.current && buttonRef.current) { 
            collisionRaycaster.set( new THREE.Vector3(buttonRef.current.position.x, targetY + 5, buttonRef.current.position.z), new THREE.Vector3(0, -1, 0) ); // Raycast from above current target
            const intersects = collisionRaycaster.intersectObject(terrainRef.current);
            if (intersects.length > 0) { 
                const terrainY = intersects[0].point.y;
                // Ensure button stays above terrain + buffer, even if terrain is higher than base Y
                targetY = Math.max(buttonBaseY, terrainY + buttonHalfHeight + 0.2); 
            } else { 
                targetY = buttonBaseY; // No terrain below, stick to base height
            }
            buttonRef.current.position.y = targetY; 
            buttonRef.current.position.x = 0;
            buttonRef.current.position.z = 0;
        }

        // --- Camera update ---
        // Look slightly lower to change angle and horizon
        state.camera.lookAt(0, -1, 0);
        state.camera.updateProjectionMatrix();
    }); // END useFrame

    return (
        <>
            {/* Add ShaderBackground, Remove Sky */}
            <ShaderBackground />

            {/* Soft Shadows Configuration */}
            <SoftShadows size={25} samples={20} focus={.1} />

            {/* Adjusted Lighting */}
            <ambientLight intensity={theme.ambientLightIntensity} /> 
            <directionalLight
                position={[50, 30, 30]} 
                intensity={theme.directionalLightIntensity} 
                castShadow
                color={theme.directionalLightColor} 
                shadow-mapSize-width={2048} 
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={150} 
                shadow-camera-left={-50} shadow-camera-right={50}
                shadow-camera-top={50} shadow-camera-bottom={-50}
                shadow-bias={-0.0005} 
            />
             {/* Optional Point Lights - removed for simpler natural look for now */}

            {/* Adjusted Fog */}
            <fog attach="fog" args={[theme.fogColor, 30, 90]} /> {/* Soft lavender/pinkish fog */}

            {/* Button */}
            <GameButton ref={buttonRef} onClick={handleButtonClick} inputMethod={inputMethod} hovered={hovered} />

            {/* Terrain */}
            <Suspense fallback={null}> {/* Wrap Terrain in Suspense if needed for textures */}
                <Terrain ref={terrainRef} />
            </Suspense>
        </>
    );
} // END GameScene

// --- App Component ---
const App = () => {
    const [score, setScore] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [count, setCount] = useState(0);
    const [username, setUsername] = useState(
        localStorage.getItem("username") || "",
    );
    const [usernameInput, setUsernameInput] = useState("");
    const [highScore, setHighScore] = useState(
        parseInt(localStorage.getItem("highScore"), 10) || 0,
    );
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [inputMethod, setInputMethod] = useState("click");
    const [dailyScores, setDailyScores] = useState([]);
    const [allTimeScores, setAllTimeScores] = useState([]);
    const [gameHistory, setGameHistory] = useState(() => {
        const saved = localStorage.getItem('gameHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const startTime = useRef(Date.now());
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(initialTheme);

    const durableObjectName = "WORST_GAME_HOME";
    const fetchCount = async () => {
        try {
            const response = await fetch(
                `https://ts-gen-count.adam-f8f.workers.dev/?name=${durableObjectName}`,
            );
            const data = await response.text();
            setCount(data);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };
    const handleIncrement = async () => {
        try {
            await fetch(
                `https://ts-gen-count.adam-f8f.workers.dev/increment?name=${durableObjectName}`,
                {
                    method: "POST",
                },
            );
            fetchCount();
        } catch (error) {
            console.error("Error incrementing count:", error);
        }
    };

    const handleButtonClick = () => {
        if (!gameOver) {
            const endTime = Date.now();
            const calculatedTimeTaken = endTime - startTime.current;
            setTimeTaken(calculatedTimeTaken);
            setScore(calculatedTimeTaken);
            setGameOver(true);
            handleIncrement();

            if (calculatedTimeTaken > highScore) {
                localStorage.setItem("highScore", calculatedTimeTaken);
                setHighScore(calculatedTimeTaken);
                setIsNewHighScore(true);
            } else {
                setIsNewHighScore(false);
            }

            const scoreData = {
                user: username,
                score: calculatedTimeTaken,
                timeTaken: calculatedTimeTaken,
            };

            if(!username) {
                setIsUsernameModalOpen(true);
            } else {
                submitScore(scoreData, 'daily');
            }
        }
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        const newUsername = e.target.username.value;
        if (newUsername) {
            localStorage.setItem("username", newUsername);
            setUsername(newUsername);
            setIsUsernameModalOpen(false);

            submitScore({
                user: newUsername,
                score: score,
                timeTaken: timeTaken,
            }, 'daily');
        }
    };

    const submitScore = async (scoreData, category) => {
        const dataWithCategory = { ...scoreData, category };
        try {
            const response = await fetch('https://games-0000.adam-f8f.workers.dev/submit-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataWithCategory)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
            }

            console.log("Score submitted successfully");
            
            const fetchedDailyScores = await fetchScores('daily');
            const fetchedAllTimeScores = await fetchScores('all-time');
            setDailyScores(fetchedDailyScores);
            setAllTimeScores(fetchedAllTimeScores);
        } catch (error) {
            console.error("Failed to submit score:", error);
        }
    };

    const fetchScores = async (category) => {
        const url = `https://games-0000.adam-f8f.workers.dev/get-scores?category=${category}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const scores = await response.json();
            return scores;
        } catch (error) {
            console.error("Failed to fetch scores:", error);
            return [];
        }
    };

    useEffect(() => {
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    }, [gameHistory]);

    useEffect(() => {
        const loadScores = async () => {
            const fetchedDailyScores = await fetchScores('daily');
            const fetchedAllTimeScores = await fetchScores('all-time');
            setDailyScores(fetchedDailyScores);
            setAllTimeScores(fetchedAllTimeScores);
        };

        loadScores();
        fetchCount();
    }, []);

    // Score Update useEffect (Simplified)
    useEffect(() => {
        if (gameOver) return;
        let animationFrameId;
        const updateGame = () => {
            const currentElapsedTime = Date.now() - startTime.current;
            setScore(currentElapsedTime);
            animationFrameId = requestAnimationFrame(updateGame);
        };
        animationFrameId = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameOver, startTime]);

    const randomizeTheme = () => {
        console.log("Randomizing theme from curated list!");
        // Select a random palette from the array
        const randomIndex = Math.floor(Math.random() * palettes.length);
        const selectedPalette = palettes[randomIndex];
        console.log("Selected Palette:", selectedPalette.name);

        // Update the theme state - merge selected palette with existing
        setCurrentTheme(prevTheme => ({
             ...prevTheme, // Keep existing non-overridden keys (like UI)
             ...selectedPalette // Override with selected palette colors/values
         }));
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, randomizeTheme }}>
            <div
                className="text-color background-color"
                onClick={randomizeTheme} // Call randomizeTheme on click
                style={{
                    textAlign: "center",
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <p style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: currentTheme.scoreColor, fontSize: '16px', mixBlendMode: 'none' }}>{score}</p>

                {!gameOver && (
                    <Canvas
                        shadows
                        camera={{ position: [0, 5, 18], fov: 55 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#111' }}
                    >
                        <Suspense fallback={null}>
                            <GameScene
                                score={score}
                                handleButtonClick={handleButtonClick}
                                inputMethod={inputMethod}
                            />
                        </Suspense>
                    </Canvas>
                )}

                {gameOver && (
                    <div
                        id="game-over-modal"
                        style={{
                            textTransform: 'uppercase',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            width: "100%",
                            height: "100%",
                            background: currentTheme.modalBg,
                            color: currentTheme.modalTextColor,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: 'center',
                            zIndex: 20,
                            overflowY: 'auto',
                            padding: '20px 0'
                        }}
                    >
                        <div style={{ textAlign: "center", width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                            <p style={{ color: currentTheme.modalGameOverRed, fontSize: "16px", fontWeight: "400", margin: '0 0 16px 0' }}>
                                GAME OVER
                            </p>
                            <div style={{ background: currentTheme.modalScoreBoxBg, color: currentTheme.modalScoreBoxColor, padding: '8px 24px', width: 'auto', maxWidth: '90%', transform: 'rotate(-4deg)', marginBottom: '16px' }}>
                                <div>
                                    {!isNewHighScore && <p style={{ fontSize: '10px', margin: '0 0 2px 0' }}>SCORE</p>}
                                    {isNewHighScore && (
                                        <p style={{ display: 'flex', alignItems: 'center', fontSize: '10px', margin: '0 0 2px 0', textAlign: 'center', justifyContent: 'center' }}>NEW HIGH SCORE!</p>
                                    )}
                                    <p style={{ fontWeight: "bold", fontSize: "64px", margin: '8px 0 0 0', lineHeight: 0.9 }}>
                                        {score}
                                    </p>
                                </div>
                            </div>

                            {!username && isUsernameModalOpen && (
                                <div style={{ maxWidth: '100%', width: '90%', marginTop: '20px' }}>
                                    <form onSubmit={handleUsernameSubmit} style={{ padding: '0', marginBottom: '16px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                                        <label style={{ alignSelf: 'center', fontSize: '10px', display: 'flex', alignItems: 'center', width: 'auto', paddingRight: '8px', textAlign: 'right', color: currentTheme.modalUsernameLabel }}>
                                            <span>Enter Username</span>
                                        </label>
                                        <input
                                            autoComplete='off'
                                            type="text"
                                            name="username"
                                            required
                                            value={usernameInput}
                                            onChange={(e) => setUsernameInput(e.target.value)}
                                            style={{ textTransform:'uppercase', maxWidth: '100%', width: '12ch', fontSize: '24px', border: `1px solid ${currentTheme.modalUsernameInputBorder}`, background: 'transparent', color: currentTheme.modalUsernameInputColor, fontWeight: 900, padding: '8px' }}
                                        />
                                        <button type="submit" style={{ appearance: 'none', WebkitAppearance: 'none', fontWeight: 900, background: currentTheme.modalUsernameButtonBg, padding: '8px 12px', border: 0, height: '46px', fontSize: '12px', color: currentTheme.modalUsernameButtonColor }}>Submit</button>
                                    </form>
                                </div>
                            )}

                            <div style={{ width: 'auto', padding: "4px 0px 4px 4px", margin: '20px 16px', maxWidth: '256px', alignSelf: 'center', color: currentTheme.modalContinueButtonBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p style={{ margin: 0, fontSize: '14px' }}>Continue?</p>
                                <button
                                    style={{ appearance: 'none', WebkitAppearance: 'none', display: "inline-block", marginLeft: 'auto', marginRight: "0px", background: currentTheme.modalContinueButtonBg, color: currentTheme.modalContinueButtonColor, border: 0, padding: '8px 12px' }}
                                    onClick={() => window.location.reload()}
                                >
                                    Yes
                                </button>
                                <button style={{ appearance: 'none', WebkitAppearance: 'none', border: 0, boxShadow: '0 0 0 1px transparent', background: 'transparent', color: currentTheme.modalContinueButtonBg, padding: '8px 16px' }}>No</button>
                            </div>
                        </div>

                        <section style={{ width: '100%', maxWidth: '512px', margin: '0 auto', color: currentTheme.modalLeaderboardBg, alignSelf: 'center' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 16px' }}>
                                <article>
                                    <h5 style={{ margin: 0, fontSize: '12px', background: currentTheme.modalLeaderboardBg, color: currentTheme.modalLeaderboardColor, padding: '2px 4px' }}>Today</h5>
                                    {dailyScores.length > 0 && (
                                        <ol style={{ listStyle: 'none', fontSize: '12px', padding: 0, margin: '16px 0 0 0', lineHeight: 1.55, maxHeight: '150px', overflowY: 'auto' }}>
                                            {dailyScores.slice(0, 10).map((scoreItem, index) => (
                                                <li key={index} style={{ margin: 0, fontSize: '10px', width: '100%', padding: '2px 0', borderBottom: `1px solid ${currentTheme.modalLeaderboardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <b style={{ display: 'inline-block', marginRight: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        <span style={{ width: '16px', display: 'inline-block', marginRight: '4px', textAlign: 'left', opacity: 0.5 }}>{index + 1}</span>
                                                        {scoreItem.user}
                                                    </b>
                                                    <code>{scoreItem.score}</code>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </article>
                                <article style={{ color: currentTheme.modalLeaderboardBg }}>
                                    <h5 style={{ margin: 0, fontSize: '12px', background: currentTheme.modalLeaderboardBg, color: currentTheme.modalLeaderboardColor, padding: '2px 4px' }}>All-time</h5>
                                    {allTimeScores.length > 0 && (
                                        <ol style={{ listStyle: 'none', fontSize: '12px', padding: 0, margin: '16px 0 0 0', lineHeight: 1.55, maxHeight: '150px', overflowY: 'auto' }}>
                                            {allTimeScores.slice(0, 10).map((scoreItem, index) => (
                                                <li key={index} style={{ fontSize: '10px', padding: '2px 0', borderBottom: `1px solid ${currentTheme.modalLeaderboardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                    <b style={{ display: 'inline-block', marginRight: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        <span style={{ width: '16px', display: 'inline-block', marginRight: '4px', textAlign: 'left', opacity: 0.5 }}>{index + 1}</span>
                                                        {scoreItem.user}
                                                    </b>
                                                    <code>{scoreItem.score}</code>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </article>
                            </div>
                        </section>

                        <footer style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                            <small style={{ fontSize: "10px", color: currentTheme.modalPlaysColor }}>
                                {count} plays
                            </small>
                        </footer>
                    </div>
                )}
            </div>
        </ThemeContext.Provider>
    );
};

export default App;
