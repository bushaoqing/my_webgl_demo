<template>
  <canvas id="canvas" width="500" height="500" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 旋转的立方体（x轴平移）
 */
import { onMounted } from 'vue';
import { initShaders } from '../hooks/use_init_shaders';

//顶点着色器源码
const onVertexShader = '' +
  'attribute vec4 apos;' +
  'attribute vec4 a_color;' +
  'uniform mat4 mx;' +
  'uniform mat4 my;' +
  'uniform mat4 tx;' +
  'varying vec4 v_color;' +
  'void main(){' +
  // '   mat4 tx = mat4(1,0,0,0,  0,1,0,0,  0,0,1,0,  -0.4,0,0,1);' +
  // '   gl_Position=tx*mx*my*apos;' +
  '   gl_Position=mx*my*apos;' +
  '   v_color = a_color;' +
  '}';

//片元着色器源码
const onFragmentShader = '' +
  'precision lowp float;' +
  'varying vec4 v_color;' +
  'void main(){' +
  '   gl_FragColor=v_color;' +
  '}';

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');
  initShaders(gl, onVertexShader, onFragmentShader);


  /**
   * 创建顶点位置数据数组data,Javascript中小数点前面的0可以省略
   **/
  let data = new Float32Array([
    .2, .2, .2, -.2, .2, .2, -.2, -.2, .2, .2, .2, .2, -.2, -.2, .2, .2, -.2, .2,      //面1
    .2, .2, .2, .2, -.2, .2, .2, -.2, -.2, .2, .2, .2, .2, -.2, -.2, .2, .2, -.2,      //面2
    .2, .2, .2, .2, .2, -.2, -.2, .2, -.2, .2, .2, .2, -.2, .2, -.2, -.2, .2, .2,      //面3
    -.2, .2, .2, -.2, .2, -.2, -.2, -.2, -.2, -.2, .2, .2, -.2, -.2, -.2, -.2, -.2, .2,//面4
    -.2, -.2, -.2, .2, -.2, -.2, .2, -.2, .2, -.2, -.2, -.2, .2, -.2, .2, -.2, -.2, .2,//面5
    .2, -.2, -.2, -.2, -.2, -.2, -.2, .2, -.2, .2, -.2, -.2, -.2, .2, -.2, .2, .2, -.2, //面6

    .2, .2, .2, -.2, .2, .2, -.2, -.2, .2, .2, .2, .2, -.2, -.2, .2, .2, -.2, .2,      //面1
    .2, .2, .2, .2, -.2, .2, .2, -.2, -.2, .2, .2, .2, .2, -.2, -.2, .2, .2, -.2,      //面2
    .2, .2, .2, .2, .2, -.2, -.2, .2, -.2, .2, .2, .2, -.2, .2, -.2, -.2, .2, .2,      //面3
    -.2, .2, .2, -.2, .2, -.2, -.2, -.2, -.2, -.2, .2, .2, -.2, -.2, -.2, -.2, -.2, .2,//面4
    -.2, -.2, -.2, .2, -.2, -.2, .2, -.2, .2, -.2, -.2, -.2, .2, -.2, .2, -.2, -.2, .2,//面5
    .2, -.2, -.2, -.2, -.2, -.2, -.2, .2, -.2, .2, -.2, -.2, -.2, .2, -.2, .2, .2, -.2, //面6
  ]);

  for (let i = 18 * 6; i < 18 * 12; i += 3) {
    data[i] += 0.5;
  }

  //创建缓冲区对象
  const buffer = gl.createBuffer();
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
  const aposLocation = gl.getAttribLocation(gl.program, 'apos');
  //缓冲区中的数据按照一定的规律传递给位置变量apos
  gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0);
  //允许数据传递
  gl.enableVertexAttribArray(aposLocation);


  /**
   * border上色
   * 创建顶点位置数据数组data，存储两个顶点(-0.2,0.5、(0.2,0.2)
   * 创建顶点颜色数组colorData，存储两个顶点对应RGB颜色值(0,0,1)、(1,0,0)
   **/
  const colorData = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,//红色——面1
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//绿色——面2
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//蓝色——面3
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,//黄色——面4
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,//黑色——面5
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, //白色——面6

    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,//红色——面1
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//绿色——面2
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//蓝色——面3
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,//黄色——面4
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,//黑色——面5
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, //白色——面6
  ]);
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

  const a_color = gl.getAttribLocation(gl.program, 'a_color');
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_color);


  gl.clearColor(0, 0, 0, .1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  /**执行绘制之前，一定要开启深度测试，以免颜色混乱**/
  gl.enable(gl.DEPTH_TEST);


  // x轴平移 -0.4
  const txArr = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -.4, 0, 0, 1
  ]);
  const tx = gl.getUniformLocation(gl.program, 'tx');
  gl.uniformMatrix4fv(tx, false, txArr);


  /**
   * 定义绘制函数draw()，定时更新旋转矩阵数据，并调用WebGL绘制API
   ***/
  /**从program对象获得旋转矩阵变量mx、my地址**/
  const mx = gl.getUniformLocation(gl.program, 'mx');
  const my = gl.getUniformLocation(gl.program, 'my');
  let angle = Math.PI / 4;//起始角度
  function draw() {
    console.log(angle)
    if (angle > 5) return;

    //清空画布上一帧图像
    gl.clear(gl.COLOR_BUFFER_BIT);

    //立方体绕y轴旋转
    angle += 0.05;//每次渲染角度递增，每次渲染不同的角度
    const sinB = Math.sin(angle);//旋转角度正弦值
    const cosB = Math.cos(angle);//旋转角度余弦值
    const myArr = new Float32Array([
      cosB, 0, -sinB, 0,
      0, 1, 0, 0,
      sinB, 0, cosB, 0,
      0, 0, 0, 1
    ]);
    gl.uniformMatrix4fv(my, false, myArr);

    //立方体绕x轴旋转
    const mxArr = new Float32Array([
      1, 0, 0, 0,
      0, cosB, -sinB, 0,
      0, sinB, cosB, 0,
      0, 0, 0, 1
    ]);
    gl.uniformMatrix4fv(mx, false, mxArr);

    requestAnimationFrame(draw);

    /**执行绘制命令**/
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.drawArrays(gl.TRIANGLES, 36, 36);
  }
  draw();
}

const onCanvas = () => {
  const canvas = document.getElementById('canvas');

  //通过方法getContext()获取Canvas 2D绘图上下文
  const c = canvas.getContext('2d');
  c.moveTo(10, 50);//直线起点坐标
  c.lineTo(50, 50);//直线第2个点坐标
  c.lineTo(50, 100);//直线第2个点坐标
  c.lineTo(10, 100);//直线第3个点坐标
  c.lineTo(10, 50);//直线第1个点坐标
  c.stroke();//把点连成直线绘制出来
}

const init = () => {
  const bool = 0;

  if (bool) {

    // canvas
    onCanvas();
  } else {

    // webGl
    onWebgl();
  }
}

onMounted(init)
</script>
