<template>
  <canvas id="canvas" width="500" height="500" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 立方体 颜色 透明度与 α 融合
 */
import { onMounted } from 'vue';
import { creatShaders } from '../hooks/use_init_shaders';
import { vertexBuffer } from '../hooks/use_vertex_buffer';

//顶点着色器源码
const onVertexShader = '' +
  'attribute vec4 apos;' +
  'attribute vec4 a_color;' +
  'varying vec4 v_color;' +
  'void main(){' +
  '   float angle=radians(30.0);' +
  '   float sinB=sin(angle);' +
  '   float cosB=cos(angle);' +
  '   mat4 mx=mat4(1,0,0,0,  0,cosB,-sinB,0,  0,sinB,cosB,0,  0,0,0,1);' +
  '   mat4 my=mat4(cosB,0,-sinB,0,  0,1,0,0,  sinB,0,cosB,0,  0,0,0,1);' +
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


var data = new Float32Array([
  // .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, -.5, .5, .5, .5, .5,        //面1
  // .5, .5, -.5, -.5, .5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, .5, -.5, -.5, .5, .5, -.5,  //面2
  // .5, .5, .5, .5, .5, -.5, .5, -.5, -.5, .5, -.5, -.5, .5, -.5, .5, .5, .5, .5,        //面3
  // -.5, .5, .5, -.5, .5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, .5, -.5, .5, .5,  //面4
  // .5, .5, .5, .5, .5, -.5, -.5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, .5, .5, .5,        //面5
  // .5, -.5, .5, .5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, -.5, .5, .5, -.5, .5,  //面6
  .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, .5, .5, .5, -.5, -.5, .5, .5, -.5, .5,      //面1
  .5, .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, .5, .5, .5, -.5, -.5, .5, .5, -.5,      //面2
  .5, .5, .5, .5, .5, -.5, -.5, .5, -.5, .5, .5, .5, -.5, .5, -.5, -.5, .5, .5,      //面3
  -.5, .5, .5, -.5, .5, -.5, -.5, -.5, -.5, -.5, .5, .5, -.5, -.5, -.5, -.5, -.5, .5,//面4
  -.5, -.5, -.5, .5, -.5, -.5, .5, -.5, .5, -.5, -.5, -.5, .5, -.5, .5, -.5, -.5, .5,//面5
  .5, -.5, -.5, -.5, -.5, -.5, -.5, .5, -.5, .5, -.5, -.5, -.5, .5, -.5, .5, .5, -.5 //面6
]);

var colorData = new Float32Array([
  // 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, //红色——面1
  // 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, //绿色——面2
  // 0, 1, 1, .6, 0, 1, 1, .6, 0, 1, 1, .6, 0, 1, 1, .6, 0, 1, 1, .6, 0, 1, 1, .6, //红色——面6
  // 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, //蓝色——面3
  // 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, //黄色——面4
  // 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, //黑色——面5
  1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, 1, 0, 0, .6, //红色——面1
  0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, 0, 1, 0, .6, //绿色——面2
  0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, 0, 0, 1, .6, //蓝色——面3
  1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, 1, 1, 0, .6, //黄色——面4
  0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, 0, 0, 0, .6, //黑色——面5
  1, 0, 1, .6, 1, 0, 1, .6, 1, 0, 1, .6, 1, 0, 1, .6, 1, 0, 1, .6, 1, 0, 1, .6, //粉色——面6
]);


// 传递数据
const transferData = (gl, dataSource, onVertexShader, onFragmentShader, aPosition, n) => {
  const program = creatShaders(gl, onVertexShader, onFragmentShader);
  gl.useProgram(program);
  gl.program = program;

  const aposLocation = gl.getAttribLocation(gl.program, aPosition);
  vertexBuffer(gl, dataSource, aposLocation, n);
}

const render = (gl, isEnableDepthTest = false) => {

  if (isEnableDepthTest) {
    /**执行绘制之前，一定要开启深度测试，以免颜色混乱**/
    gl.enable(gl.DEPTH_TEST);

    // 开启、设置α融合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  } else {
    //关闭深度缓冲区
    // gl.depthMask(false);
  }

  const isTriangle = true;
  if (isTriangle) {
    // 画三角形
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  } else {
    // 画线条
    gl.drawArrays(gl.LINE_LOOP, 0, 36);
  }
}

// 指定透明度：alpha  0-1
const getAlphaColor = (colorList, alpha) => {
  return colorList.map((i, index) => (index + 1) % 4 === 0 ? alpha : i);
}

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');
  gl.clearColor(0.0, 0.0, 0.0, 1);

  transferData(gl, data, onVertexShader, onFragmentShader, 'apos', 3)
  transferData(gl, colorData, onVertexShader, onFragmentShader, 'a_color', 4)
  render(gl, true);

  transferData(gl, data.map(i => i / 2 - .4), onVertexShader, onFragmentShader, 'apos', 3)
  transferData(gl, getAlphaColor(colorData, 1), onVertexShader, onFragmentShader, 'a_color', 4)
  render(gl);

  // 再画一个小一号的立方体
  transferData(gl, data.map(i => i / 2 + .4), onVertexShader, onFragmentShader, 'apos', 3)
  transferData(gl, getAlphaColor(colorData, 1), onVertexShader, onFragmentShader, 'a_color', 4)
  render(gl);
}

onMounted(onWebgl)
</script>
