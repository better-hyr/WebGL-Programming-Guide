// TexturedQuad.js

// 顶点着色器程序
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' + // 设置坐标
    '   v_TexCoord = a_TexCoord;\n' +
    '}\n';

// 片元着色器程序
var FSHADER_SOURCE = 
    'precision mediump float;\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' + // 设置颜色
    '}\n';

function main() {
    
    // 获取canvas元素
    var canvas = document.getElementById('webgl');

    // 获取webgl绘图上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // 设置顶点位置
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    // 配置纹理
    if (!initTextures(gl, n)) {
        console.log('Failed to initialize textures.');
        return;
    }

    // 设置canvas的背景色
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清空canvas
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制三角形
    // gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        // 顶点坐标和点的颜色
        -0.5, 0.5, 0.0, 1.0, 
        -0.5, -0.5, 0.0, 0.0, 
        0.5, 0.5, 1.0, 1.0, 
        0.5, -0.5, 1.0, 0.0
    ]);
    var n = 4;  // 点的个数

    // 创建缓冲区对象
    var verticesTexCoordBuffer = gl.createBuffer();
    if (!verticesTexCoordBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // 将顶点坐标和尺寸写入缓存区并开启
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    // 获取a_Position的存储位置，分配缓存区并开启
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*4, 0);
    gl.enableVertexAttribArray(a_Position);

    // 将纹理坐标分配给a_TexCoord并开启它
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return;
    }
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {

    var texture = gl.createTexture();  // 创建纹理对象
    if (!texture) {
        console.log('Failed to create the texture object');
        return -1;
    }

    // 获取u_Sampler的存储位置
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (u_Sampler < 0) {
        console.log('Failed to get the storage location of u_Sampler');
        return;
    }

    var image = new Image();  // 创建一个image对象
    if (!image) {
        console.log('Failed to create the image object');
        return -1;
    }
    image.crossorigin = true;

    // 注册图像加载事件的响应事件
    image.onload = function() {
        loadTexture(gl, n, texture, u_Sampler, image);
    };

    // 浏览器开始加载图像
    // image.src = 'https://baike.baidu.com/pic/%E5%B0%8F%E7%8E%8B%E5%AD%90/270/0/b8014a90f603738da4aecc1eb71bb051f819ec22?fr=lemma&ct=single#aid=0&pic=b8014a90f603738da4aecc1eb71bb051f819ec22';
    image.src = 'resource/hilltop.jpg';
    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // 对纹理图像进行y轴反转

    // 开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);

    // 向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // 将0号纹理传递给着色器
    gl.uniform1i(u_Sampler, 0);

    // 设置canvas的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清空 <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);  // 绘制矩阵
}
