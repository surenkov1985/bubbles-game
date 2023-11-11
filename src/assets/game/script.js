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

let score = 0;
const MAX_LIVES = 3;
let lives = MAX_LIVES;

const BUBBLE_TYPES = {
	default: { texture: bubbleTexture },
	heart: { texture: heartTexture },
	bomb: { texture: bombTexture },
};

let IS_GAME_OVER = false;
let IS_PAUSED = false;
let IS_GAMEPLAY = false;

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

function updateUILives() {
	const initX = heartUiSprite.x + 40;
	const initY = heartUiSprite.y;
	const BETWEEN_X = 32;

	const createLive = () => {
		const live = new Sprite(bubbleTexture);
		live.scale.set(0.15);
		live.anchor.set(0.5);

		return live;
	};

	if (heartsContainer.children.length < lives) {
		while (heartsContainer.children.length < lives) {
			const live = createLive();

			live.x = initX + heartsContainer.children.length * BETWEEN_X;
			live.y = initY;

			heartsContainer.addChild(live);
		}
	}

	for (let i = 0; i < heartsContainer.children.length; i++) {
		const live = heartsContainer.children[i];

		live.visible = lives > i;
	}
}
updateUILives();

function manageLives() {
	if (lives <= 0) {
		lives = 0;
		showGameOver();
	} else if (lives > MAX_LIVES) {
		lives = MAX_LIVES;
	}

	updateUILives();
}
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
pauseBtn.on("pointerdown", handlerGameplayPause);
headerContainer.addChild(pauseBtn);

function handlerGameplayPause() {
	showPause();
}

///////////////////////////////////////////////////////

function startGamePlay() {
	resetGamePlay();

	IS_GAMEPLAY = true;
}

function resetGamePlay() {
	for (let i = 0; i < bubblesContainer.children.length; i++) {
		bubblesContainer.children[i].disable();
	}

	for (let i = 0; i < particlesContainer.children.length; i++) {
		particlesContainer.children[i].disable();
	}

	score = 0;
	lives = MAX_LIVES;

	updateScore();
	manageLives();

	IS_GAMEPLAY = false;
}

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
	bubble.type = type;

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
	if (!!IS_GAME_OVER || !!IS_PAUSED) return;
	sound.play("clickBubbleSound");

	createParticlesAt(this.x, this.y);

	if (this.type === "heart") {
		lives += 1;
		manageLives();
	} else if (this.type === "bomb") {
		lives -= 1;
		manageLives();
	} else {
		score += 1;
		updateScore();
	}

	this.disable();
}

////////////////////////////////////////////////////////

const ADD_BUBBLE_DELAY = 500;
let ticker = 0;

