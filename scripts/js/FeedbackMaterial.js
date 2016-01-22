function FeedbackMaterial(RENDERER, SCENE, CAMERA, TEXTURE, SHADERS) {

    this.renderer = RENDERER;
    this.scene = SCENE;
    this.camera = CAMERA;
    this.texture = TEXTURE;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.mask, this.origTex;
    this.shader1 = SHADERS[0];
    this.shader2 = SHADERS[1];
    this.shader3 = SHADERS[2];
    this.outputShader = SHADERS[3];

    this.mesh;


    this.fbos = [];
    this.init = function() {
        this.fbos[0] = new FeedbackObject(this.shader1);
        this.fbos[0].material.uniforms.texture.value = this.texture;

        this.fbos[1] = new FeedbackObject(this.shader2);
        this.fbos[1].material.uniforms.texture2.value = this.texture;
        this.fbos[1].material.uniforms.texture.value = this.fbos[0].renderTarget;

        this.fbos[2] = new FeedbackObject(this.shader3);
        this.fbos[2].material.uniforms.texture.value = this.fbos[1].renderTarget;

        for (var i = 0; i < this.fbos.length; i++) {
            this.fbos[i].material.uniforms.resolution.value = new THREE.Vector2(renderSize.x, renderSize.y);
        }

        this.material = new THREE.ShaderMaterial({
            uniforms: this.outputShader.uniforms,
            vertexShader: this.outputShader.vertexShader,
            fragmentShader: this.outputShader.fragmentShader,
            transparent: true,
            side: 2
        });
        this.material.uniforms.texture.value = this.fbos[2].renderTarget;
        this.material.uniforms.texture.minFilter = this.material.uniforms.texture.magFilter = THREE.LinearFilter;
        this.material.uniforms.resolution.value = new THREE.Vector2(renderSize.x, renderSize.y);
        this.material.uniforms.mouse.value = new THREE.Vector2(renderSize.x, 0);

        this.geometry = new THREE.PlaneGeometry(2, 2, 0);

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
        this.fbos[0].material.uniforms.texture.value = this.fbos[1].renderTarget;
    };

    this.resize = function() {
        for (var i = 0; i < this.fbos.length; i++) {
            this.fbos[i].renderTarget.setSize(renderSize.x, renderSize.y);
        }
    };

    this.update = function() {
        this.fbos[1].render(this.renderer, this.camera);
        this.fbos[2].render(this.renderer, this.camera);
        this.fbos[2].material.uniforms.texture.value.needsUpdate = true;
    };
    this.expand = function(scl) {
        this.fbos[1].mesh.scale.set(scl, scl, scl);
    };
    this.scale = function(scl) {
        for (var i = 0; i < this.fbos.length; i++) {
            this.fbos[i].mesh.scale.set(scl, scl, scl);
        }
    };
    this.getNewFrame = function() {
        this.fbos[0].render(this.renderer, this.camera);
    };
    this.swapBuffers = function() {
        var a = this.fbos[2].renderTarget;
        this.fbos[2].renderTarget = this.fbos[0].renderTarget;
        this.fbos[0].renderTarget = a;
    };
    this.setUniforms = function(UNIFORMS) {
        for(u in UNIFORMS){
            for (var i = 0; i < this.fbos.length; i++) {
                if (this.fbos[i].material.uniforms[u]) this.fbos[i].material.uniforms[u].value = UNIFORMS[u];                
                if (this.material.uniforms[u]) this.material.uniforms[u].value = UNIFORMS[u];
            }
        }
        // for (var i = 0; i < this.fbos.length; i++) {
            // if (this.fbos[i].material.uniforms.time) this.fbos[i].material.uniforms.time.value = time;                
            // if (this.material.uniforms.time) this.material.uniforms.time.value = time;
            // if (this.fbos[i].material.uniforms.resolution) this.fbos[i].material.uniforms.resolution.value = new THREE.Vector2(renderSize.x, renderSize.y);
            // if (this.material.uniforms.resolution) this.material.uniforms.resolution.value = new THREE.Vector2(renderSize.x, renderSize.y);
            // if (this.fbos[i].material.uniforms.mouse) this.fbos[i].material.uniforms.mouse.value = new THREE.Vector2(mouse.x, mouse.y);
            // if (this.material.uniforms.mouse) this.material.uniforms.mouse.value = new THREE.Vector2(mouse.x, mouse.y);
        // }
    };
    this.dispose = function() {
        for (var i = 0; i < this.fbos.length; i++) {
            this.fbos[i].dispose();
        }
        this.material.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };
}

function FeedbackObject(SHADER) {
    this.scene = new THREE.Scene();
    this.renderTarget, this.shader, this.material, this.geometry, this.mesh;
    this.initialize = function(SHADER) {
        this.renderTarget = new THREE.WebGLRenderTarget(renderSize.x, renderSize.y, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });
        this.shader = SHADER;
        this.material = new THREE.ShaderMaterial({
            uniforms: this.shader.uniforms,
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader
        });
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
    };
    this.initialize(SHADER);
    this.render = function(RENDERER, CAMERA) {
        RENDERER.render(this.scene, CAMERA, this.renderTarget, true);
    };
    this.dispose = function() {
        this.renderTarget.dispose();
        this.material.dispose();
        this.material.uniforms.texture.value.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };
}
