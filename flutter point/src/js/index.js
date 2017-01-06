import FlutterPoint from './flutterPoint.js';



const canvas = document.getElementById('world');

const width = canvas.width = window.innerWidth > 1000 ? 1000 : window.innerWidth;
const height = canvas.height = window.innerHeight;



//初始化场景
let demo = new FlutterPoint({
	canvas, //canvas 的dom对象
	width, //渲染场景的宽
	height, //渲染场景的高
	pInfo: [{
		pImgSource: 'point.svg',
		pNum: 20
	}, {
		pImgSource: 'petal.svg',
		pNum: 20
	}], //pImgSource粒子图像源 pNum 同屏粒子数
	options: {
		pDirection: 'auto', //string ['auto','left','right'] auto随机 left偏左 right偏右 
		pScale: [0.5, 1.5], //array 粒子的s缩放的比例区间 基于原大小进行缩放
	} //可选参数
});

demo.render(); //开始渲染

setTimeout(() => {
	demo.stopRender()
}, 300000); //停止渲染