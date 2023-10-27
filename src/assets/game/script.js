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
	return Math.random() * (max - min) + 1;
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
	TextStyle = PIXI.TextStyle;

let app = new App({ width: 450, height: 800, background: "#227dae" });
document.body.appendChild(app.view);

//////////////// АССЕТЫ /////////////////

sound.add("clickBubbleSoound", "./static/audio/touch.ogg");
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

//////////////// GAMEPLAY //////////////////

///////////// ФОН ////////////////
const bg = new Sprite(bgTexture);
bgContainer.addChild(bg);
