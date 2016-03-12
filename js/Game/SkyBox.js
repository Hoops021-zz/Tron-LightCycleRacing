/**
 * @author Troy
 */

function SkyBox(scene) {
    this.scene = scene;

    /*
    // http://learningthreejs.com/data/lets_do_a_sky/docs/lets_do_a_sky.html
    var shader  = THREE.ShaderUtils.lib.cube,
        material = new THREE.ShaderMaterial({
            fragmentShader  : shader.fragmentShader,
            vertexShader    : shader.vertexShader,
            uniforms        : shader.uniforms
        });

    shader.uniforms.tCube.texture = CONFIG.skyboxTextureCube;

    this.skyboxMesh  = new THREE.Mesh(new THREE.CubeGeometry(100000, 100000, 100000, 1, 1, 1, null, true), material);
    this.skyboxMesh.flipSided = true;

    this.scene.add(this.skyboxMesh);
    */
    
    var texture_loader = new THREE.TextureLoader();

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

    //var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );   
    
    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            //map: THREE.ImageUtils.loadTexture( urls[i] ),
            map: texture_loader.load(urls[i]),
            side: THREE.BackSide
        }));

    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    //var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    this.skyboxMesh  = new THREE.Mesh(new THREE.CubeGeometry(100000, 100000, 100000, 1, 1, 1, null, true), skyMaterial);
    //this.skyboxMesh.flipSided = true;

    this.scene.add(this.skyboxMesh);
}

SkyBox.prototype.reset = function () {
    this.skyboxMesh.position.z = 0;
};

SkyBox.prototype.update = function () {
    this.skyboxMesh.position.z = window.levelProgress;
};