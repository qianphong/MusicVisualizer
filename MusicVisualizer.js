MusicVisualizer.ac = new (AudioContext || webkitAudioContext)();

function MusicVisualizer(obj){
	this.source = null;
	this.count = 0;
	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size*2;
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain?"createGain":"createGainNode"]();
	this.analyser.connect(MusicVisualizer.ac.destination);
	this.gainNode.connect(this.analyser);
	this.container=obj.container;
	this.init();
	this.arr1=[];
}
MusicVisualizer.prototype.init=function(){
	var self=this;
	this.createCanvas();
	window.onresize=function(){
		self.canvasResize();
	}
}
MusicVisualizer.prototype.createCanvas=function(){
	this.canvas=document.createElement('canvas');
	this.ctx=this.canvas.getContext('2d');
	this.container.appendChild(this.canvas);
	this.canvasResize();
}
MusicVisualizer.prototype.canvasResize=function(){
	this.canvas.height=this.container.clientHeight;
	this.canvas.width=this.container.clientWidth;
	var color=this.ctx.createLinearGradient(0,0,0,this.canvas.height);
	color.addColorStop(0,'#f00');
	color.addColorStop(0.5,'#ff0');
	color.addColorStop(1,'#0f0');
	this.rectfillStyle=color;
}
MusicVisualizer.prototype.drawRect=function(arr){
	var height=this.canvas.height,
		width=this.canvas.width;
	this.ctx.clearRect(0,0,width,height);
	var w= width / this.size;
	var arr1=this.arr1;
	for(var i=0;i<this.size;i++){
		var h=arr[i]/256*height;
		this.ctx.fillStyle=this.rectfillStyle;
		this.ctx.fillRect(w*i,height-h,w*0.8,h);
		if(arr1.lenght<this.size) arr1.push(h);

		this.ctx.fillStyle="#fff";
		if(h<arr1[i]){
			this.ctx.fillRect(w*i,height-(--arr1[i])-4,w*0.8,4);
		}else{
			this.ctx.fillRect(w*i,height-h-4,w*0.8,4);
			arr1[i]=h;
		}
	}
}
MusicVisualizer.prototype.visualizer=function(){
	var arr = new Uint8Array(this.analyser.frequencyBinCount);
	this.analyser.getByteFrequencyData(arr);
	var self=this;
	requestAnimationFrame = window.requestAnimationFrame||
							window.webkitRequestAnimationFrame||
							window.mozRequestAnimationFrame;
	(function v(){
		self.analyser.getByteFrequencyData(arr);
		self.drawRect(arr);
		requestAnimationFrame(v);
	})()
	// requestAnimationFrame(v);
}
MusicVisualizer.prototype.volumeChange = function(pct){
	if(pct <= 1 && pct >= 0){
		this.gainNode.gain.value = pct*pct;
	}
}
MusicVisualizer.prototype.decode = function(arraybuffer,fn){
	var self=this;
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fn(buffer);
	},function(err){
		console.log(arr)
	})
}
MusicVisualizer.prototype.play = function(file){
	// 播放歌曲，接受一个file文件并播放
	// 创建bufferSourceNode,传入ArrayBuffer文件，
	// 再将bufferSourceNode连接到analyser上
	this.source && this.source[this.source.stop?'stop':'noteOff']();
	var self=this;
	this.getBuffer(file,function(buffer){
		self.decode(buffer,function(buffer){
			self.source=MusicVisualizer.ac.createBufferSource();
			self.source.buffer=buffer;
			self.source.connect(self.gainNode);
			self.source[self.source.start?'start':'noteOn'](0);
		});
	})
	this.visualizer();
}
MusicVisualizer.prototype.getBuffer = function(file,fun){
	// 将file获取的文件转换陈buffer
	var reader = new FileReader();
		reader.readAsArrayBuffer(file);
	reader.onload=function(){
		fun(reader.result);
	}
}