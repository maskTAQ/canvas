/*
 * @Author: taiaiqiang 
 * @Date: 2017-11-07 17:22:13 
 * @Last Modified by: taiaiqiang
 * @Last Modified time: 2017-11-07 17:25:51
 */
/*
原理简要说明:
将图片渲染出来
通过ctx.getImageData获取画布的像素数据 为一个类数组
像素的rgba值存在数组的四个下标中,四个下标存一个像素点
将原图的n个像素点渲染成一个像素点 即可完成颗粒化
*/
class Point {
    constructor(config) {
        this.config = config

        this.bindAttributeToThis();

        this
            .renderImg(config.src)
            .then(this.imgDataToPointData.bind(this))
            .then(this.render.bind(this))
            .catch(e => {
                alert(e)
            })
    }
    bindAttributeToThis() {
        const {element} = this.config;
        const {css} = this;
        const map = {
            ctx: element.getContext('2d'),
            canvasWidth: this.css('width'),
            canvasHeight: this.css('height'),
            imageData: {
                dom: null,
                width: '',
                height: '',
                posX: '',
                posY: ''
            }
        };

        Object.assign(this, map);

    }
    css(key, value) {
        const {element} = this.config;
        if (value) {
            element.style[key] = value;
        } else {
            return element.style[key] || element.getAttribute(key)
        }
    }
    renderImg(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            const {ctx, canvasWidth} = this;
            img.onload = () => {
                const {
                    width,
                    height,
                    posX = 0,
                    posY = 0
                } = img;

                this.imageData = {
                    dom: img,
                    width,
                    height,
                    posX,
                    posY,
                    data: []
                };
                //绘制图像
                ctx.drawImage(img, posX, posY, width, height);
                //获取图像像素数据
                this.imageData.data = ctx
                    .getImageData(posX, posY, width, height)
                    .data;
                resolve('img loaded');
            };
            img.onerror = () => {
                reject('img load err');
            };

            img.src = src;
        })
    }
    iterator(w, h, fn) {
        let i = 0;
        for (var granuleImgWidthPx = 0; granuleImgWidthPx < w; granuleImgWidthPx++) {
            for (var granuleImgHeightPx = 0; granuleImgHeightPx < h; granuleImgHeightPx++) {
                fn(granuleImgWidthPx, granuleImgHeightPx, i++);
            }
        }
    }
    imgDataToPointData() {
        console.log(this, 1)
        const {width, height, data, posX, posY} = this.imageData;
        const {granuleLimit, interval, duration, startLocation, dim} = this.config;
        //按颗粒化度计算颗粒化后图像的像素宽高
        const granuleImgWidth = parseInt(width / granuleLimit),
            granuleImgHeight = parseInt(height / granuleLimit);

        //计算每个像素颗粒化后的宽高 保持原图像大小不变
        var pointWidth = parseInt(width / granuleImgWidth),
            pointHeight = parseInt(height / granuleImgHeight);

        //计算颗粒化的图像数据
        const particles = [];
        this.iterator(granuleImgWidth, granuleImgHeight, (granuleImgWidthPx, granuleImgHeightPx, i) => {
            //计算(granuleImgWidthPx,granuleImgHeightPx)在数组中的R的坐标值
            const pos = (granuleImgHeightPx * pointHeight * width + granuleImgWidthPx * pointWidth) * 4;
            //判断像素透明度值是否符合要求 a值
            if (data[pos]) {
                var particle = {
                    //x,y值都随机一下
                    x: parseInt(posX + granuleImgWidthPx * pointWidth + (Math.random() - 0.5) * dim),
                    y: parseInt(posY + granuleImgHeightPx * pointHeight + (Math.random() - 0.5) * dim),
                    fillStyle: this.rgbToHex(data[pos], data[pos + 1], data[pos + 2]),
                    duration: duration,
                    interval: parseInt(Math.random() * 10 * interval),
                    currTime: 0,
                    startLocation
                }
                //符合要求的粒子保存到数组里
                particles.push(particle);
            }
        });
        this.particles = particles;
        return Promise.resolve(particles);
    }
    render() {
        const {ctx, particles, canvasWidth, canvasHeight} = this;
        const len = particles.length;
        let rafId = '';
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for (let i = 0; i < len; i++) {
            const {
                fillStyle,
                currTime,
                duration,
                interval,
                startLocation,
                x,
                y,
                animateStartTime = Date.now()
            } = particles[i];
            particles[i].animateStartTime = particles[i].animateStartTime || Date.now()
            // 所有粒子执行完动画后取消动画

            if (this.particles[len - 1].duration + this.particles[len - 1].interval < this.particles[len - 1].currTime) {
                cancelAnimationFrame(rafId)
                return this.renderEnd();

            } else {
                // 当前粒子仍在运动
                if (currTime < duration + interval) {
                    // 看看粒子是不是出发了
                    if (currTime >= interval) {
                        this.renderFrame(particles[i]);
                    }
                }
                particles[i].currTime = Date.now() - animateStartTime
            }
        }
        rafId = requestAnimationFrame(this.render.bind(this))
    }
    renderEnd() {
        const {ctx, particles, canvasWidth, canvasHeight} = this;

        const len = particles.length;

        for (var i = 0; i < len; i++) {
            const {fillStyle, x, y} = particles[i];
            //设置填充颜色
            ctx.fillStyle = fillStyle;
            //绘粒子到画布上
            ctx.fillRect(x, y, 1, 1);
        }
    }
    renderFrame(config) {
        const {
            fillStyle,
            currTime,
            duration,
            interval,
            startLocation,
            x,
            y
        } = config;
        const {easeType} = this.config;
        const {ctx, canvasWidth, canvasHeight} = this;
        const beginTime = currTime - interval;
        const frameX = EASE[easeType](beginTime, startLocation[0], x - startLocation[0], duration);
        const frameY = EASE[easeType](beginTime, startLocation[1], y - startLocation[1], duration);
        ctx.fillStyle = fillStyle;
        ctx.fillRect(frameX, frameY, 1, 1);
    }
    rgbToHex(r, g, b) {
        return "#" + ("000000" + ((r << 16) | (g << 8) | b).toString(16)).slice(-6)
    }
}

const EASE = {
    linear(e, a, g, f) {
        return g * e / f + a
    },
    easeInOutBack(e, a, h, g, f) {
        if (f == undefined) {
            f = 1.70158
        }
        if ((e /= g / 2) < 1) {
            return h / 2 * (e * e * (((f *= (1.525)) + 1) * e - f)) + a
        }
        return h / 2 * ((e -= 2) * e * (((f *= (1.525)) + 1) * e + f) + 2) + a
    },
    easeInOutExpo(e, a, g, f) {
        return g * (-Math.pow(2, -10 * e / f) + 1) + a
    }
}


