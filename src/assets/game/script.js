import "../styles/style.scss";
import * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import { sound } from "@pixi/sound";
import { gsap } from "gsap";

///////////// MATH ////////////
function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
	return Math.random() * (max - min) + min;
}
function sample(array) {
	return array[Math.floor(Math.random() * array.length)];
}
////////////////////////////////

///////////// Инициализируем приложение /////////////

const App = PIXI.Application,
	Sprite = PIXI.Sprite,
	Texture = PIXI.Texture,
	Container = PIXI.Container,
	Text = PIXI.Text,
	TextStyle = PIXI.TextStyle,
	Cache = PIXI.Cache;

let app = new App({ width: 500, height: 900, background: "#227dae" });
document.body.appendChild(app.view);

//////////////// АССЕТЫ /////////////////

sound.add("clickBubbleSound", "./static/audio/touch.ogg");
sound.add("startGameSound", "./static/audio/click.ogg");

const bgTexture = Texture.from("../static/images/bg-sheet0.png");
const headerBgTexture = Texture.from("./static/images/header-sheet0.png");
const heartUiTexture = Texture.from("./static/images/heart2-sheet0.png");
const bubbleTexture = Texture.from("./static/images/bubble-sheet0.png");
const heartTexture = Texture.from("./static/images/heart-sheet0.png");
const bombTexture = Texture.from("./static/images/bomb-sheet0.png");
const pauseBtnTexture = Texture.from("./static/images/pausebtn-sheet0.png");
const pausePopupTexture = Texture.from("./static/images/popup-sheet1.png");
const gameOverPopupTexture = Texture.from("./static/images/popup-sheet0.png");
const exitBtnTexture = Texture.from("./static/images/exitbtn-sheet0.png");
const playBtnTexture = Texture.from("./static/images/playbtn-sheet0.png");
const menuBgTexture = Texture.from("./static/images/menubg-sheet0.png");

//////////////// ГЛАВНЫЕ КОНТЕЙНЕРЫ ///////////////

//  Основной контейнер для всей игры
const gameContainer = new Container();
app.stage.addChild(gameContainer);
//  Контейнер для фона
const bgContainer = new Container();
gameContainer.addChild(bgContainer);
// Контейнер для пузырей
const bubblesContainer = new Container();
gameContainer.addChild(bubblesContainer);
// Контейнер для партиклейот взрыва пузырей
const particlesContainer = new Container();
gameContainer.addChild(particlesContainer);
// Контейнер для хедера
const headerContainer = new Container();
gameContainer.addChild(headerContainer);
// Контейнер для паузы
const pauseContainer = new Container();
gameContainer.addChild(pauseContainer);
// Контейнер для гейм овера
const gameOverContainer = new Container();
gameContainer.addChild(gameOverContainer);
// Контейнер для главного меню
const menuContainer = new Container();
gameContainer.addChild(menuContainer);

/////////////////////////////////////////////

const BUBBLE_TYPES = {
	default: { texture: bubbleTexture },
	heart: { texture: heartTexture },
	bomb: { texture: bombTexture },
};

//////////////// GAMEPLAY //////////////////

///////////// ФОН ////////////////
const bg = new Sprite(bgTexture);
bgContainer.addChild(bg);

///////////// HEADER /////////////

// Фон хедера
const headerBg = new Sprite(headerBgTexture);
headerBg.width = app.screen.width;
headerBg.height = 100;
headerContainer.addChild(headerBg);

// Сердечко для обозначения жизней
const heartUiSprite = new Sprite(heartUiTexture);
heartUiSprite.anchor.set(0.5);
heartUiSprite.scale.set(0.9);
heartUiSprite.x = app.screen.width / 2;
heartUiSprite.y = 40;
headerContainer.addChild(heartUiSprite);

// Контейнер для жизней

const heartsContainer = new Container();
headerContainer.addChild(heartsContainer);

// Текст

const textStyle = new TextStyle({
	fontFamily: "Arial",
	fontSize: 26,
	fontWeight: 900,
	fill: 0xffffff,
});

let UIText = new Text(``, textStyle);
UIText.scoreText = "SCORE : ";
UIText.value = 0;
UIText.text = UIText.scoreText + UIText.value;
UIText.x = 15;
UIText.y = 25;
headerContainer.addChild(UIText);

function updateScore() {
	UIText.text = UIText.scoreText + score;
}

// Кнопка паузы

let pauseBtn = new Sprite(pauseBtnTexture);
pauseBtn.anchor.set(0.5);
pauseBtn.scale.set(0.9);
pauseBtn.interactive = true;
pauseBtn.eventMode = "static";
pauseBtn.x = 440;
pauseBtn.y = 85;
// pauseBtn.on("pointerdown", handlerGameplayPause);
headerContainer.addChild(pauseBtn);

// function handlerGameplayPause() {
// 	showPause();
// }

///////////////////////////////////////////////////////

