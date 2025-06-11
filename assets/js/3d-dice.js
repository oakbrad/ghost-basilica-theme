// 3D Dice Roller for Table Roller
document.addEventListener('DOMContentLoaded', function() {
    console.log('3D dice module loaded');
    
    // Check if required libraries are available
    if (typeof THREE === 'undefined' || typeof CANNON === 'undefined' || typeof DiceManager === 'undefined') {
        console.error('Required libraries for 3D dice are not loaded:',
            'THREE:', typeof THREE !== 'undefined',
            'CANNON:', typeof CANNON !== 'undefined',
            'DiceManager:', typeof DiceManager !== 'undefined'
        );
        return;
    }
    
    console.log('All required libraries for 3D dice are loaded');
    
    // Initialize Three.js scene, camera, renderer
    let diceScene = null;
    let diceCamera = null;
    let diceRenderer = null;
    let diceWorld = null;
    let diceContainer = null;
    let diceInitialized = false;
    let currentDie = null;
    let animationId = null;
    let resultCallback = null;
    let overlayElement = null;

    // Initialize the 3D dice environment
    function initDice(sides) {
        console.log('Initializing 3D dice with sides:', sides);
        
        try {
            if (diceInitialized) {
                // If already initialized, just reset
                if (currentDie) {
                    diceScene.remove(currentDie.getObject());
                    currentDie = null;
                }
                console.log('Dice already initialized, resetting');
                return;
            }

            // Create overlay for the dice to roll on top of the entire page
            overlayElement = document.createElement('div');
            overlayElement.className = 'dice-overlay';
            document.body.appendChild(overlayElement);
            
            // Store the container reference
            diceContainer = overlayElement;

            // Create the scene
            diceScene = new THREE.Scene();
            
            // Set up the camera - use the entire window
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            diceCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            diceCamera.position.set(0, 30, 60);
            diceCamera.lookAt(new THREE.Vector3(0, 0, 0));
            
            // Set up the renderer
            diceRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            diceRenderer.setSize(width, height);
            diceRenderer.setClearColor(0x000000, 0); // Transparent background
            
            // Add the renderer to the overlay
            overlayElement.appendChild(diceRenderer.domElement);
            
            // Set up the physics world
            diceWorld = new CANNON.World();
            diceWorld.gravity.set(0, -9.82 * 20, 0);
            diceWorld.broadphase = new CANNON.NaiveBroadphase();
            diceWorld.solver.iterations = 16;
            
            // Add a floor
            const floorBody = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Plane(),
                material: new CANNON.Material()
            });
            floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            diceWorld.addBody(floorBody);
            
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xf0f0f0);
            diceScene.add(ambientLight);
            
            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(-5, 10, 7.5);
            diceScene.add(directionalLight);
            
            // Initialize the DiceManager
            DiceManager.setWorld(diceWorld);
            
            diceInitialized = true;
            console.log('3D dice initialized successfully');
            
            // Handle window resize
            window.addEventListener('resize', function() {
                const width = window.innerWidth;
                const height = window.innerHeight;
                
                diceCamera.aspect = width / height;
                diceCamera.updateProjectionMatrix();
                diceRenderer.setSize(width, height);
            });
        } catch (error) {
            console.error('Error initializing 3D dice:', error);
            // If initialization fails, call the callback to continue
            if (resultCallback) {
                resultCallback(null);
            }
        }
    }

    // Create and roll a die with the specified number of sides
    function rollDie(sides, targetValue, callback) {
        console.log('Rolling die with sides:', sides, 'target value:', targetValue);
        resultCallback = callback;
        
        try {
            // Initialize if not already done
            if (!diceInitialized) {
                initDice(sides);
            } else {
                // Show the overlay if it exists
                if (overlayElement) {
                    overlayElement.style.display = 'block';
                }
            }

            // Determine which die type to use based on sides
            let dieType;
            switch (sides) {
                case 4:
                    dieType = DiceD4;
                    break;
                case 6:
                    dieType = DiceD6;
                    break;
                case 8:
                    dieType = DiceD8;
                    break;
                case 10:
                    dieType = DiceD10;
                    break;
                case 12:
                    dieType = DiceD12;
                    break;
                case 20:
                    dieType = DiceD20;
                    break;
                default:
                    // If unsupported number of sides, use the closest supported die type
                    if (sides <= 4) {
                        dieType = DiceD4;
                        console.warn(`Using D4 for ${sides} sides.`);
                    } else if (sides <= 6) {
                        dieType = DiceD6;
                        console.warn(`Using D6 for ${sides} sides.`);
                    } else if (sides <= 8) {
                        dieType = DiceD8;
                        console.warn(`Using D8 for ${sides} sides.`);
                    } else if (sides <= 10) {
                        dieType = DiceD10;
                        console.warn(`Using D10 for ${sides} sides.`);
                    } else if (sides <= 12) {
                        dieType = DiceD12;
                        console.warn(`Using D12 for ${sides} sides.`);
                    } else {
                        dieType = DiceD20;
                        console.warn(`Using D20 for ${sides} sides.`);
                    }
            }
            
            // Create the die
            currentDie = new dieType({
                size: 5,
                backColor: getComputedStyle(document.documentElement).getPropertyValue('--ghost-accent-color') || '#3eb0ef'
            });
            
            // Add the die to the scene
            diceScene.add(currentDie.getObject());
            
            // Position the die above the center
            currentDie.getObject().position.x = Math.random() * 10 - 5; // Random X position
            currentDie.getObject().position.y = 20; // Higher starting position
            currentDie.getObject().position.z = Math.random() * 10 - 5; // Random Z position
            
            // Add some random rotation
            currentDie.getObject().rotation.x = Math.random() * Math.PI;
            currentDie.getObject().rotation.y = Math.random() * Math.PI;
            currentDie.getObject().rotation.z = Math.random() * Math.PI;
            
            // Update the physics body
            currentDie.updateBodyFromMesh();
            
            // Apply a random impulse to make it roll
            const impulse = 15 + Math.random() * 15; // Stronger impulse
            currentDie.getObject().body.applyImpulse(
                new CANNON.Vec3(Math.random() * impulse - impulse/2, impulse, Math.random() * impulse - impulse/2),
                new CANNON.Vec3(0, 0, 0)
            );
            
            // Set the target value
            if (targetValue && targetValue > 0 && targetValue <= sides) {
                DiceManager.prepareValues([{dice: currentDie, value: targetValue}]);
            }
            
            // Start the animation
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            animate();
            
            // Set a timeout to check when the die has stopped
            setTimeout(checkDiceStop, 500);
        } catch (error) {
            console.error('Error rolling 3D die:', error);
            // If rolling fails, call the callback to continue
            if (resultCallback) {
                resultCallback(null);
            }
        }
    }

    // Animation loop
    function animate() {
        if (!diceInitialized) return;
        
        try {
            diceWorld.step(1.0 / 60.0);
            
            if (currentDie) {
                currentDie.updateMeshFromBody();
            }
            
            diceRenderer.render(diceScene, diceCamera);
            
            animationId = requestAnimationFrame(animate);
        } catch (error) {
            console.error('Error in animation loop:', error);
            // If animation fails, call the callback to continue
            if (resultCallback) {
                resultCallback(null);
            }
        }
    }

    // Check if the dice have stopped rolling
    function checkDiceStop() {
        try {
            if (!currentDie) {
                console.log('No die found in checkDiceStop');
                if (resultCallback) resultCallback(null);
                return;
            }
            
            // Get the angular velocity of the die
            const angVel = currentDie.getObject().body.angularVelocity;
            const velocity = currentDie.getObject().body.velocity;
            
            console.log('Die velocities:', 
                'angX:', Math.abs(angVel.x).toFixed(2), 
                'angY:', Math.abs(angVel.y).toFixed(2), 
                'angZ:', Math.abs(angVel.z).toFixed(2),
                'velX:', Math.abs(velocity.x).toFixed(2), 
                'velY:', Math.abs(velocity.y).toFixed(2), 
                'velZ:', Math.abs(velocity.z).toFixed(2)
            );
            
            // Check if the die has almost stopped moving
            if (
                Math.abs(angVel.x) < 0.1 && 
                Math.abs(angVel.y) < 0.1 && 
                Math.abs(angVel.z) < 0.1 &&
                Math.abs(velocity.x) < 0.1 && 
                Math.abs(velocity.y) < 0.1 && 
                Math.abs(velocity.z) < 0.1
            ) {
                // Die has stopped, get the result
                const result = currentDie.getUpsideValue();
                console.log('Die stopped, result:', result);
                
                // Stop the animation after a short delay
                setTimeout(() => {
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                    
                    // Hide the overlay
                    if (overlayElement) {
                        overlayElement.style.display = 'none';
                    }
                    
                    // Call the callback with the result
                    if (resultCallback) {
                        console.log('Calling result callback with result:', result);
                        resultCallback(result);
                    }
                }, 1000);
            } else {
                // Check again in a short time
                setTimeout(checkDiceStop, 500);
            }
        } catch (error) {
            console.error('Error in checkDiceStop:', error);
            // If checking stops fails, call the callback to continue
            if (resultCallback) {
                resultCallback(null);
            }
        }
    }

    // Expose the functions to the global scope
    window.DiceRoller = {
        init: initDice,
        roll: rollDie
    };
});
