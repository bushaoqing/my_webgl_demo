<template>
  <canvas id="canvas" width="500" height="500" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 三角形 颜色 透明度与 α 融合
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
  '   gl_Position=apos;' +
  '   v_color = a_color;' +
  '}';

//片元着色器源码
const onFragmentShader = '' +
  'precision lowp float;' +
  'varying vec4 v_color;' +
  'void main(){' +
  '   gl_FragColor=v_color;' +
  '}';

/**
创建顶点位置数据数组data，存储6个顶点
创建顶点颜色数组colorData，存储6个顶点对应RGB颜色值
**/
var data = new Float32Array([
  -0.5, 0.5, 0.5, 0.5, 0.5, -0.5,//红色三角形的三个顶点
  -0.7, 0.3, 0.3, 0.3, 0.3, -0.7,//绿色三角形的三个顶点
  -0.3, 0.7, 0.7, 0.7, 0.7, -0.3//蓝色三角形的三个顶点
]);
var colorData = new Float32Array([
  //红色顶点，透明度0.7
  1, 0, 0, .6,
  1, 0, 0, .6,
  1, 0, 0, .6,
  // //绿色顶点，透明度0.7
  0, 1, 0, .5,
  0, 1, 0, .5,
  0, 1, 0, .5,
  // //蓝色顶点，透明度0.7
  0, 0, 1, .4,
  0, 0, 1, .4,
  0, 0, 1, .4
]);

const render = (gl) => {
  // 开启、设置α融合
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  /**执行绘制命令**/
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// 画sold
const transferData = (gl, dataSource, onVertexShader, onFragmentShader, aPosition, n) => {
  const program = creatShaders(gl, onVertexShader, onFragmentShader);
  gl.useProgram(program);
  gl.program = program;

  const aposLocation = gl.getAttribLocation(gl.program, aPosition);
  vertexBuffer(gl, dataSource, aposLocation, n);

  render(gl);
}

// 截取对应数据的范围
const getCurData = (data, singlePointLen, n, i) => {
  const pointStart = singlePointLen * n * i;
  const pointEnd = singlePointLen * n * (i + 1);
  return data.slice(pointStart, pointEnd);
}

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  for (let i = 0; i < 3; i++) {
    transferData(gl, getCurData(data, 2, 3, i), onVertexShader, onFragmentShader, 'apos', 2)
    transferData(gl, getCurData(colorData, 4, 3, i), onVertexShader, onFragmentShader, 'a_color', 4)
  }

}

onMounted(onWebgl)
</script>
