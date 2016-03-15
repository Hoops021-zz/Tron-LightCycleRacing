/**
 * @author Troy Ferrell & Yang Su
 */
function Trail(scene, glowscene) {

    var loader = new THREE.TextureLoader();

    this.scene = scene;
    this.glowScene = glowscene;

    this.segmentMeshes = [];
    this.glowSegmentMeshes = [];
    this.oldestLiveSection = 0;

    var theta = CONFIG.playerPos.theta,
        z = CONFIG.playerPos.z,
        startBottomVertex = UTIL.v3(
            (CONFIG.playerPos.radius + CONFIG.trailHeight) * Math.cos(theta),
            (CONFIG.playerPos.radius + CONFIG.trailHeight) * Math.sin(theta),
            z
        ),
        startTopVertex = UTIL.v3(
            (CONFIG.playerPos.radius - CONFIG.trailHeight) * Math.cos(theta),
            (CONFIG.playerPos.radius - CONFIG.trailHeight) * Math.sin(theta),
            z
        ),
        startTunnelSegment = new TrailSegment(startTopVertex, startBottomVertex, CONFIG.playerPos);

    this.material = new THREE.MeshLambertMaterial({
        //map: THREE.ImageUtils.loadTexture('img/TrailTexture3.png'),
        map: loader.load("img/TrailTexture3.png"),
        //-transparent: true,
        reflectivity: 0.05
        // refractionRatio: 0.75
    });
    this.material.side = THREE.DoubleSide;

    this.glowMaterial = new THREE.MeshPhongMaterial({
        //map: THREE.ImageUtils.loadTexture('img/TrailTexture3_glow.png'),
        map: loader.load("img/TrailTexture3_glow.png"),
        //diffuse: 0x444444,
        //color: 0x000000
        color: 0x444444
    });

    this.lastSegment = startTunnelSegment;
}

Trail.prototype.update = function (playerPosition) {

    // generate new trail segment to fill gap created by player movement
    this.generateSegment(playerPosition);

    // delete any stale trail segments
    if (this.segmentMeshes.length - this.oldestLiveSection > CONFIG.trailLiveSections) {
        // Remove from scene
        this.scene.remove(this.segmentMeshes[this.oldestLiveSection]);
        // Remove from segmentMeshes
        delete this.segmentMeshes[this.oldestLiveSection];
        // Remove from glowscene
        this.glowScene.remove(this.glowSegmentMeshes[this.oldestLiveSection]);
        // Remove from glowSegmentMeshes
        delete this.glowSegmentMeshes[this.oldestLiveSection];
        // Move counter along
        this.oldestLiveSection += 1;
    }
};

Trail.prototype.reset = function () {

    // Remove any old mesh data from scenes
    _.each(this.segmentMeshes, function (mesh) {
        this.scene.remove(mesh);
    }, this);

    _.each(this.glowSegmentMeshes, function (glowMesh) {
        this.glowScene.remove(glowMesh);
    }, this);

    // Empty arrays for trail
    this.segmentMeshes = [];
    this.glowSegmentMeshes = [];
    this.oldestLiveSection = 0;

    var theta = CONFIG.playerPos.theta,
        z = CONFIG.playerPos.z,
        startBottomVertex = UTIL.v3(
            (CONFIG.playerPos.radius + CONFIG.trailHeight) * Math.cos(theta),
            (CONFIG.playerPos.radius + CONFIG.trailHeight) * Math.sin(theta),
            z
        ),
        startTopVertex = UTIL.v3(
            (CONFIG.playerPos.radius - CONFIG.trailHeight) * Math.cos(theta),
            (CONFIG.playerPos.radius - CONFIG.trailHeight) * Math.sin(theta),
            z
        ),
        startTunnelSegment = new TrailSegment(startTopVertex, startBottomVertex, CONFIG.playerPos);

    this.lastSegment = startTunnelSegment;
};

Trail.prototype.generateSegment = function (playerPosition) {
    // Add offset so the trail originates from the back
    playerPosition.z += CONFIG.trailMeshOffest;
    var newSegment = new TrailSegment(
            this.lastSegment.frontTopVertex,
            this.lastSegment.frontBottomVertex,
            playerPosition
        ),
        newMesh;
    this.lastSegment = newSegment;

    newMesh = new THREE.Mesh(newSegment.geometry, this.material);
    this.segmentMeshes.push(newMesh);
    this.scene.add(newMesh);

    newMesh = new THREE.Mesh(newSegment.geometry, this.glowMaterial);
    this.glowSegmentMeshes.push(newMesh);
    this.glowScene.add(newMesh);
};


function TrailSegment(lastVertexTop, lastVertexBottom, playerPosition) {

    this.geometry = new THREE.Geometry();
    this.geometry.dynamic = true;


    var theta = playerPosition.theta,
        z = playerPosition.z,
        face,
        faceuv;

    // Define forward two vertices
    this.frontBottomVertex =  UTIL.v3(
        (playerPosition.radius + CONFIG.trailHeight) * Math.cos(theta),
        (playerPosition.radius + CONFIG.trailHeight) * Math.sin(theta),
        z
    );
    this.frontTopVertex = UTIL.v3(
        (playerPosition.radius - CONFIG.trailHeight) * Math.cos(theta),
        (playerPosition.radius - CONFIG.trailHeight) * Math.sin(theta),
        z
    );

    // push vertices to three.js geoemetry
    this.geometry.vertices.push(
        this.frontBottomVertex,
        this.frontTopVertex,
        lastVertexTop,
        lastVertexBottom
    );


    //push 1 triangle
    triFace_1 = new THREE.Face3( 3, 2, 1);
    this.geometry.faces.push(triFace_1 );
    triFace_1.materialIndex = 0;

    //push another triangle
    triFace_2 = new THREE.Face3(3,  1, 0);
    this.geometry.faces.push(triFace_2);
    triFace_2.materialIndex = 0;

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

/*
    // Create face out of vertices & push
    face = new THREE.Face4(3, 2, 1, 0);
    this.geometry.faces.push(face);
    
    // Creates opposite face to cover the other side
    face = new THREE.Face4(0, 1, 2, 3);
    this.geometry.faces.push(face);

    // Configure UV Texturing coord data
    faceuv = [
        new THREE.Vector2(0, 1),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 1)
    ];

    // TODO: This is kind of a hack. fix later?
    //this.geometry.faceUvs[0].push(new THREE.Vector2(0, 1));
    //this.geometry.faceUvs[0].push(new THREE.Vector2(0, 1));
    this.geometry.faceVertexUvs[0].push(faceuv);
    this.geometry.faceVertexUvs[0].push(faceuv);*/
}

