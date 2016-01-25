function MultipassMaterial(RENDERER, SCENE, CAMERA, TEXTURE, SHADERS) {

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


    this.buffers = [];
    this.init = function() {
        this.buffers[0] = new RenderBuffer(this.shader1, false);
        this.buffers[1] = new RenderBuffer(this.shader2, false);
        this.buffers[2] = new RenderBuffer(this.shader3, this.scene);

        this.extraBuffer = new THREE.WebGLRenderTarget(renderSize.x, renderSize.y);
        this.extraBuffer.texture.minFilter = THREE.LinearFilter;
        this.extraBuffer.texture.magFilter = THREE.LinearFilter;
        this.extraBuffer.texture.format = THREE.RGBAFormat;

        this.buffers[0].material.uniforms["BUF_A"].value = this.buffers[2].renderTarget;
        this.buffers[0].material.uniforms["BUF_B"].value = this.buffers[1].renderTarget;

        this.buffers[1].material.uniforms["INPUT"].value = this.texture;
        this.buffers[1].material.uniforms["BUF_A"].value = this.buffers[0].renderTarget;
        this.buffers[1].material.uniforms["BUF_B"].value = this.buffers[2].renderTarget;


        this.buffers[2].material.uniforms["BUF_B"].value = this.buffers[1].renderTarget;
    };

    this.resize = function() {
        for (var i = 0; i < this.buffers.length; i++) {
            this.buffers[i].renderTarget.setSize(renderSize.x, renderSize.y);
        }
    };

    this.update = function() {
        this.buffers[0].render(this.renderer, this.camera, true);
        this.buffers[1].render(this.renderer, this.camera, true);
        this.buffers[2].render(this.renderer, this.camera, false);
        this.swapBuffers();

    };
    this.swapBuffers = function() {
        var a = this.buffers[2].renderTarget;
        this.buffers[2].renderTarget = this.buffers[1].renderTarget;
        this.buffers[1].renderTarget = a;
    };
    this.setUniforms = function(UNIFORMS) {
        for(u in UNIFORMS){
            for (var i = 0; i < this.buffers.length; i++) {
                if (this.buffers[i].material.uniforms[u]) this.buffers[i].material.uniforms[u].value = UNIFORMS[u];                
            }
        }
        // this.buffers[0].material.uniforms["BUF_A"].value = this.buffers[1].renderTarget;
        // this.buffers[0].material.uniforms["BUF_B"].value = this.buffers[2].renderTarget;

        // this.buffers[1].material.uniforms["INPUT"].value = this.texture;
        // this.buffers[1].material.uniforms["BUF_A"].value = this.buffers[0].renderTarget;
        this.buffers[1].material.uniforms["BUF_B"].value = this.buffers[2].renderTarget;

        // this.buffers[2].material.uniforms["BUF_B"].value = this.buffers[1].renderTarget;
    };
    this.dispose = function() {
        for (var i = 0; i < this.buffers.length; i++) {
            this.buffers[i].dispose();
        }
        this.material.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };
}

function RenderBuffer(SHADER, SCENE) {
    if(SCENE){
        this.scene = SCENE;
    } else {
        this.scene = new THREE.Scene();
    }

    this.renderTarget, this.shader, this.material, this.geometry, this.mesh;
    this.initialize = function(SHADER) {
        this.renderTarget = new THREE.WebGLRenderTarget(renderSize.x, renderSize.y);
        this.renderTarget.texture.minFilter = THREE.LinearFilter;
        this.renderTarget.texture.magFilter = THREE.LinearFilter;
        this.renderTarget.texture.format = THREE.RGBAFormat;
        this.shader = SHADER;
        this.material = new THREE.ShaderMaterial({
            uniforms: this.shader.uniforms,
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader,
            side: THREE.DoubleSide
        });
        this.geometry = new THREE.PlaneGeometry(renderSize.x, renderSize.y);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
    };
    this.initialize(SHADER);
    this.render = function(RENDERER, CAMERA, TO_TARGET) {
        if(TO_TARGET){
            RENDERER.render(this.scene, CAMERA, this.renderTarget);            
        } else {
            RENDERER.render(this.scene, CAMERA);            
        }
    };
    this.dispose = function() {
        this.renderTarget.dispose();
        this.material.dispose();
        this.material.uniforms.texture.value.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };
}
