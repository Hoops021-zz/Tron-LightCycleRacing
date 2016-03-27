  /**
 * @author Troy Ferrell & Yang Su
 */

function Tunnel(scene, obstacles) {

    var loader = new THREE.TextureLoader();

    this.scene = scene;
    this.obstacles = obstacles;

    this.segments = [];
    this.sections = [];

    // Index used to delete segments from the scene
    this.oldestLiveSection = 0;
    this.imagePosition = 0;

    var j,
        tunnelRing,
        startZ;
    // texture.wrapT = THREE.RepeatWrapping;
    this.imageData = CONFIG.tunnelMapData;
    this.width = this.imageData.height;

    this.material = [
        new THREE.MeshLambertMaterial({
            //map: THREE.ImageUtils.loadTexture('img/TunnelTexture5.png'),
            map: loader.load("img/TunnelTexture5.png"),
            transparent : true
        }),
        new THREE.MeshLambertMaterial({
            color: 0x000000,
            opacity: 0.1,
            //shading: THREE.FlatShading
        }),
        new THREE.MeshFaceMaterial()
    ];

    this.lights = [];
    startZ = -CONFIG.tunnelSegmentPerSection * CONFIG.tunnelSegmentDepth;
    for (j = 0; j < 3; j += 1) {
        tunnelRing = new LightRing(this.scene, startZ - CONFIG.viewDistance * j);
        this.lights.push(tunnelRing);
    }
}

Tunnel.prototype.reset = function () {
    // remove all stuff from scenes
    _.each(this.sections, function (section) {
        this.scene.remove(section);
    }, this);

    _.each(this.lights, function (lightring) {
        lightring.removeAllLights();
    }, this);

    // Clear arrays
    this.segments = [];
    this.sections = [];
    this.lights = [];

    var startZ = -CONFIG.tunnelSegmentPerSection * CONFIG.tunnelSegmentDepth,
        j;
    for (j = 0; j < 3; j += 1) {
        tunnelRing = new LightRing(this.scene, startZ - CONFIG.viewDistance * j);
        this.lights.push(tunnelRing);
    }

    // Index used to delete segments from the scene
    this.oldestLiveSection = 0;
    this.imagePosition = 0;
};

Tunnel.prototype.update = function () {
    // Dynamic tunnel generation based on player position
    if (this.segments.length * CONFIG.tunnelSegmentDepth <
            Math.abs(window.levelProgress) + CONFIG.viewDistance) {

        this.generateSection(-this.segments.length * CONFIG.tunnelSegmentDepth);

        if (this.sections.length - this.oldestLiveSection > CONFIG.tunnelLiveSections) {
            // Remove from scene
            this.scene.remove(this.sections[this.oldestLiveSection]);
            // Remove from sections
            delete this.sections[this.oldestLiveSection];
            // Move counter along
            this.oldestLiveSection += 1;
        }
    }

    var firstLightRing = this.lights[0],
        lastLightRing = this.lights[this.lights.length - 1];

    if (Math.abs(firstLightRing.z) < Math.abs(window.levelProgress) - CONFIG.viewDistance) {
        firstLightRing.repositionLightRing(lastLightRing.z - CONFIG.viewDistance);
        this.lights.splice(0, 1); // remove first element
        this.lights.push(firstLightRing); // add first element to element
    }

    _.each(this.lights, function (light) {
                 
        light.update();
                
    });
   
};

Tunnel.prototype.generateSection = function (startZ) {
    
    var i = 0,
        column = this.imagePosition,
        newSegment = new TunnelSegment(
            startZ,
            this.material,
            UTIL.getColumn(this.imageData, column),
            this.obstacles
        ),
        geometry = newSegment.geometry,
        newMesh;

    this.segments.push(newSegment);

    for (i = 1; i < CONFIG.tunnelSegmentPerSection; i += 1) {
        newSegment = new TunnelSegment(
            startZ - i * CONFIG.tunnelSegmentDepth,
            this.material,
            UTIL.getColumn(this.imageData, column + i),
            this.obstacles
        );
        this.segments.push(newSegment);

        // Merge with geometry
        //+THREE.GeometryUtils.merge(geometry, newSegment.geometry);
        geometry.merge(newSegment.geometry);
    }

    // Create a single mesh

    newMesh = new THREE.Mesh(geometry, this.material[0]);//+this.material[this.material.length - 1]);
    this.sections.push(newMesh);
    this.scene.add(newMesh);

    this.imagePosition += CONFIG.tunnelSegmentPerSection;
    if (this.imagePosition >= this.imageData.width) {
        // End level here, wrap map for now
        this.imagePosition = 0;
    }

    // TODO avoid using globals. Probably need to implement an event system
    if (Math.abs(startZ) >= CONFIG.viewDistance * 0.9 &&
        myGame.player.position.z === CONFIG.playerPos.z) {
        // Finished generating all tunnel sections in sight initially
        myGame.player.targetVelocity = CONFIG.playerDefaulTargetVel.clone();
    }
};

