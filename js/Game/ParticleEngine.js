/**
 * @author Troy Ferrell & Yang Su
 */

function ParticleEngine(scene) {
    this.scene = scene;
    this.particlesGeometry = null;

    // Set Shader Material Parameters
    /*
    this.attributes = {
        size: {type: 'f', value: []},
        ca:   {type: 'c', value: []}
    };*/

    this.uniforms = {
        amplitude: {type: 'f', value: 1.0 },
        color:     {type: 'c', value: CONFIG.white},
        texture:   {type: 't', value: 0, texture: CONFIG.particleTexture}
    };

    this.uniforms.texture.texture.wrapS = this.uniforms.texture.texture.wrapT = THREE.RepeatWrapping;

    this.shader = {
        vertexShader: [
            'attribute float size;',
            'attribute vec3 customColor;',
            'varying vec3 vColor;',
            'void main() {',
                'vColor = customColor;',
                'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
                'gl_PointSize = size;',
                'gl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),

        fragmentShader: [
            'uniform vec3 color;',
            'uniform sampler2D texture;',
            'varying vec3 vColor;',
            'void main() {',
                //'gl_FragColor = vec4(color, 1.0);',
                'gl_FragColor = vec4(color*vColor, 1.0);',
                'gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);',
            '}'
        ].join('\n')
    };

    this.shaderMaterial = new THREE.ShaderMaterial({
        uniforms:       this.uniforms,
        //attributes:     this.attributes,
        vertexShader:   this.shader.vertexShader,//document.getElementById('vertexshader').textContent,
        fragmentShader: this.shader.fragmentShader,//document.getElementById('fragmentshader').textContent,
        blending: THREE.AdditiveBlending,
        //depthTest: false,
        transparent: true
    });

    this.reset();
}

ParticleEngine.prototype.reset = function () {
    if (this.particleSystem) {
        this.scene.remove(this.particleSystem);
        this.particleSystem = null;
    }

    this.generateParticles();

/*
    // Modify attributes of shader on per-particle basis
    var sizes = this.particlesGeometry.attributes.size.array,
        colors = this.particlesGeometry.attributes.customColor.array;

    _.each(this.particlesGeometry.vertices, function (vertex, v) {
        sizes[v] = 3;
        colors[v] = CONFIG.white;
        var value = Math.abs(vertex.z) / (CONFIG.viewDistance * 20);
        //colors[v].setHSV(0.55, 0.75, 1.0);
        // setHSV deprecated 
        var h = 0.55, s = 0.75, v = 1.0;
        colors[v].setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );
        
        //colors[v].setHSV(Math.random(), Math.random(), Math.random());
    });*/

/*
    this.particleSystem = new THREE.ParticleSystem(this.particlesGeometry, this.shaderMaterial);
    this.particleSystem.sortParticles = true;
    this.particleSystem.dynamic = true;
*/

    this.particleSystem = new THREE.Points( this.particlesGeometry, this.shaderMaterial );

    this.scene.add(this.particleSystem);
};

ParticleEngine.prototype.generateParticles = function () {
     //- TODO: Transform to BufferGeometry with BufferedAttributes**8
     // http://threejs.org/docs/#Reference/Core/BufferGeometry
     this.particlesGeometry = new THREE.BufferGeometry();

    var positions = new Float32Array( CONFIG.particleCount * 3 );
    var colors = new Float32Array( CONFIG.particleCount * 3 );
    var sizes = new Float32Array( CONFIG.particleCount );

    var theta, radius, pX, pY, pZ, particle, particleColor = new THREE.Color();

    var h = 0.55, s = 0.75, v = 1.0;
    particleColor.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );
    
    for ( var i = 0; i < CONFIG.particleCount; i ++ ) {

        var position = generateRandomParticlePosition();

        //-particle = UTIL.v3(pX, pY, pZ);
        //-particle.velocity = UTIL.v3(0, 0, Math.random());

        positions[ i*3 + 0 ] = position.x;
        positions[ i*3 + 1 ] = position.y;
        positions[ i*3 + 2 ] = position.z;

        colors[ i*3 + 0 ] = particleColor.r;
        colors[ i*3 + 1 ] = particleColor.g;
        colors[ i*3 + 2 ] = particleColor.b;

        sizes[ i ] = 3;
    }

    this.particlesGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    this.particlesGeometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    this.particlesGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
};

// Need to refactor code
ParticleEngine.prototype.update = function (particleSize) {

    for ( var i = 0; i < CONFIG.particleCount; i ++ ) {
        this.particlesGeometry.attributes.size.array[i] = particleSize;

        var particle_z = this.particlesGeometry.attributes.position.array[ i*3 + 2 ];

        // If the particle is behind the player(aka no longer seen), then reset particle ahead
        //if(particle_z > window.levelProgress)
        if (Math.abs(particle_z) < Math.abs(window.levelProgress)) 
        {
            //this.particlesGeometry.attributes.position.array[ i*3 + 2 ] += window.levelProgress;
            this.particlesGeometry.attributes.position.array[ i*3 + 2 ] = window.levelProgress - CONFIG.viewDistance * 20;
        }
    }

    /*
        var pCount = CONFIG.particleCount,
        particle;

    _.each(this.particlesGeometry.vertices, function (particle, i) {
        // Adjust particle size
        this.particlesGeometry.attributes.size.array[i] = particleSize;

        // check if we need to reset
        if (Math.abs(particle.position.z) < Math.abs(window.levelProgress)) {
            particle.position.z = window.levelProgress - CONFIG.viewDistance * 20;
            particle.velocity.z = 0;
        }

        // update the velocity with a splat of randomniz
        particle.velocity.z += Math.random() * 0.1;

        // and the position
        particle.position.addSelf(particle.velocity);
    }, this);

    // flag to the particle system
    // that we've changed its vertices.
    this.particleSystem.geometry.__dirtyVertices = true;
    this.particleSystem.geometry.verticesNeedUpdate = true;
    */

    this.particlesGeometry.attributes.size.needsUpdate = true;
    this.particlesGeometry.attributes.position.needsUpdate = true;
};

function generateRandomParticlePosition()
{
    var theta = Math.random() * TWOPI;
    var radius = Math.random() * 75 + CONFIG.tunnelRadius + 125;

    var pX = radius * Math.cos(theta);
    var pY = radius * Math.sin(theta);
    var pZ = Math.random() * (-CONFIG.viewDistance * 20);

    return UTIL.v3(pX, pY, pZ);
}
