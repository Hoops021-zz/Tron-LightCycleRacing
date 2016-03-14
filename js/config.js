
var texture_loader = new THREE.TextureLoader();

var CONFIG = {

    // Color Presets
    'white' : new THREE.Color(0xFFFFFF),

    // Renderer Settings
    'renderer' : {
        antialias: true,
        maxLights: 20
        //antialias: true,	// to get smoother output
    },
    'background' : 0x000000,

    // Camera Settings
    'cameraAngle' : 75,
    'cameraNear' : 0.1,
    'cameraFar' : 100000,
    'cameraPos' : UTIL.v3(-15, 0, 200),
    'cameraVel' : UTIL.v3c(0, 0, -150),
    'cameraOffset' : 200,

    'viewDistance' : 1000,

    // Player Settings
    'playerScale' : 3,
    'playerForwardVelMultiplier' : 0.05,
    'playerDefaultForwardVel' : -150,
    'playerMaxForwardVel' : -600,
    'playerMinForwardVel' : 0,
    'playerLateralVelMultiplier' : 0.25,
    'playerRotationalMultiplier' : 0.25,
    'playerRotationMultiplier' : 0.25,
    'playerMaxLateralVel' : Math.PI,
    'playerBoosterLimit' : 3,
    'playerPos' : UTIL.v3c(75, 1.5 * Math.PI, 0),
    'playerDefaulVel' : UTIL.v3c(1, 0, 0),
    'playerDefaulTargetVel' : UTIL.v3c(0, 0, -150),
    'defaultPlayerJumpVel' : -450,
    'playerGravityAcceleration' : 1000,
    'playerMaterial' : new THREE.MeshLambertMaterial({
        map: texture_loader.load('img/LightCycle_TextureTest1.png'),
        transparent : false
    }),
    'playerGlowMaterial' : new THREE.MeshPhongMaterial({
        //map: texture_loader.load('img/LightCycle_Glow.png'),
        map: texture_loader.load('img/LightCycle_Glow.png'),
        //diffuse: 0xFFFFFF,
        //color: 0x000000
        color:0xFFFFFF
    }),
    'playerGeometry' : null,

    // Tunnel Settings
    'tunnelRadius' : 100,
    'tunnelSegmentDepth' : 10,
    'tunnelSegmentPerSection' : 10,
    'tunnelResolution' : 16,
    'tunnelLiveSections' : 15, // should be 1 + cameraFar/(segdepth * seg/sec)
    'tunnelMapData' : null,
    'GRAYVAL' : 154,
    // Trail Settings
    'trailMeshOffest' : 45,
    'trailLiveSections' : 35,
    'trailHeight' : 5,

    // Light Ring Settings
    'lightRingCount' : 8,
    'lightColor' : 0xFFFFFF,
    'lightIntensity' : 0.55,
    'lightRange' : 800,
    'lightIntensityStep' : 0.05,

    // Items Settings
    'itemProbability' : 0.3,
    'PowerUpMesh' : null,
    'PowerUpMaterial' : new THREE.MeshLambertMaterial({
        map: texture_loader.load('img/LightDisk.png'),
        transparent : false
    }),

    'CreditValue' : 200,
    'CreditCountPerGen' : 10,
    'CreditCountRotX' : 0.04,
    'CreditCountRotZ' : -0.03,

    // Particle Settings
    'particleCount' : 2000,
    'particleTexture' : texture_loader.load('img/Particle.png'),
    'particleVelocityRange' : 1000,

    // Derezz Settings
    'derezzTexture' : texture_loader.load('img/LightCycle_Glow.png'),

    // Sound Settings
    'bgSound' : 'sounds/TronMusic1.mp3',
    'soundVolume' : 0.7,

    // Intro Settings
    'penPath' : [
        [-500, 0, 0], // Starting Point

        [-250, 0, HALFPI], [-250, 75, HALFPI], [-300, 75, -HALFPI], // T
        [-300, 100, -HALFPI], [-175, 100, -HALFPI], [-175, 75, -HALFPI],
        [-225, 75, HALFPI], [-225, 0, HALFPI],

        [-100, 0, HALFPI], [-100, 100, -HALFPI], [-25, 100, -HALFPI], // R
        [-25, 50, -HALFPI], [-60, 50, HALFPI], [-25, 0, HALFPI],

        [50, 0, HALFPI], [50, 100, -HALFPI], [125, 100, -HALFPI], [125, 0, HALFPI], // O

        [200, 0, HALFPI], [200, 100, -HALFPI], [225, 100, -HALFPI], [275, 0, PI],// N
        [275, 100, -HALFPI], [300, 100, HALFPI], [300, 0, HALFPI],

        [500, 0, HALFPI] // Ending Point
    ],
    'PenDrawSpeed' : 1000,
    'introLightPosition' : UTIL.v3(10, 50, 130),

    // Obstacles Settings
    'boxObstacleHeight' : 30,
    'obstacleMaterial' : new THREE.MeshLambertMaterial({
        color : 0x47C5D8,
        //diffuse : 0x47C5D8,
        // shading : THREE.SmoothShading,
        wireframe : false
    }),

    'initIntroResources' : function(callback){
        // Load .js (aka .obj geometry) files for game
        var geometryLoader = new THREE.JSONLoader();
        geometryLoader.load('obj/LightCycle.js', function (geometry) {
            CONFIG.playerGeometry = geometry;
            callback();
        });
    },
    
    'initGameResources' : function (callback) {
        var numOfItemsToLoad = 3, 
            gameLoading = UTIL.load(numOfItemsToLoad, callback);
            

        // Load .js (aka .obj geometry) files for game
        var geometryLoader = new THREE.JSONLoader();
        geometryLoader.load('obj/LightDisk_2016.json', function (geometry) {
        //geometryLoader.load('obj/LightDisk.js', function (geometry) {
            CONFIG.PowerUpMesh = geometry;
            gameLoading.loadFinished();
        });


        geometryLoader.load('obj/LightCycle_2016.json', function (geometry) {
        //geometryLoader.load('obj/LightCycle.js', function (geometry) {
            CONFIG.playerGeometry = geometry;
            gameLoading.loadFinished();
        });
        
        
        // Load Texture to define level configuration/
        /*
        texture_loader.load('img/Levels/TunnelMap.png', function (data) {
            
            CONFIG.tunnelMapData = UTIL.getImageData(data);
            
            gameLoading.loadFinished();
        });*/
        
        var tunnel_map_img = new Image;
        tunnel_map_img.onload = function() {
            var canvas = document.createElement('canvas'), context;
            canvas.width = tunnel_map_img.width;
            canvas.height = tunnel_map_img.height;

            context = canvas.getContext('2d');
            context.drawImage(tunnel_map_img, 0, 0);

            CONFIG.tunnelMapData = context.getImageData(0, 0, tunnel_map_img.width, tunnel_map_img.height);
            
            // Indicate finished loading asset
            gameLoading.loadFinished();
        }
        tunnel_map_img.src = 'img/Levels/TunnelMap.png';//URL.createObjectURL('img/Levels/TunnelMap.png');
        
        // Load textures for Skybox
        var urlPrefix   = 'img/SpaceSkybox/',
            urls = [
                urlPrefix + 'PosX.png',
                urlPrefix + 'NegX.png',
                urlPrefix + 'PosY.png',
                urlPrefix + 'NegY.png',
                urlPrefix + 'PosZ.png',
                urlPrefix + 'NegZ.png'
            ];
            /*
            //THREE.ImageUtils.loadTexture
        CONFIG.skyboxTextureCube = texture_loader.loadCube(urls, {}, function(data){
            //CONFIG.skyboxTextureCube = data;//UTIL.getImageData(data);
            gameLoading.loadFinished();
        });
        */
    }
};