// LookAtRotatedTriangles.js

// 顶点着色器程序
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * u_ModelMatrix * a_Position;\n' + // 设置坐标
    '   v_Color = a_Color;\n' +
    '}\n';

// 片元着色器程序
var FSHADER_SOURCE = 
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' + // 设置颜色
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
    // 获取u_ViewMatrix和u_ModelMatrix变量的存储位置
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (u_ViewMatrix < 0) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    // 设置视点、视线、上方向
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    var modelMatrix = new Matrix4();
    modelMatrix.setRotate(-10, 0, 0, 1);
    // 将视图矩阵传递给u_ViewMatrix和u_ModelMatrix变量
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    // 设置canvas的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三角形
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
         0.0,  0.5, -0.4, 0.4, 1.0, 0.4,  // 绿色三角形在最后面 
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 
         0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 

         0.5,  0.4, -0.2, 1.0, 0.4, 0.4,  // 黄色三角形在中间 
        -0.5,  0.4, -0.2, 1.0, 1.0, 0.4, 
         0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 

         0.0,  0.5,  0.0, 0.4, 0.4, 1.0,  // 蓝色三角形在最前面
        -0.5, -0.5,  0.0, 0.4, 0.4, 1.0, 
         0.5, -0.5,  0.0, 1.0, 0.4, 0.4, 
    ]);
    var n = 9;  // 点的个数

    // 创建缓冲区对象
    var verticesColorBuffer = gl.createBuffer();
    if (!verticesColorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // 将顶点坐标和尺寸写入缓存区并开启
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // 获取a_Position的存储位置，分配缓存区并开启
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);
    // 获取a_Color的存储位置，分配缓存区并开启
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}