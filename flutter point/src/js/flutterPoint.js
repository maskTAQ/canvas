class point {
	constructor(ctx, pointImgUrl, w, h, pointScale, pDirection = 'auto') {
		this.sceneInfo = {
			width: w,
			height: h
		}; //整个场景的信息
		this.pointInfo = {
			ctx: ctx, //画布对象
			xAxla: this.initXAxla(), //粒子初生时的x轴坐标
			yAxla: 0, //粒子初生时的y轴坐标
			xSpeed: this.pointDirection(pDirection) * this.waveRange(1, 3), //x轴的运动速度
			ySpeed: 1, //y轴的运动速度
			scale: this.pointScaleRange(pointScale), //粒子的大小
			pointImg: new Image(), //粒子的图像
			pointImgUrl: pointImgUrl, //粒子的ulr地址
			pDirection: pDirection, //粒子的方向
			renderWidth: 0,
			renderHeight: 0
		};

		this.pointInfo.pointImg.onload = () => {
			this.renderPoint(); //等待粒子的图像资源加载完毕开始渲染粒子
		}
		this.pointInfo.pointImg.src = this.pointInfo.pointImgUrl;

		//记录图片真实的大小 用以渲染时计算渲染宽高
		this.pointInfo.pointImg.renderWidth = this.pointInfo.pointImg.width;
		this.pointInfo.pointImg.renderHeight = this.pointInfo.pointImg.height;

		//停止渲染时如果粒子没有生成完毕会吸附在屏幕顶端所以 向上移动粒子的高度 隐藏
		this.pointInfo.yAxla = -this.pointInfo.pointImg.height;

		this.pointInfo.pointImg.width = 0; // ??给图片一个宽度0 这样图片就不会占大小但是依旧能正常渲染（图片不占大小背景会变成透明 不然会变成白色）
	}
	initXAxla() {
		return this.waveRange(0, this.sceneInfo.width);
	}
	droping() {
		if (this.pointInfo.xAxla < 0 || this.pointInfo.xAxla > this.sceneInfo.width || this.pointInfo.yAxla > this.sceneInfo.height) { //当粒子离开x y轴的视野 则重置粒子为初生状态
			this.pointInfo.xAxla = this.initXAxla();
			this.pointInfo.yAxla = 0;
		} else {
			this.pointInfo.xAxla += this.pointInfo.xSpeed;
			this.pointInfo.yAxla += this.pointInfo.ySpeed;
		}
	}
	clear(oldPointInfo) { //清除上一粒子的渲染范围

		if (String(oldPointInfo.xAxla) !== "NaN") {
			this.pointInfo.ctx.clearRect(oldPointInfo.xAxla, oldPointInfo.yAxla, this.pointInfo.pointImg.width, this.pointInfo.pointImg.height);
		}

	}
	pointScaleRange(arr) {
		let [d, u] = arr;
		return parseFloat(Math.random() * (d - u) + u, 10); //u<= value < d  生成粒子的波动范围
	}
	pointDirection(dire) {
		let directions = [-1, 1];
		switch (true) {
			case dire === "auto":
				return directions[this.waveRange(0, 2)];
			case dire === "left":
				return directions[this.waveRange(0, 1)];
			case dire === "right":
				return directions[this.waveRange(1, 2)];
		}

	}
	waveRange(u, d) {
		return parseInt(Math.random() * (d - u) + u, 10); //u<= value < d  生成粒子的波动范围
	}
	renderPoint() {
		let oldPointInfo = {
				xAxla: this.pointInfo.xAxla,
				yAxla: this.pointInfo.yAxla
			} //保存上一次粒子的渲染位置 用以下次渲染时清楚上次的粒子
		this.droping();

		this.clear(oldPointInfo); //清除上一次渲染的粒子  ??渲染轨迹由粒子自己清楚会影响其他粒子的渲染

		let x = this.pointInfo.xAxla - this.pointInfo.pointImg.renderWidth * this.pointInfo.scale / 2;
		let y = this.pointInfo.yAxla - this.pointInfo.pointImg.renderHeight * this.pointInfo.scale / 2; //将渲染原粒子置为粒子原粒子
		let w = this.pointInfo.pointImg.renderWidth * this.pointInfo.scale;
		let h = this.pointInfo.pointImg.renderHeight * this.pointInfo.scale; //粒子有渲染大小
		this.pointInfo.ctx.drawImage(this.pointInfo.pointImg, x, y, w, h); //渲染粒子 
	}
}



export default class FlutterPoint {
	constructor(options) {
		this.initScene = {
			sceneDom: options.canvas, //canvas dom
			width: options.width, //canvas 宽度
			height: options.height, //canvas 高度
			pointTotalNum: 0, //粒子的总数
			pointScale: options.options ? (options.options.pScale || [0.5, 1.5]) : [0.5, 1.5],
			pDirection: options.options ? (options.options.pDirection || 'auto') : 'auto',
			rafId: null //渲染ID 用以停止渲染用
		}; //初始化场景信息
		this.initScene.ctx = this.initScene.sceneDom.getContext('2d'); //canvas 上下文
		options.pInfo.forEach((point, p) => { //遍历生成粒子
			for (let i = 0; i < point.pNum; i++) {
				this.initScene.pointTotalNum++;
				if (p === 0 && i === 0) {
					this.addPoint(point.pImgSource, this.initScene.pointScale, this.initScene.pDirection);
				} else { //防止此时粒子还没有生成就渲染 先生成一个粒子供用户触发渲染
					setTimeout(() => {
						this.addPoint(point.pImgSource, this.initScene.pointScale, this.initScene.pDirection); //url地址  缩放比例 粒子方向
					}, this.renderRule(this.initScene.pointTotalNum));

				}

			}
		});
	}
	requestAnimationFrame() {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
				return window.setTimeout(callback, 1000 / 60); //每帧1000/60ms
			}
		} //渲染动画方法
	cancelAnimationFrame() {
			return window.cancelAnimationFrame ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelRequestAnimationFrame ||
				window.oCancelRequestAnimationFrame ||
				window.msCancelRequestAnimationFrame ||
				clearTimeout(rafId);
		} //停止渲染动画方法
	renderRule(i) {
		return this.initScene.height / 60 / (i - 1) * 1000 //将以生成的粒子按时间均匀的排布在场景中  场景高度/渲染赫兹/粒子数-减去第一个没有通过定时器渲染的 * 渲染基数
	}
	clear() {
		this.initScene.ctx.clearRect(0, 0, this.initScene.width, this.initScene.height);
	}
	addPoint(pointImgUrl, pointScale, pDirection) {

		if (!this.points) {
			this.points = []; //存放粒子的盒子
		}
		this.points.push(new point(this.initScene.ctx, pointImgUrl, this.initScene.width, this.initScene.height, pointScale, pDirection)); //生成粒子
	}
	renderPoint() {
		this.points.forEach((point, i) => {
			this.points[i].renderPoint();
		}); //将 粒子 渲染到 场景上

	}
	render() {
		this.clear();
		this.renderPoint(); // 渲染粒子
		this.initScene.rafId = this.requestAnimationFrame()(this.render.bind(this));
	}
	stopRender() {
		this.cancelAnimationFrame()(this.initScene.rafId);
		this.clear()
	}
}

/* 
=============动画说明=============
 每个粒子管理自己的渲染轨迹
 场景定时渲染不同的帧以展示动画

 参数说明

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
}, 30000); //停止渲染

*/