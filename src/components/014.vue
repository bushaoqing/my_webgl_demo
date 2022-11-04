<template>
  <canvas id="canvas" width="450" height="450" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 纹理 透明度与 α 融合   ----   纹理开启透明度（ gl.BLEND ）是无效的，图片不会变为透明
 */
import { onMounted } from 'vue';
import { creatShaders } from '../hooks/use_init_shaders';
import { vertexBuffer } from '../hooks/use_vertex_buffer';
import erhaImg from '../assets/erha.jpg';
import dressImg from '../assets/dress.jpg';
import gouziImg from '../assets/gouzi.png';
import logoImg from '../assets/logo.png';

//顶点着色器源码
const onVertexShader = '' +
  'attribute vec4 a_Position;' +
  //纹理坐标
  'attribute vec2 a_TexCoord;' +
  //插值后纹理坐标
  'varying vec2 v_TexCoord;' +
  'void main(){' +
  '   gl_Position=a_Position;' +
  //  纹理坐标插值计算
  '   v_TexCoord=a_TexCoord;' +
  '}';

//片元着色器源码
const onFragmentShader = '' +
  'precision highp float;' +
  // 纹理图片像素数据
  'uniform sampler2D u_Sampler;' +
  'varying vec2 v_TexCoord;' +
  'void main(){' +
  '   gl_FragColor=texture2D(u_Sampler, v_TexCoord);' +
  '}';


/**
 * 四个顶点坐标数据data，z轴为零
 * 定义纹理贴图在WebGL坐标系中位置
 **/
const data = new Float32Array([
  -0.5, 0.5,//左上角——v0
  -0.5, -0.5,//左下角——v1
  0.5, 0.5,//右上角——v2
  0.5, -0.5, //右下角——v3

  -0.3, 0.7,//左上角——v0
  -0.3, -0.3,//左下角——v1
  0.7, 0.7,//右上角——v2
  0.7, -0.3 //右下角——v3
]);
/**
 * 创建UV纹理坐标数据textureData
 **/
const textureData = new Float32Array([
  0, 1,//左上角——uv0
  0, 0,//左下角——uv1
  1, 1,//右上角——uv2
  1, 0 //右下角——uv3
]);

// 画sold
const drawSolid = (gl, dataSource, onVertexShader, onFragmentShader, aPosition) => {
  const program = creatShaders(gl, onVertexShader, onFragmentShader);
  gl.useProgram(program);
  gl.program = program;

  const aposLocation = gl.getAttribLocation(gl.program, aPosition);
  vertexBuffer(gl, dataSource, aposLocation, 2);

  // 开启、设置α融合
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  /**执行绘制命令**/
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// 画纹理
const drawTexture = (gl, onVertexShader, onFragmentShader, image) => {
  const program = creatShaders(gl, onVertexShader, onFragmentShader);
  gl.useProgram(program);
  gl.program = program;

  const atexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  vertexBuffer(gl, textureData, atexCoord, 2);

  /* 图像预处理：纹理图片上下反转 */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  /**
   * 激活0号纹理单元TEXTURE0
   * 对于WebGL至少支持8个纹理单元
   * 分别标识为gl.TEXTURE0、gl.TEXTURE1、... gl.TEXTURE7
   */
  gl.activeTexture(gl.TEXTURE0)
  //创建纹理图像缓冲区
  const texture = gl.createTexture()
  //绑定纹理缓冲区
  gl.bindTexture(gl.TEXTURE_2D, texture)

  //设置纹素格式，jpg格式对应gl.RGB
  //png格式：logoImg、gouziImg   png格式是RGBA
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')

  //纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
  // 第二个参数0对应TEXTURE0末尾的0
  gl.uniform1i(u_Sampler, 0)

  /**执行绘制命令**/
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
  gl.clearColor(0.0, 0.0, 0.0, 0.1);


  // 注意：下面这种事拿不到img的！！
  // image.src = '../assets/erha.jpg'

  /**
   * 图片的像素尺寸要保证为2的n次幂:
   * 比如16、512、256、1024等
   * 可以自由组合出256x256、128x512等像素尺寸图片
   * 
   * 下面：logoImg测尺寸就不对，所以渲染不出来
   */
  const image = new Image()
  // image.src = erhaImg
  // image.src = logoImg
  image.src = gouziImg
  // image.src = dressImg
  image.onload = () => {
    for (let i = 0; i < 2; i++) {
      drawSolid(gl, getCurData(data, 2, 4, i), onVertexShader, onFragmentShader, 'a_Position');
      drawTexture(gl, onVertexShader, onFragmentShader, image);
    }
  }
}

onMounted(onWebgl)
</script>