app.ticker.add((delta) => {
	if (!!IS_GAME_OVER || !!IS_PAUSED) return;

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

				if (bubble.y <= -bubble.height / 2) {
					if (bubble.type !== "bomb") {
						lives -= 1;
						manageLives();
					}
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

///////////////////////////// PAUSE ///////////////////////

const pauseShading = new Graphics();
pauseShading.beginFill(0x000000, 0.6);
pauseShading.drawRect(-1000, -1000, 2000, 2000);
pauseShading.endFill;
pauseShading.interactive = true;
pauseShading.x = app.screen.width / 2;
pauseShading.y = app.screen.height / 2;
pauseContainer.addChild(pauseShading);

// Фон панельки паузы
const pauseBg = new Sprite(pausePopupTexture);
pauseBg.anchor.set(0.5);
pauseBg.scale.set(1);
pauseBg.initX = app.screen.width / 2;
pauseBg.initY = app.screen.height / 2;
pauseBg.x = pauseBg.initX;
pauseBg.y = pauseBg.initY;
pauseContainer.addChild(pauseBg);

// кнопка Play
const pausePlayBtn = new Sprite(playBtnTexture);
pausePlayBtn.anchor.set(0.5);
pausePlayBtn.scale.set(1);
pausePlayBtn.interactive = true;
pausePlayBtn.x = 150;
pausePlayBtn.y = 145;
pausePlayBtn.on("pointerdown", handlerPauseResume);
pauseBg.addChild(pausePlayBtn);

// кнопка выхода
const exitBtn = new Sprite(exitBtnTexture);
exitBtn.anchor.set(0.5);
exitBtn.scale.set(1);
exitBtn.interactive = true;
exitBtn.x = -150;
exitBtn.y = 145;
exitBtn.on("pointerdown", handlerPauseHome);
pauseBg.addChild(exitBtn);

function handlerPauseResume() {
	hidePause();
}

function handlerPauseHome() {
	hidePause();
	resetGamePlay();
	showMenu();
}

function showPause() {
	pauseShading.alpha = 0;
	pauseBg.alpa = 0;
	pauseBg.x = pauseBg.initX - 100;

	gsap.timeline().to([pauseShading, pauseBg], { alpha: 1, duration: 0.2 }).to(pauseBg, { x: pauseBg.initX, duration: 0.4, ease: "back.out" }, 0);

	pauseContainer.visible = true;
	IS_PAUSED = true;
}

function hidePause() {
	pauseContainer.visible = false;
	IS_PAUSED = false;
}

////////////////////////////// GAME OVER /////////////////////////

const gameOverShading = new Graphics();
gameOverShading.beginFill(0x000000, 0.6);
gameOverShading.drawRect(-1000, -1000, 2000, 2000);
gameOverShading.endFill;
gameOverShading.interactive = true;
gameOverShading.x = app.screen.width / 2;
gameOverShading.y = app.screen.height / 2;
gameOverContainer.addChild(gameOverShading);

// фон панельки геймовера
const gameOverBg = new Sprite(gameOverPopupTexture);
gameOverBg.anchor.set(0.5);
gameOverBg.scale.set(1);
gameOverBg.initX = app.screen.width / 2;
gameOverBg.initY = app.screen.height / 2;
gameOverBg.x = gameOverBg.initX;
gameOverBg.y = gameOverBg.initY;
gameOverContainer.addChild(gameOverBg);

// кнопка Play геймовера
const gameOverPlayBtn = new Sprite(playBtnTexture);
gameOverPlayBtn.anchor.set(0.5);
gameOverPlayBtn.scale.set(1);
gameOverPlayBtn.interactive = true;
gameOverPlayBtn.x = 150;
gameOverPlayBtn.y = 145;
gameOverPlayBtn.on("pointerdown", handlerGameOverNew);
gameOverBg.addChild(gameOverPlayBtn);

// кнопка выхода
const gameOverExitBtn = new Sprite(exitBtnTexture);
gameOverExitBtn.anchor.set(0.5);
gameOverExitBtn.scale.set(1);
gameOverExitBtn.interactive = true;
gameOverExitBtn.x = -150;
gameOverExitBtn.y = 145;
gameOverExitBtn.on("pointerdown", handlerGameOverExit);
gameOverBg.addChild(gameOverExitBtn);

function handlerGameOverExit() {
	hideGameOver();
	resetGamePlay();
	showMenu();
}

function handlerGameOverNew() {
	startGamePlay();
	hideGameOver();
}

function showGameOver() {
	gameOverShading.alpha = 0;
	gameOverBg.alpha = 0;
	gameOverBg.x = gameOverBg.initX - 100;

	gsap.timeline()
		.to([gameOverShading, gameOverBg], { alpha: 1, duration: 0.2 })
		.to(gameOverBg, { x: gameOverBg.initX, duretion: 0.4, ease: "back.out" }, 0);

	gameOverContainer.visible = true;
	IS_GAME_OVER = true;
}

function hideGameOver() {
	gameOverContainer.visible = false;
	IS_GAME_OVER = false;
}

/////////////////////////////// МЕНЮ //////////////////////////

// фон меню
const menuBg = new Sprite(menuBgTexture);
menuBg.width = app.screen.width;
menuBg.height = app.screen.height;
menuContainer.addChild(menuBg);

// кнопка Play в меню
const menuPlayBtn = new Sprite(playBtnTexture);
menuPlayBtn.anchor.set(0.5);
menuPlayBtn.initScale = 2.2;
menuPlayBtn.scale.set(menuPlayBtn.initScale);
menuPlayBtn.interactive = true;
menuPlayBtn.x = app.screen.width / 2;
menuPlayBtn.y = app.screen.height / 2 + 50;
menuPlayBtn.on("pointerdown", handlerMenuPlay);
menuContainer.addChild(menuPlayBtn);

function handlerMenuPlay() {
	gsap.timeline()
		.to(this.scale, { x: menuPlayBtn.initScale * 1.1, y: menuPlayBtn.initScale * 1.1, duration: 0.1 })
		.to(this.scale, { x: menuPlayBtn.initScale, y: menuPlayBtn.initScale, duration: 0.1 })
		.then(() => {
			hideMenu();
			startGamePlay;
		});
}

function showMenu() {
	menuContainer.visible = true;
}

function hideMenu() {
	menuContainer.visible = false;
	sound.play("startGameSound");
}

/////////////////////////////////////////////////

hidePause();
hideGameOver();
