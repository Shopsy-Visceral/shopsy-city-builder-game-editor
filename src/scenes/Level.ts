// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { playSound } from "../core/audio";
import { applyGameplayConfig, gameState, setCurrentLevel, resetBlockRunState, DroppedBlockSprite, gameplayConfig } from "../core/state";
import { LEVELS } from "../data/levels";
import { GAME_PANEL } from "../game-core/GamePanel";
import { GAME_STATE } from "../game-core/GameState";
import { ErrorPopupManager, ErrorType } from "../managers/ErrorManager";
import UserProfileManager from "../shopsystan/UserProfileManager";
import { ShopsyAnalytics } from "../shopsystan/shopsyAnalytics";
import { initShopsyBridge, shopsyBridge, ShopsyMessageAction } from "../shopsystan/shopsyBridge";
import { ShareManager } from "../share/ShareManager";
import { GAME_ID, GAME_NAME } from "../utils/config";
import { PlayerPrefs } from "../utils/PlayerPrefs";
import GameResponseManager from "../shopsystan/shopsyGameResponses";
import { LevelAnalytics } from "../shopsystan/levelAnalytics";

let _gameplayTutorialShownThisSession = false;
/* END-USER-IMPORTS */
export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// gameWorldContainer
		const gameWorldContainer = this.add.container(0, 302);
		gameWorldContainer.scaleX = 1.5;
		gameWorldContainer.scaleY = 1.5;

		// bgGame1
		const bgGame1 = this.add.image(360, 540, "bg-game1");
		gameWorldContainer.add(bgGame1);

		// bgGame2
		const bgGame2 = this.add.image(360, -540, "bg-game2");
		gameWorldContainer.add(bgGame2);

		// bgGame3a
		const bgGame3a = this.add.image(360, -1620, "bg-game3");
		gameWorldContainer.add(bgGame3a);

		// bgGame3b
		const bgGame3b = this.add.image(360, -2700, "bg-game3");
		gameWorldContainer.add(bgGame3b);

		// blockBottom
		const blockBottom = this.add.image(360, 866, "block-bottom");
		gameWorldContainer.add(blockBottom);

		// gameplayContainer
		const gameplayContainer = this.add.container(-26, 73);
		gameplayContainer.scaleX = 1.5;
		gameplayContainer.scaleY = 1.5;

		// blockTop
		const blockTop = this.add.sprite(160, 120, "block");
		gameplayContainer.add(blockTop);

		// claw
		const claw = this.add.sprite(160, 0, "claw1");
		gameplayContainer.add(claw);

		// fxContainer
		const fxContainer = this.add.container(-2, 120);
		fxContainer.scaleX = 1.5;
		fxContainer.scaleY = 1.5;

		// collideFx
		const collideFx = this.add.sprite(-300, -300, "anim-collide");
		collideFx.visible = false;
		fxContainer.add(collideFx);

		// hudContainer
		const hudContainer = this.add.container(0, 189);

		// barBlocks
		const barBlocks = this.add.image(20, 60, "bar-blocks");
		barBlocks.setOrigin(0, 0.5);
		barBlocks.visible = false;
		hudContainer.add(barBlocks);

		// popupDark
		const popupDark = this.add.rectangle(0, 0, 720, 1080);
		popupDark.scaleX = 1.5;
		popupDark.scaleY = 1.8;
		popupDark.setOrigin(0, 0);
		popupDark.visible = false;
		popupDark.isFilled = true;
		popupDark.fillColor = 0;
		popupDark.fillAlpha = 0.5;

		// pausePopupContainer
		const pausePopupContainer = this.add.container(0, 0);
		pausePopupContainer.visible = false;

		// pausePopupBg
		const pausePopupBg = this.add.image(360, 540, "popup");
		pausePopupContainer.add(pausePopupBg);

		// pauseTitle
		const pauseTitle = this.add.text(360, 383, "", {});
		pauseTitle.setOrigin(0.5, 0.5);
		pauseTitle.text = "PAUSED";
		pauseTitle.setStyle({ "align": "center", "color": "#FFFFFF", "fontFamily": "bebas", "fontSize": "40px" });
		pausePopupContainer.add(pauseTitle);

		// pauseRestartButton
		const pauseRestartButton = this.add.sprite(360, 585, "btn-restart");
		pausePopupContainer.add(pauseRestartButton);

		// pauseMapButton
		const pauseMapButton = this.add.sprite(360, 680, "btn-map");
		pausePopupContainer.add(pauseMapButton);

		// pauseCloseButton
		const pauseCloseButton = this.add.sprite(515, 385, "btn-close");
		pausePopupContainer.add(pauseCloseButton);

		// endPopupContainer
		const endPopupContainer = this.add.container(0, 0);
		endPopupContainer.visible = false;

		// endPopupBg
		const endPopupBg = this.add.image(360, 540, "popup-end");
		endPopupContainer.add(endPopupBg);

		// endTitle
		const endTitle = this.add.text(360, 430, "", {});
		endTitle.setOrigin(0.5, 0.5);
		endTitle.text = "STAGE FAILED!";
		endTitle.setStyle({ "align": "center", "color": "#FFFFFF", "fontFamily": "bebas", "fontSize": "40px" });
		endPopupContainer.add(endTitle);

		// endBlocks
		const endBlocks = this.add.text(340, 502, "", {});
		endBlocks.setOrigin(1, 0.5);
		endBlocks.text = "0/0";
		endBlocks.setStyle({ "align": "right", "color": "#FFFFFF", "fontFamily": "bebas", "fontSize": "30px" });
		endPopupContainer.add(endBlocks);

		// endPoints
		const endPoints = this.add.text(480, 502, "", {});
		endPoints.setOrigin(1, 0.5);
		endPoints.text = "0/0";
		endPoints.setStyle({ "align": "right", "color": "#FFFFFF", "fontFamily": "bebas", "fontSize": "30px" });
		endPopupContainer.add(endPoints);

		// endRestartButton
		const endRestartButton = this.add.sprite(360, 585, "btn-restart");
		endPopupContainer.add(endRestartButton);

		// endMapButton
		const endMapButton = this.add.sprite(360, 680, "btn-map");
		endPopupContainer.add(endMapButton);

		// endNextButton
		const endNextButton = this.add.sprite(360, 650, "btn-next");
		endPopupContainer.add(endNextButton);

		// game_elements_container
		const game_elements_container = this.add.container(0, 0);
		game_elements_container.name = "game_elements_container";
		game_elements_container.visible = false;

		// top_ui_container
		const top_ui_container = this.add.container(117, 78);
		top_ui_container.name = "top_ui_container";

		// highScore_Panel
		const highScore_Panel = this.add.image(412, 48, "high-score-panel");
		highScore_Panel.visible = false;
		top_ui_container.add(highScore_Panel);

		// Gems_collect
		const gems_collect = this.add.text(384, 65, "", {});
		gems_collect.name = "Gems_collect";
		gems_collect.setOrigin(0, 0.5);
		gems_collect.visible = false;
		gems_collect.text = "0";
		gems_collect.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "75px", "stroke": "#b548d9ff", "strokeThickness": 10 });
		top_ui_container.add(gems_collect);

		// text_1
		const text_1 = this.add.text(411, 0, "", {});
		text_1.setOrigin(0.5, 0.5);
		text_1.visible = false;
		text_1.text = "High Score ";
		text_1.setStyle({ "color": "#f2ec35ff", "fontFamily": "font-1", "fontSize": "40px", "stroke": "#0e0d0dff", "strokeThickness": 10 });
		top_ui_container.add(text_1);

		// life_1
		const life_1 = this.add.image(-63, 167, "life-available");
		life_1.name = "life_1";
		life_1.visible = false;
		top_ui_container.add(life_1);

		// life_2
		const life_2 = this.add.image(21, 167, "life-available");
		life_2.name = "life_2";
		life_2.visible = false;
		top_ui_container.add(life_2);

		// life_3
		const life_3 = this.add.image(104, 167, "life-available");
		life_3.name = "life_3";
		life_3.visible = false;
		top_ui_container.add(life_3);

		// back_button1
		const back_button1 = this.add.image(864, 36, "back-button");
		back_button1.name = "back_button1";
		top_ui_container.add(back_button1);

		// pause_btn
		const pause_btn = this.add.image(864, 36, "back-icon");
		pause_btn.name = "pause_btn";
		top_ui_container.add(pause_btn);

		// character_BG_1
		const character_BG_1 = this.add.image(1, 42, "character-bg");
		character_BG_1.name = "character_BG_1";
		top_ui_container.add(character_BG_1);

		// character_Icon_1
		const character_Icon_1 = this.add.image(1, 42, "character-icon");
		character_Icon_1.name = "character_Icon_1";
		character_Icon_1.scaleX = 1.1303800689684422;
		character_Icon_1.scaleY = 1.1303800689684422;
		top_ui_container.add(character_Icon_1);

		// barPoints
		const barPoints = this.add.image(-66, 222, "bar-points");
		barPoints.setOrigin(0, 0.5);
		barPoints.visible = false;
		top_ui_container.add(barPoints);

		// lose_btn
		const lose_btn = this.add.image(848, 293, "character-bg");
		lose_btn.scaleX = 0.67;
		lose_btn.scaleY = 0.36196435725133197;
		lose_btn.visible = false;
		top_ui_container.add(lose_btn);

		// text_2
		const text_2 = this.add.text(848, 291, "", {});
		text_2.scaleX = 2.765128216532846;
		text_2.scaleY = 2.765128216532846;
		text_2.setOrigin(0.5, 0.5);
		text_2.visible = false;
		text_2.text = "lose";
		text_2.setStyle({ "fontFamily": "CarterOne-Regular" });
		top_ui_container.add(text_2);

		// win_btn
		const win_btn = this.add.image(854, 197, "character-bg");
		win_btn.scaleX = 0.57;
		win_btn.scaleY = 0.36196435725133197;
		win_btn.visible = false;
		win_btn.tintTopLeft = 14668032;
		win_btn.tintTopRight = 14668032;
		win_btn.tintBottomLeft = 14668032;
		win_btn.tintBottomRight = 14668032;
		top_ui_container.add(win_btn);

		// win_txt
		const win_txt = this.add.text(814, 166, "", {});
		win_txt.scaleX = 2.765128216532846;
		win_txt.scaleY = 2.765128216532846;
		win_txt.visible = false;
		win_txt.text = "Win";
		win_txt.setStyle({ "fontFamily": "CarterOneRegular" });
		top_ui_container.add(win_txt);

		// highScore_Panel_1
		const highScore_Panel_1 = this.add.image(52, 189, "bar-points");
		highScore_Panel_1.scaleX = 1.1785911243279024;
		highScore_Panel_1.scaleY = 1.1785911243279024;
		highScore_Panel_1.visible = false;
		top_ui_container.add(highScore_Panel_1);

		// gem
		const gem = this.add.image(-43, 190, "gem");
		gem.name = "gem";
		gem.scaleX = 0.8395470376849977;
		gem.scaleY = 0.8395470376849977;
		gem.visible = false;
		top_ui_container.add(gem);

		// txtPoints
		const txtPoints = this.add.text(81, 195, "", {});
		txtPoints.setOrigin(0.5, 0.5);
		txtPoints.visible = false;
		txtPoints.text = "0/0";
		txtPoints.setStyle({ "align": "right", "fontFamily": "CarterOne-Regular", "fontSize": "35px" });
		top_ui_container.add(txtPoints);

		// highScore_Panel_2
		const highScore_Panel_2 = this.add.image(47, 187, "bar-blocks");
		highScore_Panel_2.scaleX = 1.1028507950415196;
		highScore_Panel_2.scaleY = 1.1028507950415196;
		top_ui_container.add(highScore_Panel_2);

		// txtBlocks
		const txtBlocks = this.add.text(96, 192, "", {});
		txtBlocks.setOrigin(1, 0.5);
		txtBlocks.text = "0";
		txtBlocks.setStyle({ "align": "right", "fontFamily": "CarterOne-Regular", "fontSize": "35px" });
		top_ui_container.add(txtBlocks);

		// txtPointsAdded
		const txtPointsAdded = this.add.text(200, 186, "", {});
		txtPointsAdded.setOrigin(0, 0.5);
		txtPointsAdded.setStyle({ "color": "#23b84b", "fontFamily": "CarterOne-Regular", "fontSize": "35px" });
		top_ui_container.add(txtPointsAdded);

		// share_panel_container
		const share_panel_container = this.add.container(0, 0);
		share_panel_container.name = "share_panel_container";
		share_panel_container.visible = false;

		// share_bg
		const share_bg = this.add.image(540, 960, "share-bg");
		share_panel_container.add(share_bg);

		// sh_large_panel
		const sh_large_panel = this.add.image(540, 1270, "sh-large-panel");
		share_panel_container.add(sh_large_panel);

		// sh_panel_1
		const sh_panel_1 = this.add.image(545, 968, "title");
		sh_panel_1.scaleX = 0.9383886518217711;
		sh_panel_1.scaleY = 0.9383886518217711;
		share_panel_container.add(sh_panel_1);

		// sh_logo
		const sh_logo = this.add.image(540, 545, "logo-01");
		share_panel_container.add(sh_logo);

		// sh_panel
		const sh_panel = this.add.image(540, 681, "sh-panel");
		sh_panel.setOrigin(0.5, 0);
		share_panel_container.add(sh_panel);

		// final_score
		const final_score = this.add.text(791, 1293, "", {});
		final_score.setOrigin(0, 0.5);
		final_score.text = "0";
		final_score.setStyle({ "fontFamily": "CarterOne-Regular", "fontSize": "65px", "stroke": "#1a60b6", "strokeThickness": 10 });
		share_panel_container.add(final_score);

		// Supercoin_text_1
		const supercoin_text_1 = this.add.text(412, 1293, "", {});
		supercoin_text_1.setOrigin(0.5, 0.5);
		supercoin_text_1.text = "0";
		supercoin_text_1.setStyle({ "align": "center", "fontFamily": "CarterOne-Regular", "fontSize": "65px", "stroke": "#a77203ff", "strokeThickness": 10 });
		share_panel_container.add(supercoin_text_1);

		// game_over_lose_panel_container
		const game_over_lose_panel_container = this.add.container(0, 0);
		game_over_lose_panel_container.name = "game_over_lose_panel_container";
		game_over_lose_panel_container.visible = false;

		// score_panel_2
		const score_panel_2 = this.add.image(540, 1035, "score-panel");
		score_panel_2.name = "score_panel_2";
		game_over_lose_panel_container.add(score_panel_2);

		// lowScore_Character_1
		const lowScore_Character_1 = this.add.image(460, 445, "low-score-character");
		lowScore_Character_1.visible = false;
		game_over_lose_panel_container.add(lowScore_Character_1);

		// score_text_1
		const score_text_1 = this.add.text(540, 762, "", {});
		score_text_1.name = "score_text_1";
		score_text_1.setOrigin(0.5, 0.5);
		score_text_1.text = "Oh no!";
		score_text_1.setStyle({ "color": "#ffef4aff", "fontFamily": "CarterOne-Regular", "fontSize": "80px", "stroke": "#1a60b6", "strokeThickness": 10 });
		game_over_lose_panel_container.add(score_text_1);

		// Bottom_text_1
		const bottom_text_1 = this.add.text(540, 1264, "", {});
		bottom_text_1.name = "Bottom_text_1";
		bottom_text_1.setOrigin(0.5, 0.5);
		bottom_text_1.text = "Try your luck again!";
		bottom_text_1.setStyle({ "color": "#ffffffff", "fontFamily": "CarterOne-Regular", "fontSize": "60PX", "stroke": "#1a60b6", "strokeThickness": 10 });
		game_over_lose_panel_container.add(bottom_text_1);

		// play_again_btn
		const play_again_btn = this.add.image(540, 1734, "play-again-btn");
		game_over_lose_panel_container.add(play_again_btn);

		// high_score_bg_1
		const high_score_bg_1 = this.add.image(539, 982, "high-score-bg");
		high_score_bg_1.visible = false;
		game_over_lose_panel_container.add(high_score_bg_1);

		// text
		const text = this.add.text(454, 891, "", {});
		text.visible = false;
		text.text = "SCORE";
		text.setStyle({ "fontFamily": "CarterOne-Regular", "fontSize": "50PX", "stroke": "#5b009aff", "strokeThickness": 10 });
		game_over_lose_panel_container.add(text);

		// low_score
		const low_score = this.add.text(816, 1075, "", {});
		low_score.name = "low_score";
		low_score.setOrigin(0.5, 0.5);
		low_score.visible = false;
		low_score.text = "000";
		low_score.setStyle({ "align": "center", "color": "#ffffffff", "fontFamily": "CarterOne-Regular", "fontSize": "85PX", "stroke": "#1a60b6", "strokeThickness": 10 });
		game_over_lose_panel_container.add(low_score);

		// image_5
		const image_5 = this.add.image(522, 1025, "SuperCoinBG");
		game_over_lose_panel_container.add(image_5);

		// Supercoin_text
		const supercoin_text = this.add.text(571, 1059, "", {});
		supercoin_text.setOrigin(0.5, 0.5);
		supercoin_text.text = "0";
		supercoin_text.setStyle({ "align": "center", "fontFamily": "CarterOne-Regular", "fontSize": "85px", "stroke": "#a77203ff", "strokeThickness": 10 });
		game_over_lose_panel_container.add(supercoin_text);

		// gem_3
		const gem_3 = this.add.image(648, 1074, "gem");
		gem_3.visible = false;
		game_over_lose_panel_container.add(gem_3);

		// logo1
		const logo1 = this.add.image(540, 467, "logo1");
		game_over_lose_panel_container.add(logo1);

		// exit_from_lose_screen_btn
		const exit_from_lose_screen_btn = this.add.image(540, 1522, "exit-game-btn");
		game_over_lose_panel_container.add(exit_from_lose_screen_btn);

		// image_6
		const image_6 = this.add.image(473, 1061, "Coin");
		game_over_lose_panel_container.add(image_6);

		// game_over_win_panel_container
		const game_over_win_panel_container = this.add.container(0, 0);
		game_over_win_panel_container.name = "game_over_win_panel_container";
		game_over_win_panel_container.visible = false;

		// score_panel_1
		const score_panel_1 = this.add.image(534, 1035, "score-panel");
		score_panel_1.name = "score_panel_1";
		game_over_win_panel_container.add(score_panel_1);

		// highScore_Character_1
		const highScore_Character_1 = this.add.image(540, 490, "high-score-character");
		highScore_Character_1.visible = false;
		game_over_win_panel_container.add(highScore_Character_1);

		// score_text
		const score_text = this.add.text(540, 761, "", {});
		score_text.name = "score_text";
		score_text.setOrigin(0.5, 0.5);
		score_text.text = "Nicely Done";
		score_text.setStyle({ "color": "#ffef4aff", "fontFamily": "CarterOne-Regular", "fontSize": "80px", "stroke": "#1a60b6", "strokeThickness": 10 });
		game_over_win_panel_container.add(score_text);

		// Bottom_text
		const bottom_text = this.add.text(540, 1252, "", {});
		bottom_text.name = "Bottom_text";
		bottom_text.setOrigin(0.5, 0.5);
		bottom_text.text = "You’re a pro!";
		bottom_text.setStyle({ "color": "#ffffffff", "fontFamily": "CarterOne-Regular", "fontSize": "60PX", "stroke": "#1a60b6", "strokeThickness": 10 });
		game_over_win_panel_container.add(bottom_text);

		// btn_next 
		const btn_next_ = this.add.image(535, 1653, "error-box2");
		btn_next_.scaleX = 0.6548420953969265;
		btn_next_.scaleY = 0.6265270536305909;
		btn_next_.visible = false;
		game_over_win_panel_container.add(btn_next_);

		// next_btn
		const next_btn = this.add.image(540, 1721, "Green-btn");
		next_btn.scaleX = 1.01;
		next_btn.scaleY = 1.01;
		next_btn.visible = false;
		game_over_win_panel_container.add(next_btn);

		// high_score_bg
		const high_score_bg = this.add.image(532, 981, "high-score-bg");
		high_score_bg.visible = false;
		game_over_win_panel_container.add(high_score_bg);

		// text_3
		const text_3 = this.add.text(447, 890, "", {});
		text_3.visible = false;
		text_3.text = "SCORE";
		text_3.setStyle({ "fontFamily": "CarterOne-Regular", "fontSize": "50PX", "stroke": "#5b009aff", "strokeThickness": 10 });
		game_over_win_panel_container.add(text_3);

		// high_score_1
		const high_score_1 = this.add.text(810, 1076, "", {});
		high_score_1.name = "high_score_1";
		high_score_1.setOrigin(0.5, 0.5);
		high_score_1.visible = false;
		high_score_1.text = "000";
		high_score_1.setStyle({ "align": "center", "color": "#ffffffff", "fontFamily": "CarterOne-Regular", "fontSize": "85PX", "stroke": "#1a60b6", "strokeThickness": 10 });
		game_over_win_panel_container.add(high_score_1);

		// gem_2
		const gem_2 = this.add.image(652, 1076, "gem");
		gem_2.scaleX = 1.1889856074071514;
		gem_2.scaleY = 1.1889856074071514;
		gem_2.visible = false;
		game_over_win_panel_container.add(gem_2);

		// Bottom_text_2
		const bottom_text_2 = this.add.text(543, 1709, "", {});
		bottom_text_2.name = "Bottom_text_2";
		bottom_text_2.setOrigin(0.5, 0.5);
		bottom_text_2.visible = false;
		bottom_text_2.text = "Next";
		bottom_text_2.setStyle({ "color": "#ffffffff", "fontFamily": "CarterOne-Regular", "fontSize": "70PX", "stroke": "#0d6b00ff", "strokeThickness": 12 });
		game_over_win_panel_container.add(bottom_text_2);

		// image_3
		const image_3 = this.add.image(528, 1027, "SuperCoinBG");
		game_over_win_panel_container.add(image_3);

		// Supercoin_text1
		const supercoin_text1 = this.add.text(589, 1052, "", {});
		supercoin_text1.setOrigin(0.5, 0.5);
		supercoin_text1.text = "0";
		supercoin_text1.setStyle({ "align": "center", "fontFamily": "CarterOne-Regular", "fontSize": "85px", "stroke": "#a77203ff", "strokeThickness": 10 });
		game_over_win_panel_container.add(supercoin_text1);

		// logo
		const logo = this.add.image(540, 486, "logo1");
		game_over_win_panel_container.add(logo);

		// exit_from_win_screen_btn
		const exit_from_win_screen_btn = this.add.image(540, 1556, "claim-rewards-btn");
		exit_from_win_screen_btn.scaleX = 0.8808370845737925;
		exit_from_win_screen_btn.scaleY = 0.8808370845737925;
		game_over_win_panel_container.add(exit_from_win_screen_btn);

		// exit_from_win_screen_btn_1
		const exit_from_win_screen_btn_1 = this.add.image(540, 1556, "exit-game-btn");
		game_over_win_panel_container.add(exit_from_win_screen_btn_1);

		// image_4
		const image_4 = this.add.image(474, 1053, "Coin");
		game_over_win_panel_container.add(image_4);

		// game_over_panel_container
		const game_over_panel_container = this.add.container(517, 789);
		game_over_panel_container.name = "game_over_panel_container";
		game_over_panel_container.visible = false;

		// blur_bg
		const blur_bg = this.add.image(23, 169, "blur-bg");
		blur_bg.name = "blur_bg";
		blur_bg.scaleY = 1.1;
		game_over_panel_container.add(blur_bg);

		// Time_spend
		const time_spend = this.add.text(1, 483, "", {});
		time_spend.name = "Time_spend";
		time_spend.setOrigin(0.5, 0.5);
		time_spend.alpha = 0;
		time_spend.alphaTopLeft = 0;
		time_spend.alphaTopRight = 0;
		time_spend.alphaBottomLeft = 0;
		time_spend.alphaBottomRight = 0;
		time_spend.text = "0:11";
		time_spend.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "75px", "stroke": "#9802ffff", "strokeThickness": 10 });
		game_over_panel_container.add(time_spend);

		// character_Glow
		const character_Glow = this.add.image(6, -372, "character-glow");
		game_over_panel_container.add(character_Glow);

		// score_panel
		const score_panel = this.add.image(23, 246, "score-panel");
		score_panel.name = "score_panel";
		score_panel.alpha = 0;
		score_panel.alphaTopLeft = 0;
		score_panel.alphaTopRight = 0;
		score_panel.alphaBottomLeft = 0;
		score_panel.alphaBottomRight = 0;
		game_over_panel_container.add(score_panel);

		// high_score
		const high_score = this.add.text(5, 220, "", {});
		high_score.name = "high_score";
		high_score.setOrigin(0, 0.5);
		high_score.alpha = 0;
		high_score.alphaTopLeft = 0;
		high_score.alphaTopRight = 0;
		high_score.alphaBottomLeft = 0;
		high_score.alphaBottomRight = 0;
		high_score.text = "000";
		high_score.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "85PX", "stroke": "#9802ffff", "strokeThickness": 10 });
		game_over_panel_container.add(high_score);

		// highScore_Character
		const highScore_Character = this.add.image(0, -297, "high-score-character");
		highScore_Character.visible = false;
		highScore_Character.alpha = 0;
		highScore_Character.alphaTopLeft = 0;
		highScore_Character.alphaTopRight = 0;
		highScore_Character.alphaBottomLeft = 0;
		highScore_Character.alphaBottomRight = 0;
		game_over_panel_container.add(highScore_Character);

		// lowScore_Character
		const lowScore_Character = this.add.image(-59, -342, "low-score-character");
		lowScore_Character.visible = false;
		lowScore_Character.alpha = 0;
		lowScore_Character.alphaTopLeft = 0;
		lowScore_Character.alphaTopRight = 0;
		lowScore_Character.alphaBottomLeft = 0;
		lowScore_Character.alphaBottomRight = 0;
		game_over_panel_container.add(lowScore_Character);

		// gem_1
		const gem_1 = this.add.image(-61, 220, "gem");
		gem_1.alpha = 0;
		gem_1.alphaTopLeft = 0;
		gem_1.alphaTopRight = 0;
		gem_1.alphaBottomLeft = 0;
		gem_1.alphaBottomRight = 0;
		game_over_panel_container.add(gem_1);

		// share_btn
		const share_btn = this.add.image(23, 711, "share-btn");
		share_btn.name = "share_btn";
		share_btn.visible = false;
		game_over_panel_container.add(share_btn);

		// score_text2
		const score_text2 = this.add.text(23, -24, "", {});
		score_text2.name = "score_text2";
		score_text2.setOrigin(0.5, 0.5);
		score_text2.alpha = 0;
		score_text2.alphaTopLeft = 0;
		score_text2.alphaTopRight = 0;
		score_text2.alphaBottomLeft = 0;
		score_text2.alphaBottomRight = 0;
		score_text2.text = "Uh Oh!";
		score_text2.setStyle({ "color": "#ffef4aff", "fontFamily": "font-1", "fontSize": "80px", "stroke": "#560085ff", "strokeThickness": 10 });
		game_over_panel_container.add(score_text2);

		// score_text1
		const score_text1 = this.add.text(23, -24, "", {});
		score_text1.name = "score_text1";
		score_text1.setOrigin(0.5, 0.5);
		score_text1.alpha = 0;
		score_text1.alphaTopLeft = 0;
		score_text1.alphaTopRight = 0;
		score_text1.alphaBottomLeft = 0;
		score_text1.alphaBottomRight = 0;
		score_text1.text = "Nicely Done";
		score_text1.setStyle({ "color": "#ffef4aff", "fontFamily": "font-1", "fontSize": "80px", "stroke": "#560085ff", "strokeThickness": 10 });
		game_over_panel_container.add(score_text1);

		// Bottom_text1
		const bottom_text1 = this.add.text(23, 411, "", {});
		bottom_text1.name = "Bottom_text1";
		bottom_text1.setOrigin(0.5, 0.5);
		bottom_text1.alpha = 0;
		bottom_text1.alphaTopLeft = 0;
		bottom_text1.alphaTopRight = 0;
		bottom_text1.alphaBottomLeft = 0;
		bottom_text1.alphaBottomRight = 0;
		bottom_text1.text = "100% Nazar Protection";
		bottom_text1.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "60PX", "stroke": "#58006bff", "strokeThickness": 10 });
		game_over_panel_container.add(bottom_text1);

		// Bottom_text2
		const bottom_text2 = this.add.text(23, 411, "", {});
		bottom_text2.name = "Bottom_text2";
		bottom_text2.setOrigin(0.5, 0.5);
		bottom_text2.alpha = 0;
		bottom_text2.alphaTopLeft = 0;
		bottom_text2.alphaTopRight = 0;
		bottom_text2.alphaBottomLeft = 0;
		bottom_text2.alphaBottomRight = 0;
		bottom_text2.text = "Good Luck Coming Soon";
		bottom_text2.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "60PX", "stroke": "#58006bff", "strokeThickness": 10 });
		game_over_panel_container.add(bottom_text2);

		// character_BG_2
		const character_BG_2 = this.add.image(-399, -669, "character-bg");
		character_BG_2.name = "character_BG_2";
		game_over_panel_container.add(character_BG_2);

		// character_Icon_2
		const character_Icon_2 = this.add.image(-399, -669, "character-icon");
		character_Icon_2.name = "character_Icon_2";
		character_Icon_2.scaleX = 1.138783514614004;
		character_Icon_2.scaleY = 1.138783514614004;
		game_over_panel_container.add(character_Icon_2);

		// profile_text_1
		const profile_text_1 = this.add.text(-398, -554, "", {});
		profile_text_1.name = "profile_text_1";
		profile_text_1.setOrigin(0.5, 0.5);
		profile_text_1.text = "Guest";
		profile_text_1.setStyle({ "align": "center", "fixedWidth": 210, "fontFamily": "CarterOne-Regular", "fontSize": "35px", "stroke": "#332f2fff", "strokeThickness": 10 });
		game_over_panel_container.add(profile_text_1);

		// gameover_exit_btn
		const gameover_exit_btn = this.add.image(454, -667, "back-button");
		game_over_panel_container.add(gameover_exit_btn);

		// gameover_exit_btn1
		const gameover_exit_btn1 = this.add.image(455, -670, "back-icon");
		game_over_panel_container.add(gameover_exit_btn1);

		// pause_panel_container
		const pause_panel_container = this.add.container(330, 960);
		pause_panel_container.name = "pause_panel_container";
		pause_panel_container.visible = false;

		// bg_blur
		const bg_blur = this.add.image(210, 0, "bg-blur");
		bg_blur.alpha = 0.6;
		bg_blur.alphaTopLeft = 0.6;
		bg_blur.alphaTopRight = 0.6;
		bg_blur.alphaBottomLeft = 0.6;
		bg_blur.alphaBottomRight = 0.6;
		pause_panel_container.add(bg_blur);

		// pause_panel
		const pause_panel = this.add.image(210, 0, "pause-panel");
		pause_panel_container.add(pause_panel);

		// resume_btn
		const resume_btn = this.add.image(409, 190, "cancel-btn");
		pause_panel_container.add(resume_btn);

		// abandon_btn
		const abandon_btn = this.add.image(0, 190, "quit-btn");
		pause_panel_container.add(abandon_btn);

		// quit_game_text
		const quit_game_text = this.add.text(210, -267, "", {});
		quit_game_text.name = "quit_game_text";
		quit_game_text.setOrigin(0.5, 0.5);
		quit_game_text.text = "Quit Game?";
		quit_game_text.setStyle({ "color": "#faf844ff", "fontFamily": "CarterOne-Regular", "fontSize": "80px", "stroke": "#5d3193ff", "strokeThickness": 10 });
		pause_panel_container.add(quit_game_text);

		// game_start_panel_container
		const game_start_panel_container = this.add.container(528, 918);
		game_start_panel_container.name = "game_start_panel_container";
		game_start_panel_container.visible = false;

		// blur_bg_1
		const blur_bg_1 = this.add.image(8, 0, "blur-bg");
		blur_bg_1.scaleX = 1.1;
		blur_bg_1.scaleY = 1.1;
		game_start_panel_container.add(blur_bg_1);

		// naz_new_screen
		const naz_new_screen = this.add.image(12, 42, "start-panel");
		game_start_panel_container.add(naz_new_screen);

		// naz_text3
		const naz_text3 = this.add.image(29, -362, "naz-text3");
		naz_text3.name = "naz_text3";
		game_start_panel_container.add(naz_text3);

		// naz_text1
		const naz_text1 = this.add.image(16, 204, "naz-text1");
		game_start_panel_container.add(naz_text1);

		// naz_text2
		const naz_text2 = this.add.image(-166, -167, "naz-text2");
		game_start_panel_container.add(naz_text2);

		// top_text
		const top_text = this.add.text(12, -537, "", {});
		top_text.setOrigin(0.5, 0.64);
		top_text.text = "Stack & Earn Super Coins";
		top_text.setStyle({ "color": "#ecff3bff", "fontFamily": "CarterOne-Regular", "fontSize": "42px", "stroke": "#0a5bc0", "strokeThickness": 10 });
		game_start_panel_container.add(top_text);

		// start_btn
		const start_btn = this.add.image(12, 857, "start-btn");
		start_btn.name = "start_btn";
		game_start_panel_container.add(start_btn);

		// character_BG
		const character_BG = this.add.image(-410, -798, "character-bg");
		character_BG.name = "character_BG";
		game_start_panel_container.add(character_BG);

		// character_Icon
		const character_Icon = this.add.image(-410, -798, "character-icon");
		character_Icon.name = "character_Icon";
		game_start_panel_container.add(character_Icon);

		// profile_text
		const profile_text = this.add.text(-409, -683, "", {});
		profile_text.name = "profile_text";
		profile_text.setOrigin(0.5, 0.5);
		profile_text.text = "Guest";
		profile_text.setStyle({ "align": "center", "fixedWidth": 210, "fontFamily": "font-1", "fontSize": "35px", "stroke": "#332f2fff", "strokeThickness": 10 });
		game_start_panel_container.add(profile_text);

		// title_1
		const title_1 = this.add.image(12, -788, "game-title");
		title_1.name = "title_1";
		game_start_panel_container.add(title_1);

		// waiting_for_game_response_panel_container
		const waiting_for_game_response_panel_container = this.add.container(0, 0);
		waiting_for_game_response_panel_container.visible = false;

		// image_1
		const image_1 = this.add.image(540, 960, "blur-bg");
		waiting_for_game_response_panel_container.add(image_1);

		// image
		const image = this.add.image(540, 960, "bg-blur");
		image.alpha = 0.6;
		image.alphaTopLeft = 0.6;
		image.alphaTopRight = 0.6;
		image.alphaBottomLeft = 0.6;
		image.alphaBottomRight = 0.6;
		waiting_for_game_response_panel_container.add(image);

		// text_4
		const text_4 = this.add.text(546, 960, "", {});
		text_4.setOrigin(0.5, 0.5);
		text_4.text = "Please Wait...";
		text_4.setStyle({ "fontFamily": "CarterOne-Regular", "fontSize": "70px", "stroke": "#332f2fff", "strokeThickness": 10 });
		waiting_for_game_response_panel_container.add(text_4);

		// tutorial
		const tutorial = this.add.container(0, 0);
		tutorial.visible = false;

		// image_2
		const image_2 = this.add.image(540, 960, "bg-blur");
		image_2.alpha = 0.5;
		image_2.alphaTopLeft = 0.5;
		image_2.alphaTopRight = 0.5;
		image_2.alphaBottomLeft = 0.5;
		image_2.alphaBottomRight = 0.5;
		tutorial.add(image_2);

		// text_5
		const text_5 = this.add.text(540, 960, "", {});
		text_5.setOrigin(0.5, 0.5);
		text_5.text = "Tap to place the block";
		text_5.setStyle({ "fontFamily": "CarterOne-Regular", "fontSize": "65px", "stroke": "#000000ff", "strokeThickness": 7 });
		tutorial.add(text_5);

		// error_panel_container
		const error_panel_container = this.add.container(206, 699);
		error_panel_container.name = "error_panel_container";
		error_panel_container.visible = false;

		// bg_blur_1
		const bg_blur_1 = this.add.image(334, 255, "blur-bg");
		bg_blur_1.scaleY = 1.0091367689080406;
		error_panel_container.add(bg_blur_1);

		// Error_box1
		const error_box1 = this.add.image(338, 157, "error-box1");
		error_box1.name = "Error_box1";
		error_panel_container.add(error_box1);

		// Error_box2
		const error_box2 = this.add.image(338, 157, "error-box2");
		error_box2.name = "Error_box2";
		error_panel_container.add(error_box2);

		// button_type_2
		const button_type_2 = this.add.image(334, 1021, "error-button2");
		button_type_2.name = "button_type_2";
		button_type_2.visible = false;
		error_panel_container.add(button_type_2);

		// button_type_1
		const button_type_1 = this.add.image(334, 1021, "error-button");
		button_type_1.name = "button_type_1";
		button_type_1.visible = false;
		error_panel_container.add(button_type_1);

		// Error_title1
		const error_title1 = this.add.text(310, 176, "", {});
		error_title1.name = "Error_title1";
		error_title1.setOrigin(0.5, 0.5);
		error_title1.visible = false;
		error_title1.text = "No internet!";
		error_title1.setStyle({ "fontFamily": "font-1", "fontSize": "50px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(error_title1);

		// Error_title2
		const error_title2 = this.add.text(295, 175, "", {});
		error_title2.name = "Error_title2";
		error_title2.setOrigin(0.5, 0.5);
		error_title2.visible = false;
		error_title2.text = "Adding Rewards!";
		error_title2.setStyle({ "fontFamily": "font-1", "fontSize": "50px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(error_title2);

		// Error_title3
		const error_title3 = this.add.text(349, 176, "", {});
		error_title3.name = "Error_title3";
		error_title3.setOrigin(0.5, 0.5);
		error_title3.text = "Something went wrong";
		error_title3.setStyle({ "fontFamily": "CarterOne-Regular", "fontSize": "50px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(error_title3);

		// Error_title4
		const error_title4 = this.add.text(343, 176, "", {});
		error_title4.name = "Error_title4";
		error_title4.setOrigin(0.5, 0.5);
		error_title4.visible = false;
		error_title4.text = "Device unsupported";
		error_title4.setStyle({ "fontFamily": "font-1", "fontSize": "50px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(error_title4);

		// error_subtitle1
		const error_subtitle1 = this.add.text(324, 263, "", {});
		error_subtitle1.name = "error_subtitle1";
		error_subtitle1.setOrigin(0.5, 0.5);
		error_subtitle1.visible = false;
		error_subtitle1.text = "Please connect to the \n   internet and retry";
		error_subtitle1.setStyle({ "color": "#000000ff", "fontFamily": "font-1", "fontSize": "35px", "stroke": "#000000ff" });
		error_panel_container.add(error_subtitle1);

		// error_subtitle2
		const error_subtitle2 = this.add.text(298, 265, "", {});
		error_subtitle2.name = "error_subtitle2";
		error_subtitle2.setOrigin(0.5, 0.5);
		error_subtitle2.visible = false;
		error_subtitle2.text = "your rewards will be added\n    to your account shortly";
		error_subtitle2.setStyle({ "color": "#000000ff", "fontFamily": "font-1", "fontSize": "35px", "stroke": "#000000ff" });
		error_panel_container.add(error_subtitle2);

		// error_subtitle3
		const error_subtitle3 = this.add.text(333, 265, "", {});
		error_subtitle3.name = "error_subtitle3";
		error_subtitle3.setOrigin(0.5, 0.5);
		error_subtitle3.text = "We're Working on this,\n       please try again";
		error_subtitle3.setStyle({ "color": "#000000ff", "fontFamily": "CarterOne-Regular", "fontSize": "35px", "stroke": "#000000ff" });
		error_panel_container.add(error_subtitle3);

		// error_subtitle4
		const error_subtitle4 = this.add.text(170, 265, "", {});
		error_subtitle4.name = "error_subtitle4";
		error_subtitle4.setOrigin(0, 0.5);
		error_subtitle4.visible = false;
		error_subtitle4.text = "your device does not\nsupport the graphics";
		error_subtitle4.setStyle({ "color": "#000000ff", "fontFamily": "font-1", "fontSize": "35px", "stroke": "#000000ff" });
		error_panel_container.add(error_subtitle4);

		// button_text_1
		const button_text_1 = this.add.text(334, 1021, "", {});
		button_text_1.name = "button_text_1";
		button_text_1.setOrigin(0.5, 0.5);
		button_text_1.visible = false;
		button_text_1.text = "Retry";
		button_text_1.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "55px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(button_text_1);

		// button_text_2
		const button_text_2 = this.add.text(334, 1021, "", {});
		button_text_2.name = "button_text_2";
		button_text_2.setOrigin(0.5, 0.5);
		button_text_2.visible = false;
		button_text_2.text = "Okay";
		button_text_2.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "55px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(button_text_2);

		// button_text_3
		const button_text_3 = this.add.text(334, 1021, "", {});
		button_text_3.name = "button_text_3";
		button_text_3.setOrigin(0.5, 0.5);
		button_text_3.visible = false;
		button_text_3.text = "Try Again";
		button_text_3.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "55px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(button_text_3);

		// button_text_4
		const button_text_4 = this.add.text(334, 1021, "", {});
		button_text_4.name = "button_text_4";
		button_text_4.setOrigin(0.5, 0.5);
		button_text_4.visible = false;
		button_text_4.text = "Close";
		button_text_4.setStyle({ "color": "#ffffffff", "fontFamily": "font-1", "fontSize": "55px", "stroke": "#000000ff", "strokeThickness": 10 });
		error_panel_container.add(button_text_4);

		this.bgGame1 = bgGame1;
		this.bgGame2 = bgGame2;
		this.bgGame3a = bgGame3a;
		this.bgGame3b = bgGame3b;
		this.blockBottom = blockBottom;
		this.gameWorldContainer = gameWorldContainer;
		this.blockTop = blockTop;
		this.claw = claw;
		this.gameplayContainer = gameplayContainer;
		this.collideFx = collideFx;
		this.fxContainer = fxContainer;
		this.barBlocks = barBlocks;
		this.hudContainer = hudContainer;
		this.popupDark = popupDark;
		this.pausePopupBg = pausePopupBg;
		this.pauseTitle = pauseTitle;
		this.pauseRestartButton = pauseRestartButton;
		this.pauseMapButton = pauseMapButton;
		this.pauseCloseButton = pauseCloseButton;
		this.pausePopupContainer = pausePopupContainer;
		this.endPopupBg = endPopupBg;
		this.endTitle = endTitle;
		this.endBlocks = endBlocks;
		this.endPoints = endPoints;
		this.endRestartButton = endRestartButton;
		this.endMapButton = endMapButton;
		this.endNextButton = endNextButton;
		this.endPopupContainer = endPopupContainer;
		this.game_elements_container = game_elements_container;
		this.gems_collect = gems_collect;
		this.life_1 = life_1;
		this.life_2 = life_2;
		this.life_3 = life_3;
		this.back_button1 = back_button1;
		this.pause_btn = pause_btn;
		this.character_BG_1 = character_BG_1;
		this.character_Icon_1 = character_Icon_1;
		this.barPoints = barPoints;
		this.lose_btn = lose_btn;
		this.text_2 = text_2;
		this.win_btn = win_btn;
		this.win_txt = win_txt;
		this.gem = gem;
		this.txtPoints = txtPoints;
		this.txtBlocks = txtBlocks;
		this.txtPointsAdded = txtPointsAdded;
		this.top_ui_container = top_ui_container;
		this.sh_panel_1 = sh_panel_1;
		this.sh_logo = sh_logo;
		this.sh_panel = sh_panel;
		this.final_score = final_score;
		this.supercoin_text_1 = supercoin_text_1;
		this.share_panel_container = share_panel_container;
		this.lowScore_Character_1 = lowScore_Character_1;
		this.bottom_text_1 = bottom_text_1;
		this.play_again_btn = play_again_btn;
		this.low_score = low_score;
		this.supercoin_text = supercoin_text;
		this.exit_from_lose_screen_btn = exit_from_lose_screen_btn;
		this.game_over_lose_panel_container = game_over_lose_panel_container;
		this.highScore_Character_1 = highScore_Character_1;
		this.score_text = score_text;
		this.bottom_text = bottom_text;
		this.btn_next_ = btn_next_;
		this.next_btn = next_btn;
		this.high_score_1 = high_score_1;
		this.bottom_text_2 = bottom_text_2;
		this.image_3 = image_3;
		this.supercoin_text1 = supercoin_text1;
		this.exit_from_win_screen_btn = exit_from_win_screen_btn;
		this.exit_from_win_screen_btn_1 = exit_from_win_screen_btn_1;
		this.image_4 = image_4;
		this.game_over_win_panel_container = game_over_win_panel_container;
		this.time_spend = time_spend;
		this.high_score = high_score;
		this.highScore_Character = highScore_Character;
		this.lowScore_Character = lowScore_Character;
		this.share_btn = share_btn;
		this.character_BG_2 = character_BG_2;
		this.profile_text_1 = profile_text_1;
		this.gameover_exit_btn = gameover_exit_btn;
		this.gameover_exit_btn1 = gameover_exit_btn1;
		this.game_over_panel_container = game_over_panel_container;
		this.bg_blur = bg_blur;
		this.pause_panel = pause_panel;
		this.resume_btn = resume_btn;
		this.abandon_btn = abandon_btn;
		this.pause_panel_container = pause_panel_container;
		this.start_btn = start_btn;
		this.character_BG = character_BG;
		this.profile_text = profile_text;
		this.game_start_panel_container = game_start_panel_container;
		this.text_4 = text_4;
		this.waiting_for_game_response_panel_container = waiting_for_game_response_panel_container;
		this.image_2 = image_2;
		this.text_5 = text_5;
		this.tutorial = tutorial;
		this.error_panel_container = error_panel_container;

		this.events.emit("scene-awake");
	}

	private bgGame1!: Phaser.GameObjects.Image;
	private bgGame2!: Phaser.GameObjects.Image;
	private bgGame3a!: Phaser.GameObjects.Image;
	private bgGame3b!: Phaser.GameObjects.Image;
	private blockBottom!: Phaser.GameObjects.Image;
	private gameWorldContainer!: Phaser.GameObjects.Container;
	private blockTop!: Phaser.GameObjects.Sprite;
	private claw!: Phaser.GameObjects.Sprite;
	private gameplayContainer!: Phaser.GameObjects.Container;
	private collideFx!: Phaser.GameObjects.Sprite;
	private fxContainer!: Phaser.GameObjects.Container;
	private barBlocks!: Phaser.GameObjects.Image;
	private hudContainer!: Phaser.GameObjects.Container;
	private popupDark!: Phaser.GameObjects.Rectangle;
	private pausePopupBg!: Phaser.GameObjects.Image;
	private pauseTitle!: Phaser.GameObjects.Text;
	private pauseRestartButton!: Phaser.GameObjects.Sprite;
	private pauseMapButton!: Phaser.GameObjects.Sprite;
	private pauseCloseButton!: Phaser.GameObjects.Sprite;
	private pausePopupContainer!: Phaser.GameObjects.Container;
	private endPopupBg!: Phaser.GameObjects.Image;
	private endTitle!: Phaser.GameObjects.Text;
	private endBlocks!: Phaser.GameObjects.Text;
	private endPoints!: Phaser.GameObjects.Text;
	private endRestartButton!: Phaser.GameObjects.Sprite;
	private endMapButton!: Phaser.GameObjects.Sprite;
	private endNextButton!: Phaser.GameObjects.Sprite;
	private endPopupContainer!: Phaser.GameObjects.Container;
	private game_elements_container!: Phaser.GameObjects.Container;
	private gems_collect!: Phaser.GameObjects.Text;
	private life_1!: Phaser.GameObjects.Image;
	private life_2!: Phaser.GameObjects.Image;
	private life_3!: Phaser.GameObjects.Image;
	private back_button1!: Phaser.GameObjects.Image;
	private pause_btn!: Phaser.GameObjects.Image;
	private character_BG_1!: Phaser.GameObjects.Image;
	private character_Icon_1!: Phaser.GameObjects.Image;
	private barPoints!: Phaser.GameObjects.Image;
	private lose_btn!: Phaser.GameObjects.Image;
	private text_2!: Phaser.GameObjects.Text;
	private win_btn!: Phaser.GameObjects.Image;
	private win_txt!: Phaser.GameObjects.Text;
	private gem!: Phaser.GameObjects.Image;
	private txtPoints!: Phaser.GameObjects.Text;
	private txtBlocks!: Phaser.GameObjects.Text;
	private txtPointsAdded!: Phaser.GameObjects.Text;
	private top_ui_container!: Phaser.GameObjects.Container;
	private sh_panel_1!: Phaser.GameObjects.Image;
	private sh_logo!: Phaser.GameObjects.Image;
	private sh_panel!: Phaser.GameObjects.Image;
	private final_score!: Phaser.GameObjects.Text;
	private supercoin_text_1!: Phaser.GameObjects.Text;
	public share_panel_container!: Phaser.GameObjects.Container;
	private lowScore_Character_1!: Phaser.GameObjects.Image;
	private bottom_text_1!: Phaser.GameObjects.Text;
	private play_again_btn!: Phaser.GameObjects.Image;
	private low_score!: Phaser.GameObjects.Text;
	private supercoin_text!: Phaser.GameObjects.Text;
	private exit_from_lose_screen_btn!: Phaser.GameObjects.Image;
	private game_over_lose_panel_container!: Phaser.GameObjects.Container;
	private highScore_Character_1!: Phaser.GameObjects.Image;
	private score_text!: Phaser.GameObjects.Text;
	private bottom_text!: Phaser.GameObjects.Text;
	private btn_next_!: Phaser.GameObjects.Image;
	private next_btn!: Phaser.GameObjects.Image;
	private high_score_1!: Phaser.GameObjects.Text;
	private bottom_text_2!: Phaser.GameObjects.Text;
	private image_3!: Phaser.GameObjects.Image;
	private supercoin_text1!: Phaser.GameObjects.Text;
	private exit_from_win_screen_btn!: Phaser.GameObjects.Image;
	private exit_from_win_screen_btn_1!: Phaser.GameObjects.Image;
	private image_4!: Phaser.GameObjects.Image;
	private game_over_win_panel_container!: Phaser.GameObjects.Container;
	private time_spend!: Phaser.GameObjects.Text;
	private high_score!: Phaser.GameObjects.Text;
	private highScore_Character!: Phaser.GameObjects.Image;
	private lowScore_Character!: Phaser.GameObjects.Image;
	private share_btn!: Phaser.GameObjects.Image;
	private character_BG_2!: Phaser.GameObjects.Image;
	private profile_text_1!: Phaser.GameObjects.Text;
	private gameover_exit_btn!: Phaser.GameObjects.Image;
	private gameover_exit_btn1!: Phaser.GameObjects.Image;
	private game_over_panel_container!: Phaser.GameObjects.Container;
	private bg_blur!: Phaser.GameObjects.Image;
	private pause_panel!: Phaser.GameObjects.Image;
	private resume_btn!: Phaser.GameObjects.Image;
	private abandon_btn!: Phaser.GameObjects.Image;
	private pause_panel_container!: Phaser.GameObjects.Container;
	private start_btn!: Phaser.GameObjects.Image;
	private character_BG!: Phaser.GameObjects.Image;
	private profile_text!: Phaser.GameObjects.Text;
	private game_start_panel_container!: Phaser.GameObjects.Container;
	private text_4!: Phaser.GameObjects.Text;
	private waiting_for_game_response_panel_container!: Phaser.GameObjects.Container;
	private image_2!: Phaser.GameObjects.Image;
	private text_5!: Phaser.GameObjects.Text;
	private tutorial!: Phaser.GameObjects.Container;
	private error_panel_container!: Phaser.GameObjects.Container;

	/* START-USER-CODE */

	// ─── PANEL / STATE MANAGEMENT (mirrors Nazariya exactly) ───────────────────
	private allPanels: Phaser.GameObjects.Container[] = [];

	private previousGameState: string = GAME_STATE.NONE;
	private currentGameState: string = GAME_STATE.NONE;
	private previousPanel: string = GAME_PANEL.NONE;
	private currentPanel: string = GAME_PANEL.NONE;

	public score = 0;
	public gameStartTime = 0;
	public timePlayedMs = 0;

	// ─── SHOPSY ────────────────────────────────────────────────────────────────
	private superCoinsWonThisRound = 0;
	private gameResult: string;
	// Level instrumentation
	private loseReason = "unknown";
	private perfectDrops = 0;
	private goodDrops = 0;

	// ─── MANAGERS ──────────────────────────────────────────────────────────────
	private shareManager: ShareManager;
	private errorPopupManager: ErrorPopupManager;
	private errorPanelContainer?: Phaser.GameObjects.Container;
	private bridgeUnsubscribers: Array<() => void> = [];

	// ─── CITY-BUILDER-SPECIFIC FIELDS ──────────────────────────────────────────
	private moveTo: "left" | "right" = "left";
	private val = 0;
	private oscillating = 0;
	private isGameplayPaused = false;
	private isMaxGameBonusEarned = false;

	private currentPoints = 0;
	private maxBlock = 0;
	private requiredPoints = 0;
	private extraBgTiles: Phaser.GameObjects.Image[] = [];

	// Snapshot of the actual gameplay score at game-end (before we normalise
	// score → 100/0 for the bridge payload).
	private _finalDisplayScore = 0;

	private playingLevelIndex = 0;

	// Shopsy-layout helpers (unchanged from original)
	private readonly shopsyDesignWidth = 1080;
	private readonly shopsyDesignHeight = 1920;
	private shopsyLayoutCaptured = false;
	private shopsyLayout = new Map<Phaser.GameObjects.GameObject, { x: number; y: number; scaleX: number; scaleY: number }>();
	private shopsyLayoutRoots: Phaser.GameObjects.GameObject[] = [];
	private exit_back_button?: Phaser.GameObjects.Image;
	private exit_btn?: Phaser.GameObjects.Image;

	// Pause-popup nodes (original naming kept)
	private pauseBtnNode?: Phaser.GameObjects.GameObject;
	private pauseRestartBtnNode?: Phaser.GameObjects.GameObject;
	// private pauseMapBtnNode?: Phaser.GameObjects.GameObject;
	// private pauseCloseBtnNode?: Phaser.GameObjects.GameObject;
	// private endMapBtnNode?: Phaser.GameObjects.GameObject;

	// ───────────────────────────────────────────────────────────────────────────
	// LIFECYCLE
	// ───────────────────────────────────────────────────────────────────────────

	init(data: { overrideLevelIndex?: number }): void {
		this.playingLevelIndex =
			data?.overrideLevelIndex != null
				? data.overrideLevelIndex
				: gameState.currentLevel;
		console.log("[Level] init() — playingLevelIndex:", this.playingLevelIndex);
	}

	create(): void {
		this.editorCreate();

		this.cameras.main.setZoom(1);
		this.cameras.main.setScroll(0, 0);
		this.shopsyLayoutCaptured = false;

		// Depth ordering
		this.gameWorldContainer.setDepth(0);
		this.gameplayContainer.setDepth(1000);
		this.top_ui_container?.setDepth(1001);
		this.fxContainer.setDepth(1100);
		this.hudContainer.setDepth(2000);
		this.popupDark.setDepth(2100);
		this.pausePopupContainer.setDepth(2200);
		this.endPopupContainer.setDepth(2200);
		this.tutorial.setDepth(3000);
		this.tutorial.setVisible(false);

		// Managers
		this.setupManagers();

		// Layout
		this.setupShopsyUiBindings();
		this.captureShopsyLayoutRoots();
		this.applyShopsyLayoutTransform();
		this.scale.on("resize", () => {
			this.shopsyLayoutCaptured = false;
			this.applyShopsyLayoutTransform();
		}, this);
		this.events.once("shutdown", () => this.scale.off("resize", this.applyShopsyLayoutTransform, this));
		this.events.once("destroy", () => this.scale.off("resize", this.applyShopsyLayoutTransform, this));

		// Button-node aliases (keeps original variable names)
		this.pauseBtnNode = this.pause_btn;
		this.pauseRestartBtnNode = this.resume_btn ?? this.pauseRestartButton;
		// this.pauseMapBtnNode = this.abandon_btn ?? this.pauseMapButton;
		// this.pauseCloseBtnNode = this.pauseCloseButton;
		// this.endMapBtnNode = this.endMapButton;

		// Standard setup — same order as Nazariya
		this.setupPanels();
		this.loadSounds();
		this.setupBridgeListeners();
		this.setupInteractions();
		this.setupShopsy();

		// City-Builder-specific one-time setup
		this.setupGameplayCore();

		// Initial state — mirrors Nazariya
		this.changeGameState(GAME_STATE.PRE_GAME);

		this.events.once("shutdown", () => this.cleanupBridgeListeners());
		this.events.once("destroy", () => this.cleanupBridgeListeners());

		this.profile_text.setText(UserProfileManager.getProfileData()?.basic.userName ?? "Player");
		this.profile_text_1.setText(UserProfileManager.getProfileData()?.basic.userName ?? "Player");
	}

	update(): void {
		if (this.isGameplayPaused || this.currentGameState !== GAME_STATE.PLAYING) return;

		if (this.moveTo === "left") {
			if (this.val > -20) { this.val -= 1; } else { this.moveTo = "right"; }
		} else if (this.val < 20) {
			this.val += 1;
		} else {
			this.moveTo = "left";
		}

		gameState.blocks.forEach((block) => {
			if (!block.dropped) return;
			block.x += this.moveTo === "left" ? -this.oscillating : this.oscillating;
		});
	}

	// ───────────────────────────────────────────────────────────────────────────
	// SETUP HELPERS
	// ───────────────────────────────────────────────────────────────────────────

	private setupManagers(): void {
		this.errorPanelContainer = this.error_panel_container;
		this.errorPopupManager = new ErrorPopupManager(this);
		this.errorPopupManager.init();
		this.shareManager = new ShareManager(this);
		this.shareManager.init();
	}

	private setupShopsyUiBindings(): void {
		this.errorPanelContainer = this.error_panel_container;
	}

	private captureShopsyLayoutRoots(): void {
		this.shopsyLayoutRoots = [
			this.pause_panel_container,
			this.game_over_panel_container,
			this.game_over_win_panel_container,
			this.game_over_lose_panel_container,
			this.waiting_for_game_response_panel_container,
			this.share_panel_container,
			this.errorPanelContainer,
			this.top_ui_container,
			this.game_elements_container,
			this.gameWorldContainer,
			this.gameplayContainer,
			this.fxContainer,
			this.hudContainer,
			this.exit_back_button,
			this.exit_btn
		].filter((obj): obj is Phaser.GameObjects.Container | Phaser.GameObjects.Image => Boolean(obj));
	}

	private applyShopsyLayoutTransform(): void {
		if (!this.shopsyLayoutRoots.length) return;

		const gameWidth = this.scale.gameSize.width;
		const gameHeight = this.scale.gameSize.height;
		const scale = Math.min(gameWidth / this.shopsyDesignWidth, gameHeight / this.shopsyDesignHeight);
		const offsetX = (gameWidth - this.shopsyDesignWidth * scale) * 0.5;
		const offsetY = (gameHeight - this.shopsyDesignHeight * scale) * 0.5;

		if (!this.shopsyLayoutCaptured) {
			this.shopsyLayoutRoots.forEach((child) => {
				const t = child as unknown as Phaser.GameObjects.Components.Transform;
				this.shopsyLayout.set(child, { x: t.x ?? 0, y: t.y ?? 0, scaleX: t.scaleX ?? 1, scaleY: t.scaleY ?? 1 });
			});
			this.shopsyLayoutCaptured = true;
		}

		this.shopsyLayout.forEach((base, child) => {
			const t = child as unknown as Phaser.GameObjects.Components.Transform;
			t.x = base.x * scale + offsetX;
			t.y = base.y * scale + offsetY;
			t.scaleX = base.scaleX * scale;
			t.scaleY = base.scaleY * scale;
		});
	}

	private loadSounds(): void {
		// City Builder uses the playSound() utility — no sounds to preload here.
	}

	private setupPanels(): void {
		this.allPanels = [
			this.game_start_panel_container,
			this.pause_panel_container,
			this.game_over_panel_container,
			this.game_over_win_panel_container,
			this.game_over_lose_panel_container,
			this.share_panel_container,
			this.errorPanelContainer,
			this.top_ui_container,
			this.game_elements_container,
			this.waiting_for_game_response_panel_container,
			this.hudContainer,
			this.pausePopupContainer,
			this.endPopupContainer,
		].filter((panel): panel is Phaser.GameObjects.Container => Boolean(panel));

		// All panels: fixed to camera so camera scroll doesn't move them
		const setScrollFactorRecursively = (obj: any): void => {
			if (obj && typeof obj.setScrollFactor === "function") obj.setScrollFactor(0);
			if (obj?.list) obj.list.forEach((child: any) => setScrollFactorRecursively(child));
		};
		this.allPanels.forEach(p => setScrollFactorRecursively(p));

		// Initial visibility — everything off; changePanel will reveal the right one
		this.allPanels.forEach(p => p.setVisible(false));
		this.popupDark.setVisible(false).disableInteractive();
	}

	private changePanel(panel: string): void {
		if (this.currentPanel === panel) return;

		this.previousPanel = this.currentPanel;
		this.currentPanel = panel;

		let panelsToShow: Phaser.GameObjects.Container[] = [];

		switch (this.currentPanel) {
			case GAME_PANEL.START_PANEL:
				panelsToShow = [this.game_start_panel_container];
				break;
			case GAME_PANEL.PAUSE_PANEL:
				panelsToShow = [this.pause_panel_container];
				break;
			case GAME_PANEL.GAME_OVER_WIN_PANEL:
				panelsToShow = [this.game_over_panel_container, this.game_over_win_panel_container];
				break;
			case GAME_PANEL.GAME_OVER_LOSE_PANEL:
				panelsToShow = [this.game_over_panel_container, this.game_over_lose_panel_container];
				break;
			case GAME_PANEL.WAITING_FOR_GAME_RESPONSE:
				panelsToShow = [this.waiting_for_game_response_panel_container];
				break;
			case GAME_PANEL.SHARE_PANEL:
				panelsToShow = [this.share_panel_container];
				break;
			case GAME_PANEL.ERROR_PANEL:
				if (this.errorPanelContainer) panelsToShow = [this.errorPanelContainer];
				break;
			case GAME_PANEL.GAMEPLAY_PANEL:
				panelsToShow = [this.top_ui_container, this.game_elements_container];
				break;
			default:
				break;
		}

		for (const p of this.allPanels) {
			const show = panelsToShow.includes(p);
			p.setVisible(show);
			this.children.bringToTop(p);
		}

		// Show/hide the 3-D gameplay world depending on panel
		const showWorld = this.currentPanel !== GAME_PANEL.START_PANEL;
		this.gameplayContainer.setVisible(showWorld);
		this.fxContainer.setVisible(showWorld);
	}


	private changeGameState(state: string): void {
		if (this.currentGameState === state) return;

		this.previousGameState = this.currentGameState;
		this.currentGameState = state;

		switch (this.currentGameState) {
			case GAME_STATE.PRE_GAME: this.preGame(); break;
			case GAME_STATE.START: this.startGame(); break;
			case GAME_STATE.PAUSED: this.pauseGame(); break;
			case GAME_STATE.RESUMED: this.resumeGame(); break;
			case GAME_STATE.GAME_OVER_WIN: this.onGameWon(); break;
			case GAME_STATE.GAME_OVER_LOSE: this.onGameLost(); break;
			case GAME_STATE.WAITING_FOR_GAME_RESPONSE: this.onWaitingForShopsyGameResponse(); break;
			case GAME_STATE.RESTART: this.restartGame(); break;
			case GAME_STATE.SHARING: this.shareGame(); break;
			case GAME_STATE.ERROR: this.showError(); break;
			case GAME_STATE.ABANDONED: this.abandonGame(); break;
			case GAME_STATE.PLAYING: break;
			default:
				console.log(`[${GAME_NAME}] Unhandled game state: ${state}`);
				break;
		}
	}

	private preGame(): void {
		this.score = 0;
		this.currentPoints = 0;
		this.superCoinsWonThisRound = 0;
		this.txtPoints.setColor("#FFFFFF");
		this.txtPointsAdded.setText("");
		this.changePanel(GAME_PANEL.GAMEPLAY_PANEL);
		this.changeGameState(GAME_STATE.START);
	}

	private startGame(): void {
		if (this.currentGameState !== GAME_STATE.START) return;

		this.gameStartTime = this.time.now;
		this.timePlayedMs = 0;
		this.currentPoints = 0;
		this.score = 0;
		this.isMaxGameBonusEarned = false;
		this.isGameplayPaused = false;

		shopsyBridge.roundStarted();
		PlayerPrefs.gamesPlayedToday++;
		PlayerPrefs.gamesPlayedTotal++;

		// Level_Started first, so Game_Started below already carries level_number.
		this.loseReason = "unknown";
		this.perfectDrops = 0;
		this.goodDrops = 0;
		LevelAnalytics.start(this.playingLevelIndex + 1, this.playingLevelIndex < gameState.currentLevel, {
			target_score: this.requiredPoints,
			block_limit: this.maxBlock
		});
		ShopsyAnalytics.sendGameStartedEvent();

		this.changeGameState(GAME_STATE.PLAYING);
		this.changePanel(GAME_PANEL.GAMEPLAY_PANEL);
		this.showGameplayTutorialIfNeeded();
	}

	private showGameplayTutorialIfNeeded(): void {
		const shouldShowTutorial = !_gameplayTutorialShownThisSession;
		this.tutorial.setVisible(shouldShowTutorial);
		if (shouldShowTutorial) {
			this.children.bringToTop(this.tutorial);
		}
	}

	private hideGameplayTutorial(): void {
		this.tutorial.setVisible(false);
		_gameplayTutorialShownThisSession = true;
	}

	private pauseGame(): void {
		if (this.currentGameState !== GAME_STATE.PAUSED) return;

		if (this.previousGameState === GAME_STATE.PLAYING) {
			this.isGameplayPaused = true;
		}
		this.changePanel(GAME_PANEL.PAUSE_PANEL);
	}

	private resumeGame(): void {
		if (this.currentGameState !== GAME_STATE.RESUMED) return;

		this.isGameplayPaused = false;
		this.changeGameState(GAME_STATE.PLAYING);
		this.changePanel(GAME_PANEL.GAMEPLAY_PANEL);
	}

	private onGameOver(gameResult: string): void {
		if (
			this.currentGameState !== GAME_STATE.GAME_OVER_WIN &&
			this.currentGameState !== GAME_STATE.GAME_OVER_LOSE
		) return;

		this.timePlayedMs = this.time.now - this.gameStartTime;
		this.gameResult = gameResult;
		this._finalDisplayScore = this.currentPoints; // keep raw score for display

		// Normalise score sent to bridge (100 = win, 0 = lose) — same as original
		const bridgeGems = gameResult === "win" ? 100 : 0;

		// Tell Shopsy — response comes back via GAME_COMPLETED_ACK → onShopsyGameResponse()
		shopsyBridge.gameCompleted({
			gems: bridgeGems,
			playTimeInSec: Math.floor(this.timePlayedMs / 1000)
		});

		this.changeGameState(GAME_STATE.WAITING_FOR_GAME_RESPONSE);
	}

	private onWaitingForShopsyGameResponse(): void {
		this.changePanel(GAME_PANEL.WAITING_FOR_GAME_RESPONSE);
	}

	private onShopsyGameResponse(): void {
		this.high_score?.setText(String(this._finalDisplayScore));
		this.time_spend?.setText(this.formatTime(this.timePlayedMs));
		this.high_score_1?.setText(String(this._finalDisplayScore));
		this.low_score?.setText(String(this._finalDisplayScore));
		this.final_score?.setText(String(this._finalDisplayScore));

		this.superCoinsWonThisRound = GameResponseManager.getCoinsEarnedForGame();
		this.supercoin_text1?.setText(String(this.superCoinsWonThisRound));
		this.supercoin_text?.setText(String(this.superCoinsWonThisRound));
		this.supercoin_text_1?.setText(String(this.superCoinsWonThisRound));

		ShopsyAnalytics.sendGameFinishedEvent(
			this._finalDisplayScore,
			this.superCoinsWonThisRound,
			this.gameResult,
			this.timePlayedMs
		);
		ShopsyAnalytics.sendCoinsEarnedEvent(this.superCoinsWonThisRound);

		console.log(`[${GAME_NAME}] Time Played: ${this.timePlayedMs} ms`);

		if (this.gameResult === "win") {
			if (GameResponseManager.getCoinsEarnedForGame() > 0) {
				this.score_text?.setText("Nicely Done");
				this.bottom_text?.setText("You've won Super Coins!");
				this.exit_from_win_screen_btn?.setVisible(true);
				this.exit_from_win_screen_btn_1?.setVisible(false);
				this.image_3?.setVisible(true);
				this.image_4?.setVisible(true);
				this.supercoin_text1?.setVisible(true);
				this.bottom_text.setPosition(540, 1252);
			}
			else {
				this.score_text?.setText("Nicely Done");
				this.bottom_text?.setText("Congratulations!");
				this.image_4?.setVisible(false);
				this.image_3?.setVisible(false);
				this.supercoin_text1?.setVisible(false);
				this.bottom_text.setPosition(540, 1070);
				this.exit_from_win_screen_btn?.setVisible(false);
				this.exit_from_win_screen_btn_1?.setVisible(true);

			}
			this.changePanel(GAME_PANEL.GAME_OVER_WIN_PANEL);
		}
		else {
			if (this.isMaxGameBonusEarned) {
				//this.Bottom_text_1
				this.play_again_btn?.setVisible(false);
				this.bottom_text_1?.setText("Better Luck Next Time");
			}
			else {
				this.play_again_btn?.setVisible(true);
				this.bottom_text_1?.setText("Let's Try again!");
			}
			this.changePanel(GAME_PANEL.GAME_OVER_LOSE_PANEL);
		}
	}


	private onGameWon(): void {

		playSound(this, "completed");
		this.isGameplayPaused = true;           // stop update loop
		LevelAnalytics.complete(this.levelOutcomeData());
		this.onGameOver("win");
	}


	private onGameLost(): void {

		playSound(this, "gameover");
		this.isGameplayPaused = true;           // stop update loop
		LevelAnalytics.fail(this.loseReason, this.levelOutcomeData());
		this.share_btn?.setVisible(false);
		this.onGameOver("lost");
	}

	/** Game-specific fields attached to Level_Completed / Level_Failed / Level_Abandoned. */
	private levelOutcomeData(): Record<string, unknown> {
		return {
			score: this.currentPoints,
			target_score: this.requiredPoints,
			blocks_used: gameState.totalStackedBlocks,
			block_limit: this.maxBlock,
			perfect_drops: this.perfectDrops,
			good_drops: this.goodDrops
		};
	}

	private restartGame(): void {
		console.log(`[${GAME_NAME}] Restart Game`);
		this.scene.start("Level");
	}

	private abandonGame(): void {
		this.timePlayedMs = this.time.now - this.gameStartTime;
		ShopsyAnalytics.sendGameAbandonedEvent(this.currentPoints, this.timePlayedMs);
		LevelAnalytics.abandon("quit_button", this.levelOutcomeData());
		if (shopsyBridge.isNative) {
			shopsyBridge.gameCompleted({
				gems: 0, // No coins for abandoning, even if they had points at the time
				playTimeInSec: Math.floor(this.timePlayedMs / 1000)
			});
			shopsyBridge.exitGame();
			return;
		}
		this.goToLevelSelect();
	}

	private async shareGame(): Promise<void> {
		this.changePanel(GAME_PANEL.SHARE_PANEL);
		this.final_score?.setText(String(this._finalDisplayScore));
		await new Promise(resolve => this.time.delayedCall(100, resolve));
		this.shareManager?.ExecuteShareFlow();
	}

	private showError(): void {
		this.changePanel(GAME_PANEL.ERROR_PANEL);
		this.errorPopupManager?.showError(ErrorType.FATAL);
	}

	// ───────────────────────────────────────────────────────────────────────────
	// INTERACTIONS
	// ───────────────────────────────────────────────────────────────────────────

	private setupInteractions(): void {
		this.tapIfPresent(this.start_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("start_btn");
			this.changeGameState(GAME_STATE.START)
		});
		this.tapIfPresent(this.pause_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("pause_btn");
			this.changeGameState(GAME_STATE.PAUSED)
		});
		this.tapIfPresent(this.back_button1, () => {

			this.changeGameState(GAME_STATE.PAUSED)
		});
		this.tapIfPresent(this.pauseBtnNode, () => {
			this.changeGameState(GAME_STATE.PAUSED)
		});
		this.tapIfPresent(this.pauseRestartBtnNode, () => {
			ShopsyAnalytics.sendCtaClickedEvent("resume_btn");
			this.changeGameState(GAME_STATE.RESUMED)
		});
		// this.tapIfPresent(this.pauseMapBtnNode, () => {
		// 	ShopsyAnalytics.sendCtaClickedEvent("exit_btn");
		// 	this.changeGameState(GAME_STATE.ABANDONED)
		// });
		this.tapIfPresent(this.abandon_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("abandon_game");
			this.changeGameState(GAME_STATE.ABANDONED)
		});
		// this.tapIfPresent(this.endMapBtnNode, () => {
		// 	ShopsyAnalytics.sendCtaClickedEvent("exit_btn");
		// 	this.changeGameState(GAME_STATE.ABANDONED)
		// });
		this.tapIfPresent(this.share_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("share_btn");
			this.changeGameState(GAME_STATE.SHARING)
		});
		this.tapIfPresent(this.play_again_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("play_again_btn");
			this.changeGameState(GAME_STATE.RESTART)
		});
		this.tapIfPresent(this.exit_from_win_screen_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("claim_rewards_btn");
			LevelAnalytics.abandon("exit_button", this.levelOutcomeData());
			shopsyBridge.exitGame();
		});
		this.tapIfPresent(this.exit_from_win_screen_btn_1, () => {
			ShopsyAnalytics.sendCtaClickedEvent("exit_win_btn");
			LevelAnalytics.abandon("exit_button", this.levelOutcomeData());
			shopsyBridge.exitGame();
		});
		this.tapIfPresent(this.exit_from_lose_screen_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("exit_lose_btn");
			LevelAnalytics.abandon("exit_button", this.levelOutcomeData());
			shopsyBridge.exitGame();
		});
		this.tapIfPresent(this.gameover_exit_btn, () => {
			ShopsyAnalytics.sendCtaClickedEvent("exit_btn");
			LevelAnalytics.abandon("exit_button", this.levelOutcomeData());
			shopsyBridge.exitGame();
		});
		this.tapIfPresent(this.gameover_exit_btn1, () => {
			ShopsyAnalytics.sendCtaClickedEvent("exit_btn");
			LevelAnalytics.abandon("exit_button", this.levelOutcomeData());
			shopsyBridge.exitGame();
		});
		// "Next" button — advances level or returns to map if this was a replay
		const handleNext = () => {
			const isReplay = this.playingLevelIndex !== gameState.currentLevel;
			console.log("[Level] Next — isReplay:", isReplay,
				"playingLevelIndex:", this.playingLevelIndex,
				"currentLevel:", gameState.currentLevel);
			if (isReplay) {
				this.goToLevelSelect();
			} else {
				this.changeGameState(GAME_STATE.RESTART);
			}
		};
		this.tapIfPresent(this.next_btn, handleNext);
		this.tapIfPresent(this.bottom_text_2, handleNext);

		// Debug shortcuts (visible only in editor / testing)
		this.tapIfPresent(this.win_btn, () => {
			this.blockTop.destroy();
			setCurrentLevel(gameState.currentLevel + 1);
			this.changeGameState(GAME_STATE.GAME_OVER_WIN);
		});
		this.tapIfPresent(this.lose_btn, () => {
			this.blockTop.destroy();
			this.loseReason = "debug";
			this.changeGameState(GAME_STATE.GAME_OVER_LOSE);
		});

		this.tapIfPresent(this.endNextButton, () => {
			setCurrentLevel(gameState.currentLevel + 1);
			this.scene.start("LevelSelection");
		});
	}

	private tapIfPresent(
		button: Phaser.GameObjects.GameObject | undefined,
		callback: () => void
	): void {
		if (!button) return;
		this.tapInteractionHelper(button, callback);
	}

	private tapInteractionHelper(
		button: Phaser.GameObjects.GameObject,
		callback: () => void
	): void {
		button.setInteractive({ useHandCursor: true });
		button.on("pointerdown", () => {
			if (navigator.vibrate) navigator.vibrate(50);
			playSound(this, "click");
			this.tweens.add({
				targets: button,
				scaleX: 0.5,
				scaleY: 0.5,
				yoyo: true,
				ease: "Linear",
				duration: 100,
				onComplete: callback
			});
		});
	}

	private setupBridgeListeners(): void {
		this.bridgeUnsubscribers.push(
			shopsyBridge.on(ShopsyMessageAction.UPDATE_PROFILE, (data) => {
				console.log(`[${GAME_NAME}] Profile received: ${JSON.stringify(data)}`);
				const source: "cache" | "server" = data?.source || "cache";
				const profileData = data?.profile || data;
				if (source !== "server") {
					console.log(`[${GAME_NAME}] Ignoring non-server profile update`);
					return;
				}
				UserProfileManager.setProfileData(profileData, source);
				this.onShopsyProfileLoaded();
			})
		);

		this.bridgeUnsubscribers.push(
			shopsyBridge.on(ShopsyMessageAction.GAME_STARTED_ACK, (data) => {
				console.log(`[${GAME_NAME}] Game started`);
				this.isMaxGameBonusEarned = data?.isMaxGameBonusEarned ?? false;
				GameResponseManager.setGameStartedResponse(data);
			})
		);


		this.bridgeUnsubscribers.push(
			shopsyBridge.on(ShopsyMessageAction.GAME_COMPLETED_ACK, (data) => {
				console.log(`[${GAME_NAME}] Game completed`);
				this.isMaxGameBonusEarned = data?.isMaxGameBonusEarned ?? true;
				GameResponseManager.setGameEndedResponse(data);
				this.onShopsyGameResponse();
			})
		);

		this.bridgeUnsubscribers.push(
			shopsyBridge.on(ShopsyMessageAction.UPDATE_GAME_CONFIG, (config: any) => {
				this.onShopsyGameConfigLoaded(config?.gameConfig ?? config);
			})
		);
	}

	private setupShopsy(): void {
		const bridgeInitialized = this.registry.get("bridgeInitialized");
		if (!bridgeInitialized) {
			console.warn(`[${GAME_NAME}] Bridge not pre-initialized, initializing now…`);
			initShopsyBridge();
			this.registry.set("bridgeInitialized", true);
			shopsyBridge.requestProfile();
			shopsyBridge.requestGameConfig(GAME_ID);
		}

		// shopsyBridge.gameLoaded();
		shopsyBridge.startGame();

		// const loadDurationMs = this.registry.get("loadDurationMs");
		// if (loadDurationMs != null) {
		// 	ShopsyAnalytics.sendGameLoadedEvent(loadDurationMs);
		// }

		// if (PlayerPrefs.isNewDay) {
		// 	PlayerPrefs.gamesPlayedToday = 0;
		// 	PlayerPrefs.lastLoginDate = new Date().toISOString();
		// }

		const pauseAudio = () => this.sound.pauseAll();
		const resumeAudio = () => this.sound.resumeAll();
		document.addEventListener("visibilitychange", () => {
			document.hidden ? pauseAudio() : resumeAudio();
		});
		this.game.events.on(Phaser.Core.Events.BLUR, pauseAudio);
		this.game.events.on(Phaser.Core.Events.FOCUS, resumeAudio);
	}

	private onShopsyProfileLoaded(): void {
		const userName = UserProfileManager.getProfileData()?.basic.userName ?? "Player";
		this.profile_text?.setText(userName);
		this.profile_text_1?.setText(userName);
	}

	private onShopsyGameConfigLoaded(gameConfig: any): void {
		applyGameplayConfig({
			maxToleranceX: gameConfig?.maxToleranceX,
			targetYIncrement: gameConfig?.targetYIncrement,
			dropDurationHit: gameConfig?.dropDurationHit,
			dropDurationMiss: gameConfig?.dropDurationMiss,
			scrollDuration: gameConfig?.scrollDuration,
			oscillatingBreakpoints: gameConfig?.oscillatingBreakpoints
		});
	}

	private cleanupBridgeListeners(): void {
		this.bridgeUnsubscribers.forEach(u => u());
		this.bridgeUnsubscribers = [];
	}

	public goToPreviousPanel(): void {
		this.changePanel(this.previousPanel);
	}

	private setupGameplayCore(): void {
		resetBlockRunState();

		this.oscillating = 0;
		this.claw.setDepth(1);

		this.maxBlock = LEVELS[this.playingLevelIndex].blockAmount;
		this.requiredPoints = LEVELS[this.playingLevelIndex].pointRequired;
		this.txtBlocks.setText(String(this.maxBlock));
		this.txtPoints.setText(`0/${this.requiredPoints}`);

		if (!this.anims.exists("collide")) {
			this.anims.create({
				key: "collide",
				frames: this.anims.generateFrameNumbers("anim-collide"),
				frameRate: 10
			});
		}

		this.tweens.add({
			targets: this.blockTop,
			x: this.blockTop.x + 400,
			duration: 1500,
			ease: "Sine.easeInOut",
			yoyo: true,
			onUpdate: () => { this.claw.x = this.blockTop.x; },
			repeat: -1
		});

		// Spawn extra bg-game3 tiles so the background covers the full height
		// needed for this level. The static tiles only go up to y=-2700 (center),
		// i.e. the topmost pixel is at local y=-3240. Levels with many blocks
		// scroll the camera above that, exposing black.
		this.extraBgTiles.forEach(t => t.destroy());
		this.extraBgTiles = [];
		const bgTileHeight = 1080;
		const topmostStaticY = -2700;                                    // bgGame3b center
		const maxScrollLocal = gameplayConfig.targetYIncrement * (this.maxBlock - 1);
		const neededTopY = this.blockTop.y - maxScrollLocal - bgTileHeight; // buffer
		let nextTileY = topmostStaticY - bgTileHeight;
		while (nextTileY + bgTileHeight / 2 > neededTopY) {
			const tile = this.add.image(360, nextTileY, "bg-game3");
			this.gameWorldContainer.add(tile);
			this.gameWorldContainer.sendToBack(tile);
			this.extraBgTiles.push(tile);
			nextTileY -= bgTileHeight;
		}

		this.setupDropHandling();
	}

	private setupDropHandling(): void {
		let targetDropY = 880;
		const targetYIncrement = gameplayConfig.targetYIncrement;
		const maxToleranceX = gameplayConfig.maxToleranceX;
		let lastBlock = false;

		let spineGood: any;
		let spinePerfect: any;

		const spineFactory = this.add as Phaser.GameObjects.GameObjectFactory & {
			spine: (x: number, y: number, dataKey: string, atlasKey: string) => any;
		};

		const ensureSpine = (type: "good" | "perfect"): any => {
			if (type === "good") {
				if (!spineGood) {
					spineGood = spineFactory.spine(-400, -400, "good", "good-atlas");
					spineGood.setVisible(false);
					this.fxContainer.add(spineGood);
				}
				return spineGood;
			}
			if (!spinePerfect) {
				spinePerfect = spineFactory.spine(-400, -400, "perfect", "perfect-atlas");
				spinePerfect.setVisible(false);
				this.fxContainer.add(spinePerfect);
			}
			return spinePerfect;
		};

		this.input.off("pointerdown");
		this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
			const wasTutorialVisible = this.tutorial.visible;
			if (this.tutorial.visible) {
				this.hideGameplayTutorial();
			}

			if (!wasTutorialVisible && (
				(this.pause_btn && this.pause_btn.getBounds().contains(pointer.x, pointer.y)) ||
				(this.back_button1 && this.back_button1.getBounds().contains(pointer.x, pointer.y))
			)) return;
			if (this.currentGameState !== GAME_STATE.PLAYING || this.isGameplayPaused || !this.blockTop.visible) return;
			this.blockTop.setVisible(false);
			this.claw.setTexture("claw2");
			dropTheBlock();
		});

		const dropTheBlock = (): void => {
			if (this.isGameplayPaused) return;
			const key = gameState.blocks.length >= this.maxBlock - 1 ? "block-top" : "block";
			lastBlock = key === "block-top";

			const block = this.add.sprite(this.blockTop.x, this.blockTop.y, key) as DroppedBlockSprite;
			this.gameplayContainer.add(block);

			if (!isColliding()) {
				targetDropY = this.blockTop.y + 1080 + 200;
				this.tweens.add({
					targets: block,
					y: targetDropY,
					duration: gameplayConfig.dropDurationMiss,
					ease: "Sine.easeIn",
					onComplete: () => { this.loseReason = "missed_drop"; this.changeGameState(GAME_STATE.GAME_OVER_LOSE); }
				});
				return;
			}

			gameState.blocks.push(block);
			this.tweens.add({
				targets: block,
				y: targetDropY,
				duration: gameplayConfig.dropDurationHit,
				ease: "Sine.easeIn",
				onComplete: () => {
					playSound(this, "hit");
					if (navigator.vibrate) navigator.vibrate(80);
					this.cameras.main.shake(150, 0.004);
					gameState.totalStackedBlocks++;

					const distance = getXDistance();
					if (distance !== null && distance <= maxToleranceX) {
						showCollideAnimation(block.x, block.y + 60);
						if (lastBlock) {
							playSound(this, "positive");
							this.time.delayedCall(800, () => buildingFinish());
						} else {
							targetDropY -= targetYIncrement;
							scrollUp();
						}

						block.dropped = true;
						getDropScore(block);

						gameplayConfig.oscillatingBreakpoints.forEach(([count, amount]) => {
							if (gameState.blocks.length === count) this.oscillating = amount;
						});
					} else {
						blockToppling();
					}

					this.onBlockAmountUpdated(this.maxBlock - gameState.blocks.length);
				}
			});
		};

		const isColliding = (): boolean => {
			if (gameState.blocks.length < 2) return true;
			const d = getXDistance();
			return d !== null && d < this.blockTop.displayWidth - 5;
		};

		const scrollUp = (): void => {
			let minusY = targetYIncrement;
			const latest = gameState.blocks[gameState.blocks.length - 1];
			if (latest && latest.y - this.blockTop.y > 1200) minusY = 0;

			// Use the container's actual runtime scaleY (set by applyShopsyLayoutTransform)
			// so that local-unit movements of blockTop/claw stay in sync with the world-unit camera scroll.
			const containerScaleY = this.gameplayContainer.scaleY;

			this.tweens.add({
				targets: this.claw,
				y: this.claw.y - minusY,
				duration: gameplayConfig.scrollDuration,
				ease: "Sine.easeInOut"
			});

			this.tweens.add({
				targets: this.cameras.main,
				scrollY: this.cameras.main.scrollY - minusY * containerScaleY,
				duration: gameplayConfig.scrollDuration,
				ease: "Sine.easeInOut",
				onComplete: () => {
					this.blockTop.y -= minusY;
					this.blockTop.setVisible(true);
					if (LEVELS[this.playingLevelIndex].blockAmount - gameState.totalStackedBlocks === 1) {
						this.blockTop.setTexture("block-top");
					}
					this.claw.setTexture("claw1");
				}
			});
		};

		const getXDistance = (): number | null => {
			if (gameState.blocks.length === 0) return null;
			if (gameState.blocks.length >= 2) {
				const prev = gameState.blocks[gameState.blocks.length - 2];
				const cur = gameState.blocks[gameState.blocks.length - 1];
				return Phaser.Math.Distance.Between(prev.x, 0, cur.x, 0);
			}
			const cur = gameState.blocks[gameState.blocks.length - 1];
			return Phaser.Math.Distance.Between(360, 0, cur.x, 0);
		};

		const getDropScore = (block: DroppedBlockSprite): void => {
			const distance = getXDistance();
			if (distance === null || distance > maxToleranceX) return;
			const calculatedScore = Math.ceil((1 - distance / maxToleranceX) * 50);
			this.onScoreUpdated(calculatedScore);
			if (distance <= 3) { this.perfectDrops++; showQualityTxt("perfect", block); }
			else if (distance <= 10) { this.goodDrops++; showQualityTxt("good", block); }
		};

		const blockToppling = (): void => {
			if (this.isGameplayPaused) return;
			playSound(this, "fall");
			const previousX = gameState.blocks.length >= 2
				? gameState.blocks[gameState.blocks.length - 2].x
				: 360;
			const current = gameState.blocks[gameState.blocks.length - 1];

			// Fall target must be in container-local coordinates (not world/camera coords).
			// Adding 1080+200 local units guarantees the block drops well below the visible area.
			this.tweens.add({
				targets: current,
				y: current.y + 1080 + 200,
				duration: 1200,
				ease: "Sine.easeIn",
				onComplete: () => { this.loseReason = "toppled"; this.changeGameState(GAME_STATE.GAME_OVER_LOSE); }
			});

			const rotateLeft = current.x < previousX;
			this.tweens.add({
				targets: current,
				rotation: rotateLeft ? -3 : 3,
				x: current.x + (rotateLeft ? -180 : 180),
				duration: 1200,
				ease: "Sine.easeOut"
			});
		};

		const showCollideAnimation = (x: number, y: number): void => {
			this.collideFx.setVisible(true);
			this.collideFx.setPosition(x, y);
			this.collideFx.play("collide");
		};

		const showQualityTxt = (type: "good" | "perfect", block: DroppedBlockSprite): void => {
			playSound(this, type);
			const spine = ensureSpine(type);
			spine.setVisible(true);
			spine.x = block.x;
			spine.y = block.y;
			if (spine.animationState?.setAnimation) {
				spine.animationState.setAnimation(0, "animation", false);
			}
		};

		/** Decides win/lose once the final block has landed. */
		const buildingFinish = (): void => {
			if (this.currentPoints >= this.requiredPoints) {
				// Advance level on win (including last level → currentLevel becomes LEVELS.length)
				const isReplay = this.playingLevelIndex !== gameState.currentLevel;
				if (!isReplay) setCurrentLevel(gameState.currentLevel + 1);
				this.changeGameState(GAME_STATE.GAME_OVER_WIN);
			} else {
				this.loseReason = "score_short";
				this.changeGameState(GAME_STATE.GAME_OVER_LOSE);
			}
		};
	}

	// ─── IN-GAME HUD UPDATES ───────────────────────────────────────────────────

	private onScoreUpdated(addedScore: number): void {
		this.currentPoints += addedScore;
		this.score = this.currentPoints;
		this.txtPoints.setText(`${this.currentPoints}/${this.requiredPoints}`);
		if (this.currentPoints > this.requiredPoints) this.txtPoints.setColor("#54ff82");
		this.txtPointsAdded.setText(`+${addedScore}`);
		this.time.delayedCall(1000, () => this.txtPointsAdded.setText(""));
	}

	private onBlockAmountUpdated(value: number): void {
		this.txtBlocks.setText(String(value));
		this.gems_collect.setText(String(gameState.totalStackedBlocks));
	}

	// ─── UTILITIES ────────────────────────────────────────────────────────────

	private formatTime(ms: number): string {
		const totalSeconds = Math.max(0, Math.floor(ms / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	private goToLevelSelect(): void {
		console.log("Navigating to Level Select");
		LevelAnalytics.clearContext();
		this.scene.start("Preload");
	}

	onLoseButtonClicked(): void {
		this.changeGameState(GAME_STATE.GAME_OVER_LOSE);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