function createBubble(type = "default") {
	const texture = BUBBLE_TYPES[type] && BUBBLE_TYPES[type]["texture"];
	const bubble = new Sprite(texture);

	bubble.anchor.set(0.5);
	bubble.initScale = 1;
	bubble.initSpeed = 3;
	bubble.addRubberScale = 0;
	bubble.scale.set(bubble.initScale);
	bubble.elapsed = 0;
	bubble.active = false;
	bubble.interactive = true;
	bubble.eventMode = "dynamic";

	bubble.on("pointerdown", clickBubble);

	bubblesContainer.addChild(bubble);

	bubble.enable = function () {
		this.visible = true;
		this.active = true;
		this.elapsed = 0;
		this.interactive = true;
		this.addRubberScale = 0;
	};

	bubble.disable = function () {
		this.visible = false;
		this.active = false;
		this.interactive = false;
	};

	return bubble;
}

function createBubbleAt(x = 0, y = 0) {
	const type = sample(["default", "default", "default", "default", "default", "bomb", "bomb", "heart"]);

	const bubble = Pool.getBubble(type);
	bubble.initSpeed = random(2, 3.5);
	bubble.initScale = randomFloat(0.6, 0.8);
	bubble.scale.set(bubble.initScale);
	bubble.x = x;
	bubble.y = y;

	return bubble;
}

function createParticle(type = "default") {
	const particle = new Sprite(bubbleTexture);

	particle.type = type;
	particle.anchor.set(0.5);
	particle.direction = 0;
	particle.speed = 6;
	particle.active = false;

	particlesContainer.addChild(particle);

	particle.enable = function () {
		this.active = true;
		this.visible = true;
		this.alpha = 1;
	};

	particle.disable = function () {
		this.active = false;
		this.visible = false;
	};

	return particle;
}

function createParticlesAt(x = 0, y = 0) {
	for (let i = 0; i < 10; i++) {
		const particle = Pool.getParticle("default");
		particle.scale.set(randomFloat(0.15, 0.3));
		particle.direction = randomFloat(0, Math.PI * 2);
		particle.speed = random(3, 5);
		let randDist = random(0, 20);
		particle.x = x + Math.cos(particle.direction) * randDist;
		particle.y = y + Math.sin(particle.direction) * randDist;
	}
}

function spawnBubbles() {
	const x = random(100, app.view.width - 100);
	const y = app.view.height + 100;

	createBubbleAt(x, y);
}

function clickBubble(e) {
	sound.play("clickBubbleSound");

	createParticlesAt(this.x, this.y);
	this.disable();
}

////////////////////////////////////////////////////////

const ADD_BUBBLE_DELAY = 500;
let ticker = 0;

app.ticker.add((delta) => {
	if (ticker >= ADD_BUBBLE_DELAY) {
		ticker = 0;

		spawnBubbles();
	}

	ticker += delta * 10;

	if (bubblesContainer.children.length) {
		for (let i = bubblesContainer.children.length; i >= 0; i--) {
			let bubble = bubblesContainer.children[i];

			if (bubble && bubble.active) {
				bubble.elapsed += delta;
				bubble.addRubberScale = Math.sin((Math.PI * bubble.elapsed) / 80.0) / 30;
				bubble.scale.x = bubble.initScale + bubble.addRubberScale;
				bubble.scale.y = bubble.initScale - bubble.addRubberScale;
				bubble.y -= bubble.initSpeed * delta;

				if (bubble.y < -bubble.height / 2) {
					bubble.disable();
				}
			}
		}

		for (let i = particlesContainer.children.length; i >= 0; i--) {
			let particle = particlesContainer.children[i];

			if (particle && particle.active) {
				particle.x += Math.cos(particle.direction) * particle.speed * delta;
				particle.y += Math.sin(particle.direction) * particle.speed * delta;
				particle.alpha -= 0.05 * delta;

				if (particle.alpha <= 0) {
					particle.disable();
				}
			}
		}
	}

	// spawnBubbles();
});

/////////////////// POOL ////////////////

const Pool = {
	CACHE: {},

	getBubble: function (type) {
		let key = "bubble_" + type;
		return this.getFromCache(key, () => createBubble(type));
	},

	getParticle: function (type) {
		let key = "particle_" + type;
		return this.getFromCache(key, () => createParticle(type));
	},

	getFromCache: function (key, callback) {
		if (!this.CACHE[key]) this.CACHE[key] = [];

		let stream = this.CACHE[key];
		console.log(this.CACHE);
		let i = 0;
		let len = stream.length;
		let item;

		if (len === 0) {
			stream[0] = callback(key);
			item = stream[0];
			item.enable();

			return item;
		}

		while (i <= len) {
			if (!stream[i]) {
				stream[i] = callback(key);
				item = stream[i];
				item.enable();
				break;
			} else if (!stream[i].active) {
				item = stream[i];
				item.enable();
				break;
			} else {
				i++;
			}
		}
		return item;
	},
};
