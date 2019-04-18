// PointLightedCube.js
// 顶点着色器程序
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +  // 法向量
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +  // 模型矩阵
    'uniform mat4 u_NormalMatrix;\n' +  // 用于变换法向量的矩阵
    'uniform vec3 u_LightColor;\n' +  // 光线颜色
    'uniform vec3 u_LightPosition;\n' +  // 光源位置
    'uniform vec3 u_AmbientLight;\n' +  // 环境光颜色
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +
        // 计算变换后的法向量并归一化
    '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
        // 计算顶点坐标
    '   vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
        // 计算光线方向并归一化
    '   vec3 lightPosition = normalize(vec3(u_LightPosition - vec3(vertexPosition)));\n' + 
        // 计算光线方向和法向量的点积
    '   float nNotL = max(dot(lightPosition, normal), 0.0);\n' +
        // 计算漫反射的颜色 
    '   vec3 diffuse = u_LightColor * a_Color.rgb * nNotL;\n' +
        // 计算环境光产生的反射光颜色
    '   vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
        // 将两者相加得到物体的最终颜色
    '   v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
    '}\n';

// 片元着色器程序
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
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
    // 设置顶点坐标和颜色
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    // 设置canvas的背景色并开启隐藏面消除
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // 获取变量的存储位置
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (u_MvpMatrix < 0 || u_ModelMatrix < 0 || u_NormalMatrix< 0 || u_LightColor < 0 || u_LightPosition < 0 || u_AmbientLight < 0) {
        console.log('Failed to get the storage location of u_MvpMatrix or u_ModelMatrix or u_NormalMatrix or u_LightColor or u_LightPosition or u_AmbientLight.');
        return;
    }

    // 设置光线颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // 设置光源位置
    gl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
    // 传入环境光颜色
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    var modelMatrix = new Matrix4();  // 模型矩阵
    var mvpMatrix = new Matrix4();  // 模型视图投影矩阵
    var normalMatrix = new Matrix4();  // 用来变换法向量的矩阵

    // 计算模型矩阵
    modelMatrix.setRotate(90, 0, 1, 0);  // 绕Y轴旋转
    // 将模型视图投影矩阵传递给u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    // 计算模型视图投影矩阵
    mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);
    // 将模型视图投影矩阵传递给u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // 根据模型矩阵计算用来变换法向量的矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    // 将变换法向量的矩阵传递给u_NormalMatrix变量
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // 清空颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_TEST);
    // 绘制立方体
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0 );
}

function initVertexBuffers(gl) {
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    var vertices = new Float32Array([  // 顶点坐标
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 前
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 右
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 上
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 左
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 下
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 后
     ]);
   
     var colors = new Float32Array([  // 颜色
       0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3
       0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5
       1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1
       1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2
       1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2
       0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5
     ]);
   
     var normals = new Float32Array([  // 法向量
       0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
       1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
       0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
       0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
       0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0
     ]);

     var indices = new Uint8Array([       // 顶点索引
        0, 1, 2,   0, 2, 3,    // 前
        4, 5, 6,   4, 6, 7,    // 右
        8, 9,10,   8,10,11,    // 上
       12,13,14,  12,14,15,    // 左
       16,17,18,  16,18,19,    // 下
       20,21,22,  20,22,23     // 后
     ]);

    // 创建缓冲区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // 将顶点坐标和颜色写入缓冲区对象
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
        return -1;

    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
        return -1;
    
    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal'))
        return -1;
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();   // 创建缓冲区对象
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // 将数据写入缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // 将缓冲区对象分配给attribute变量
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
  }