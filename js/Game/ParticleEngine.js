/**
 * @author Troy Ferrell & Yang Su
 */

function ParticleEngine(scene) {
    this.scene = scene;
    this.particles = null;

    // Generate all particles
    //this.generateParticles();

    // Set Shader Material Parameters
    this.attributes = {
        size: {type: 'f', value: []},
        ca:   {type: 'c', value: []}
    };


    this.uniforms = {
        amplitude: {type: 'f', value: 1.0 },
        color:     {type: 'c', value: CONFIG.white},
        texture:   {type: 't', value: 0, texture: CONFIG.particleTexture}
    };

    this.uniforms.texture.texture.wrapS = this.uniforms.texture.texture.wrapT = THREE.RepeatWrapping;

    this.shader = {
        vertexShader: [
            'attribute float size;',
            'attribute vec3 ca;',
            'varying vec3 vColor;',
            'void main() {',
                'vColor = ca;',
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
        attributes:     this.attributes,
        vertexShader:   this.shader.vertexShader,//document.getElementById('vertexshader').textContent,
        fragmentShader: this.shader.fragmentShader,//document.getElementById('fragmentshader').textContent,
        blending: THREE.AdditiveBlending,
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

    // remove all attributes from shaders????

    // Modify attributes of shader on per-particle basis
    var sizes = this.attributes.size.value,
        colors = this.attributes.ca.value;

    _.each(this.particles.vertices, function (vertex, v) {
        sizes[v] = 3;
        colors[v] = CONFIG.white;
        var value = Math.abs(vertex.z) / (CONFIG.viewDistance * 20);
        //colors[v].setHSV(0.55, 0.75, 1.0);
        // setHSV deprecated 
        var h = 0.55, s = 0.75, v = 1.0;
        colors[v].setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );
        
        //colors[v].setHSV(Math.random(), Math.random(), Math.random());
    });

    this.particleSystem = new THREE.ParticleSystem(this.particles, this.shaderMaterial);
    this.particleSystem.sortParticles = true;
    this.particleSystem.dynamic = true;

    this.scene.add(this.particleSystem);
};

ParticleEngine.prototype.generateParticles = function () {
     //- TODO: Transform to BufferGeometry with BufferedAttributes**8
     // http://threejs.org/docs/#Reference/Core/BufferGeometry
     this.particles = new THREE.Geometry();


    var theta, radius, pX, pY, pZ, particle;
    _.times(CONFIG.particleCount, UTIL.wrap(this, function () {
        theta = Math.random() * TWOPI;
        radius = Math.random() * 75 + CONFIG.tunnelRadius + 125;

        pX = radius * Math.cos(theta);
        pY = radius * Math.sin(theta);
        pZ = Math.random() * (-CONFIG.viewDistance * 20);

        particle = UTIL.v3c(pX, pY, pZ);
        particle.velocity = UTIL.v3(0, 0, Math.random());

        this.particles.vertices.push(particle);

        this.attributes.size.value.push(3);
        this.attributes.ca.value.push(CONFIG.white);
    }));

};

// Need to refactor code
ParticleEngine.prototype.update = function (particleSize) {
    var pCount = CONFIG.particleCount,
        particle;

    _.each(this.particles.vertices, function (particle, i) {
        // Adjust particle size
        this.attributes.size.value[i] = particleSize;

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
    this.attributes.size.needsUpdate = true;
};
