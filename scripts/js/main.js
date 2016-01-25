var isMobile = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))isMobile = true})(navigator.userAgent||navigator.vendor||window.opera);
var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) {

    console.log( item, loaded, total );

};
var container = document.getElementById('container');
var renderSize;
var PATH = './assets/';
var mouse = new THREE.Vector2(0.008333333333333304, -0.6313725490196078);
var cameraMouse = new THREE.Vector2(0.0,0.0);
var time = 0.0;
var id;
var scene, camera, renderer, texture, mMaterial;
var debounceResize;
var textureLoader = new THREE.TextureLoader(manager);
var objLoader = new THREE.OBJLoaderGEO(manager);
// var capturer = new CCapture( { framerate: 60, format: 'webm', workersPath: 'js/' } );
var FRAME = 0;
var loadedItems = 0;
var shaders, uniforms;
var matcapMaterial;
var alphaTex = textureLoader.load(PATH + "textures/t-alpha3.jpg", checkLoading);
var texture = textureLoader.load(PATH + "textures/fire.jpg", checkLoading)
var TRAVIS;
var loadedPercent = document.getElementById("loadedPercent");
var loader = document.getElementById("loader");
function checkLoading(){
    ++loadedItems;
    if(loadedItems >= 2){
        objLoader.load(PATH + "models/newpose.obj", function(object) {

            TRAVIS = object;
            loader.style.display = "none";
            init();

        }, onProgress, onError);
    }
}


function init() {
    setRenderSize();

    scene = new THREE.Scene();
    // camera = new THREE.Camera();
    // camera = new THREE.Orthograph();
    // camera.position.z = 1;
    // camera = new THREE.PerspectiveCamera( 45, renderSize.x / renderSize.y, 0.01, 100000 );
    camera = new THREE.OrthographicCamera( renderSize.x / - 2, renderSize.x / 2, renderSize.y / 2, renderSize.y / - 2, 0.01, 10000  );
    camera.position.set(0,0,1000);
    // controls = new THREE.OrbitControls(camera);



    renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        antialias: true
    });
    renderer.setSize(renderSize.x, renderSize.y);
    renderer.setClearColor(0x000000, 1.0);
   
    createMultipassMaterial();
    // createTravis();

    debounceResize = debounce(onWindowResize, 250);
    window.addEventListener("resize", debounceResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener('touchstart', onDocumentTouchStart, false);
    window.addEventListener('touchdown', onDocumentTouchStart, false);
    window.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('keydown', function(){screenshot(renderer)}, false);

    container.appendChild(renderer.domElement);

    animate();
}

function createMultipassMaterial(){
    
    // texture = textureLoader.load("../multipass/assets/textures/clouds.jpg", function(){
        shaders = [
            new AShader(),
            new BShader(),
            new OUTPUTShader(),
        ]
        uniforms = {
            "FRAME": 0.0,
            "mouse": mouse,
            "resolution": renderSize,
            "time": 0.0,
            "alpha":alphaTex
        }
        mMaterial = new MultipassMaterial(renderer, scene, camera, texture, shaders);
        mMaterial.init();
        mMaterial.setUniforms(uniforms);
        matcapMaterial = new THREE.ShaderMaterial({
        
            uniforms: { 
                tNormal:{type: 't', value: null },
                tMatCap:{type: 't', value: null },
                time:{type: 'f', value: 0 },
                bump:{type: 'f', value: 0 },
                noise:{type: 'f', value: .04 },
                repeat:{type: 'v2', value: new THREE.Vector2( 1, 1 ) },
                useNormal:{type: 'f', value: 0 },
                useRim:{type: 'f', value: 1 },
                rimPower:{type: 'f', value: 2 },
                useScreen:{type: 'f', value: 0 },
                normalScale:{type: 'f', value: .5 },
                normalRepeat:{type: 'f', value: 1 },
                rimTexture: {type: 't', value: mMaterial.buffers[2].renderTarget}
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
            // wrapping: THREE.ClampToEdgeWrapping,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide
            
        } );

        TRAVIS.traverse(function(child) {

            if (child instanceof THREE.Mesh) {
                child.material = matcapMaterial;
                child.geometry.computeVertexNormals();
                child.geometry.mergeVertices();
            }
        });
        TRAVIS.scale.x = TRAVIS.scale.y = TRAVIS.scale.z = 2.0;
        // object.position.copy(params.position);
        TRAVIS.position.set(0,0,100);
        // object.rotation.copy(params.rotation);

        scene.add(TRAVIS);
        // matcapMaterial.uniforms.tMatCap.value.wrapS = matcapMaterial.uniforms.tMatCap.value.wrapT = 
        // THREE.ClampToEdgeWrapping;
        // 
        // matcapMaterial.uniforms.tNormal.value.wrapS = matcapMaterial.uniforms.tNormal.value.wrapT = 
        // THREE.RepeatWrapping;
}

function createTravis(){
    
}
function onProgress(xhr) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        // console.log( Math.round(percentComplete, 2) + '% downloaded' );
        loadedPercent.innerHTML = Math.round(percentComplete, 2);
    }

};
function onError(xhr) {};

function animate() {
    id = requestAnimationFrame(animate);
    draw();
}

function draw() {
    render();
}
function render(){
    time += 0.01;
    uniforms["time"] = time;    
    uniforms["FRAME"] += 1.0;    
    uniforms["mouse"].x = 0.001388888888888884;
    uniforms["mouse"].y = 0.35686274509803917; 

    mMaterial.update();
    mMaterial.setUniforms(uniforms);

    matcapMaterial.uniforms["rimTexture"].value = mMaterial.buffers[2].renderTarget;

    camera.position.x = (camera.position.x - cameraMouse.x)*0.05;
    camera.position.y = (-camera.position.y - cameraMouse.y)*0.05;
    camera.lookAt(scene.position);

    // capturer.capture( renderer.domElement );
}

function onMouseMove(event) {
    mouse.x = (event.clientX / renderSize.x) * 2 - 1;  
    // mouse.x = Math.random()*2 - 1;          
    mouse.y = -(event.clientY / renderSize.y) * 2 + 1;
    // mouse.y = Math.random()*2 - 1;       

    cameraMouse.x = ( event.clientX - renderSize.x/2 )*4;
    cameraMouse.y = ( event.clientY - renderSize.y/2 )*4;


}

function onMouseDown() {

}

function onDocumentTouchStart(event) {
    updateMouse(event);
}

function onDocumentTouchMove(event) {
    updateMouse(event);
}

function updateMouse(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouse.x = (event.touches[0].pageX / renderSize.x) * 2 - 1;
        mouse.y = -(event.touches[0].pageY / renderSize.y) * 2 + 1;
    }
}

function onWindowResize(event) {
    setRenderSize();
    renderer.setSize(renderSize.x, renderSize.y);
}

function setRenderSize(){
    renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
}
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function screenshot(renderer) {
    if (event.keyCode == "32") {
        grabScreen(renderer);

        function grabScreen(renderer) {
            var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);

            }
        }
        function dataURItoBlob(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
    if (event.keyCode == "82") {
        // capturer.start();
    }
    if (event.keyCode == "84") {
        // capturer.stop();
        // capturer.save(function(blob) {
            // window.location = blob;
            // window.open(blob);
            // console.log(blob);
        // });
    }
}