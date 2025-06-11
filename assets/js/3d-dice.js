// 3D Dice Roller for Table Roller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js scene, camera, renderer
    let diceBox = null;
    let diceScene = null;
    let diceCamera = null;
    let diceRenderer = null;
    let diceWorld = null;
    let diceContainer = null;
    let diceInitialized = false;
    let currentDie = null;
    let animationId = null;
    let resultCallback = null;

    // Initialize the 3D dice environment
    function initDice(container, sides) {
        if (diceInitialized && diceContainer === container) {
            // If already initialized for this container, just reset
            if (currentDie) {
                diceScene.remove(currentDie.getObject());
                currentDie = null;
            }
            return;
        }

        // Store the container reference
        diceContainer = container;

        // Create the scene
        diceScene = new THREE.Scene();
        
        // Set up the camera
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width;
        const height = 300; // Fixed height for the dice area
        
        diceCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        diceCamera.position.set(0, 20, 40);
        diceCamera.lookAt(new THREE.Vector3(0, 0, 0));
        
        // Set up the renderer
        diceRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        diceRenderer.setSize(width, height);
        diceRenderer.setClearColor(0x000000, 0);
        
        // Clear the container and add the renderer
        container.innerHTML = '';
        container.appendChild(diceRenderer.domElement);
        
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
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (diceContainer) {
                const containerRect = diceContainer.getBoundingClientRect();
                const width = containerRect.width;
                const height = 300;
                
                diceCamera.aspect = width / height;
                diceCamera.updateProjectionMatrix();
                diceRenderer.setSize(width, height);
            }
        });
    }

    // Create and roll a die with the specified number of sides
    function rollDie(sides, targetValue, callback) {
        resultCallback = callback;
        
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
                // Default to D6 if unsupported number of sides
                dieType = DiceD6;
                console.warn(`Unsupported die type: D${sides}. Using D6 instead.`);
                sides = 6;
        }
        
        // Create the die
        currentDie = new dieType({
            size: 5,
            backColor: getComputedStyle(document.documentElement).getPropertyValue('--ghost-accent-color') || '#3eb0ef'
        });
        
        // Add the die to the scene
        diceScene.add(currentDie.getObject());
        
        // Position the die above the center
        currentDie.getObject().position.x = 0;
        currentDie.getObject().position.y = 10;
        currentDie.getObject().position.z = 0;
        
        // Add some random rotation
        currentDie.getObject().rotation.x = Math.random() * Math.PI;
        currentDie.getObject().rotation.y = Math.random() * Math.PI;
        currentDie.getObject().rotation.z = Math.random() * Math.PI;
        
        // Update the physics body
        currentDie.updateBodyFromMesh();
        
        // Apply a random impulse to make it roll
        const impulse = 10 + Math.random() * 10;
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
    }

    // Animation loop
    function animate() {
        if (!diceInitialized) return;
        
        diceWorld.step(1.0 / 60.0);
        
        if (currentDie) {
            currentDie.updateMeshFromBody();
        }
        
        diceRenderer.render(diceScene, diceCamera);
        
        animationId = requestAnimationFrame(animate);
    }

    // Check if the dice have stopped rolling
    function checkDiceStop() {
        if (!currentDie) {
            if (resultCallback) resultCallback(null);
            return;
        }
        
        // Get the angular velocity of the die
        const angVel = currentDie.getObject().body.angularVelocity;
        const velocity = currentDie.getObject().body.velocity;
        
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
            
            // Stop the animation after a short delay
            setTimeout(() => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                
                // Call the callback with the result
                if (resultCallback) {
                    resultCallback(result);
                }
            }, 1000);
        } else {
            // Check again in a short time
            setTimeout(checkDiceStop, 500);
        }
    }

    // Expose the functions to the global scope
    window.DiceRoller = {
        init: initDice,
        roll: rollDie
    };
});