Tunnel.prototype.getFace = function (i, j) {
    if (i < this.segments.length && i >= this.oldestLiveSection) {
        return this.segments[i].getFace(j);
    } else {
        console.log('Error: Tunnel getFace(' + i + ',' + j + ') index out of bounds');
        return null;
    }
};

function TunnelSegment(startZ, materials, imageData, obstacles) {
    this.geometry = new THREE.Geometry();
    this.geometry.dynamic = true;
    this.geometry.materials = materials;
    this.faces = new Array(imageData.length * 2); // two triangles to a face

    // var deltaTheta = 2 * Math.PI / CONFIG.tunnelResolution,
    var deltaTheta = 2 * Math.PI / imageData.length,
        radius = CONFIG.tunnelRadius,
        depth = CONFIG.tunnelSegmentDepth,
        width = deltaTheta * radius,
        //face,
        triFace_1,
        triFace_2,
        faceuv,
        theta,
        rcos,
        rsin,
        rcosd,
        rsind,
        color,
        temp,
        i,
        squareCount = 0;

    // dynamically create quads for tunnel segment
    for (i = 0, theta = 0; theta < 2 * Math.PI; theta += deltaTheta, i += 1) {
        color = imageData[i];
        // TODO: temporary hack need to add in structure to create different tiles
        if (color.r + color.g + color.b > 10) {
            rcos = radius * Math.cos(theta);
            rsin = radius * Math.sin(theta);
            rcosd = radius * Math.cos(theta + deltaTheta);
            rsind = radius * Math.sin(theta + deltaTheta);

            if (color.r === CONFIG.GRAYVAL && color.g === CONFIG.GRAYVAL && color.b === CONFIG.GRAYVAL) { //
                var altradius = radius - CONFIG.boxObstacleHeight / 2,
                    pos = UTIL.v3c(altradius, theta + deltaTheta / 2, startZ - depth / 2);
                obstacles.add(pos, CONFIG.boxObstacleHeight, width, depth * 0.8);
            }

            // Create vertices for current quad in cylinder segment

            this.geometry.vertices.push(
                UTIL.v3(rcos, rsin, startZ),
                UTIL.v3(rcos, rsin, startZ - depth),
                UTIL.v3(rcosd, rsind, startZ - depth),
                UTIL.v3(rcosd, rsind, startZ)
            );

            // Define normals to point inward
            temp = squareCount * 4;
            squareCount++;

            /*
            temp = this.geometry.faces.length * 4;

            face = new THREE.Face4(
                temp + 3, //0 
                temp + 2, //1
                temp + 1, // 2
                temp // 3
            );
            face.materialIndex = 0;
            this.geometry.faces.push(face);
            this.faces[i] = face;

            //push 1 triangle
            square.faces.push( new THREE.Face3( 0,1,2) );

            //push another triangle
            square.faces.push( new THREE.Face3( 0,3,2) );
            */

            //push 1 triangle
            triFace_1 = new THREE.Face3( temp + 3, temp + 2, temp + 1);
            this.geometry.faces.push(triFace_1 );
            triFace_1.materialIndex = 0;

            //push another triangle
            triFace_2 = new THREE.Face3( temp + 3, temp + 1, temp);
            this.geometry.faces.push(triFace_2);
            triFace_2.materialIndex = 0;

            this.faces[i*2] = triFace_1;
            this.faces[i*2 + 1] = triFace_2;
            /*
            // Configure UV Texturing coord data
            faceuv = [
                new THREE.Vector2(0, 1),
                new THREE.Vector2(1, 1),
                new THREE.Vector2(1, 0),
                new THREE.Vector2(0, 0)
            ];
            
            //this.geometry.faceUvs[0].push(new THREE.Vector2(0, 1));
            this.geometry.faceVertexUvs[0].push(faceuv);
            */

            this.geometry.faceVertexUvs[ 0 ].push( [ new THREE.Vector2( 0, 1 ), 
                new THREE.Vector2( 0, 0 ), 
                new THREE.Vector2( 1, 0 ) ] );

            this.geometry.faceVertexUvs[ 0 ].push( [ new THREE.Vector2( 0, 1 ), 
                new THREE.Vector2( 1, 0 ), 
                new THREE.Vector2( 1, 1 ) ] );
        }
    }

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
}

TunnelSegment.prototype.getFace = function (i) {
    if (i < this.faces.length && i >= 0) {
        return this.faces[i];
    } else {
        console.log('Error: TunnelSegment getFace(' + i + ') index out of bounds');
        return null;
    }
};