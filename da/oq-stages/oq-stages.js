//oq-stages 0.4
//2018/02/26-

//Const
const oqs_HTML_M = 1;
const oqs_HTML_MX = 2;
const oqs_HTML_MXC = 3;
const oqs_HTML_H = 4;
const oqs_HTML_B = 5;
const oqs_HTML_BX = 6;
const oqs_HTML_BXC = 6;

const oqs_IMAGE = 10;
const oqs_IMAGE_B = 11;

const oqs_VIDEO = 20;
const oqs_VIDEO_P = 21;
const oqs_AUDIO = 22;
const oqs_AUDIO_SE = 23;
const oqs_STATE = 30;

const oqs_BUTTON = 1;
const oqs_TEXT = 2;

const oqs_NONE = 1;
const oqs_PLAY = 2;
const oqs_PAUSE = 3;

const oqs_ORDER = 1;
const oqs_RANDOM = 2;

const oqs_PLUS = 1;
const oqs_MINUS = 2;
const oqs_MULT = 3;
const oqs_DIV = 4;

//----------------------------------------
//Books
//2017/06/24
var Oqslide = function() {
	//Settings
	this.params = new Object();
	this.settings = {
		lang: 'ja',
		div_id: 'oqs_body',
		video_el: 'oqs_video',
		image_b_el: 'oqs_image_b',
		audio_el: 'oqs_audio',
		audio_se_el: 'oqs_audio_se',
		htmlh_id: 'oqs_header',
		htmlm_id: 'oqs_mid',
		htmlb_id: 'oqs_bottom',
		ui_id: 'oqs_ui'
	};

	this.vals = {
		point:100
	};

	//Body
	this.scenario = new Array();

	this.now_state = null;
	this.now_play = 0;

	this.timer_id = -1;
	this.play_obj = null;
	this.time_state = 0;

	this.myname;
	this.image_b;
	this.video_player;
	this.audio_se;
	this.html_div_h;
	this.html_div_m;
	this.html_div_b;

	//For old mode.
	this.txt_clear=0;

	if(3 < document.location.search.length) {
		tmp = document.location.search.substring(1).split('&');

		this.params = new Object();

		for(var count = 0; count < tmp.length; count++) {
			tmpb = tmp[count].split('=');

			this.params[decodeURIComponent(tmpb[0])] =
				decodeURIComponent(decodeURIComponent(tmpb[1]));
		}
	} else {
		this.params.page=null;
		this.params.lang=null;
	}
};

Oqslide.prototype = {
	//====================
	//Input

	//--------------------
	//Add state
	addState: function(ar_id, ar_order, ar_time, ar_play, ar_ui, nextlink) {
		var st_tmp = new ScenarioState(ar_id, ar_order, ar_time);
		st_tmp.play_item = ar_play;
		st_tmp.ui_item = ar_ui;
		st_tmp.nextlink = nextlink;

		this.scenario.push(st_tmp);
	},

	//====================
	//Processing

	//--------------------
	//Init.
	init: function(ar_vals) {
		if(ar_vals!=null) {
			this.vals = ar_vals;

			if(this.vals.point==undefined) this.vals.point=100
		}
	},

	//--------------------
	//Start.
	start: function(ar_id) {
		var scenario, obody = document.getElementById(this.settings.div_id);
		var counta, countb, etmp;

		//Image B
		this.image_b = document.getElementById(this.settings.image_b_el);

		//Audio
		this.audio_player = document.getElementById(this.settings.audio_el);
		this.audio_player.setAttribute('onended', 'oqSlide.playMedia();');

		//Audio SE
		this.audio_se = document.getElementById(this.settings.audio_se_el);

		//Video
		this.video_player = document.getElementById(this.settings.video_el);
		this.video_player.setAttribute('onended', 'oqSlide.playMedia();');

		//HTML
		this.html_div_m = document.getElementById(this.settings.htmlm_id);
		this.html_div_h = document.getElementById(this.settings.htmlh_id);
		this.html_div_b = document.getElementById(this.settings.htmlb_id);

		this.move(ar_id);
	},

	//--------------------
	//Move state.
	move: function(ar_id) {
		var itmp;

		for (itmp=0; itmp<this.scenario.length; itmp++) {
			if(this.scenario[itmp].state_id==ar_id) break;
		}

		if(itmp >= this.scenario.length) {
			alert('oq-stages: Scenario error.');
			return;
		}

		this.now_state = this.scenario[itmp];
		document.getElementById(this.settings.ui_id).style.visibility = 'hidden';
		if(this.now_state.play_item==null) {
			this.now_play = -100;
			document.getElementById(this.settings.ui_id).style.visibility = 'visible';
		}
		else this.now_play = 0;

		this.makeUI();

		this.playMedia();
	},

	//--------------------
	//Make UI.
	makeUI: function() {
		var oqs_form = document.getElementById(this.settings.ui_id);
		var now_items = this.now_state.ui_item;
		var count, stmp = '', etmp;
console.log('makeUI> Start.');

		while(oqs_form.firstChild) oqs_form.removeChild(oqs_form.firstChild);

		for(count=0; count<now_items.length; count++) {
			if(now_items[count].ui == oqs_BUTTON) {
				etmp = oqs_form.appendChild(document.createElement('button'));
				etmp.setAttribute('type', 'button');
				etmp.appendChild(document.createTextNode(now_items[count].label));

				switch(now_items[count].media_type) {
					case oqs_STATE:
						etmp.setAttribute('onClick', 'oqSlide.move(\''+now_items[count].source+'\');');
						break;
					case oqs_HTML_H:
					case oqs_HTML_M:
					case oqs_HTML_B:
					case oqs_IMAGE:
					case oqs_IMAGE_B:
						etmp.setAttribute(
							'onClick', 'oqSlide.playBody(' + now_items[count].media_type + ',\'' +
							now_items[count].source + '\',-1);');
						break;
					case oqs_AUDIO:
					case oqs_AUDIO_SE:
					case oqs_VIDEO:
					case oqs_VIDEO_P:
						etmp.setAttribute(
							'onClick', 'oqSlide.playBody(' + now_items[count].media_type + ',\'' +
							now_items[count].source + '\',0);');
				}
			}
		}
	},

	//--------------------
	//Play items.
	playMedia: function() {
console.log('playMedia> Start.');
console.log('playMedia> pl_src:'+ this.play_obj);

		//End play section.
		if(this.now_play < 0 || this.now_state.play_item[0]==null) {
			document.getElementById(this.settings.ui_id).style.visibility = 'visible';

			//Move next
			if(this.now_state.nextlink.length>0) {
				this.timer_id = setTimeout(function(){oqSlide.nextState();}, 1000 * this.now_state.state_time);
			}

			return;
		}

		this.playBody(this.now_state.play_item[this.now_play].media_type,
			this.now_state.play_item[this.now_play].source,
			this.now_state.play_item[this.now_play].time );

		this.now_play++;
		if(this.now_play >= this.now_state.play_item.length) {
			this.now_play = -100;	//End play section.
		}

console.log('playMedia> End.');
	},

	//--------------------
	//Body of play function.
	playBody: function(ar_media_type, ar_source_id, ar_time) {

		//Clear playing.
		if(this.timer_id>0) {
			clearTimeout(this.timer_id);	//Rest timer
			this.timer_id = 0;
		}
		if(this.play_obj!=null) {
			this.play_obj.pause();
			this.play_obj = null;
		}

		//Play.
		switch(ar_media_type) {
			case oqs_HTML_H:
				this.setHTML(this.html_div_h, ar_source_id);

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_HTML_MXC:
				this.setHTML(this.html_div_m, ar_source_id);
				this.setHTML(this.html_div_b, '');
				this.txt_clear=1;

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_HTML_MX:
				this.setHTML(this.html_div_b, '');

			case oqs_HTML_M:
				this.setHTML(this.html_div_m, ar_source_id);
				this.txt_clear=0;

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_HTML_BXC:
				this.setHTML(this.html_div_b, ar_source_id);
				this.setHTML(this.html_div_m, '');
				this.txt_clear=1;

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_HTML_BX:
				this.setHTML(this.html_div_m, '');

			case oqs_HTML_B:
				this.setHTML(this.html_div_b, ar_source_id);
				this.txt_clear=0;

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_IMAGE:
				this.video_player.style.visibility = 'hidden';
				document.getElementById(this.settings.div_id).style.backgroundImage = 'url("' + ar_source_id + '")';

				if(this.txt_clear==1) {
					this.setHTML(this.html_div_m, '');
					this.setHTML(this.html_div_b, '');
					this.txt_clear=0;
				}

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_IMAGE_B:
				this.image_b.setAttribute('src', ar_source_id);

				if(ar_time>=0)
					this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 1000 * ar_time);
				break;

			case oqs_AUDIO_SE:
				this.audio_se.setAttribute('src', ar_source_id);
				this.audio_se.currentTime = 0;
				this.audio_se.play();

				this.timer_id = setTimeout(function(){oqSlide.playMedia();}, 0);
				break;

			case oqs_AUDIO:
				this.play_obj = this.audio_player;
				this.play_obj.setAttribute('src', ar_source_id);
				this.play_obj.currentTime = 0;
				this.play_obj.play();

				break;

			case oqs_VIDEO:
				if(this.txt_clear==1) {
					this.setHTML(this.html_div_m, '');
					this.setHTML(this.html_div_b, '');
					this.txt_clear=0;
				}

				this.play_obj = this.video_player;
				this.play_obj.style.visibility = 'visible';
				this.play_obj.setAttribute('src', ar_source_id);
				this.play_obj.removeAttribute('controls');
				this.play_obj.currentTime = 0;
				this.play_obj.play();
				break;

			case oqs_VIDEO_P:
				this.play_obj = this.video_player;
				this.play_obj.style.visibility = 'visible';
				this.play_obj.setAttribute('src', ar_source_id);
				this.play_obj.setAttribute('controls', null);
				this.play_obj.currentTime = 0;
				this.play_obj.play();
		}
	},

	//--------------------
	//Set HTML.
	setHTML: function(ar_obj, ar_HTML) {
		ar_obj.innerHTML = this.dispVals(ar_HTML);

		if(ar_HTML=='') ar_obj.style.visibility = 'hidden';
		else ar_obj.style.visibility = 'visible';
	},

	//--------------------
	//Move next.
	nextState: function() {
		var itmp;

console.log('nextState>');

		if(this.timer_id>0) {	//Reset timer.
			clearTimeout(this.timer_id);
			this.timer_id = 0;
		}

		itmp = parseInt(Math.random() * this.now_state.nextlink.length);

		this.move(this.now_state.nextlink[itmp].next);
	},

	//--------------------
	//Display values.
	dispVals: function(ar_str) {
		var count, rtn;

		rtn=ar_str;

		for(var key in this.vals) {
			rtn = rtn.replace(new RegExp('<value name="' + key + '">'), this.vals[key]);
		}

		return rtn;
	},

	//--------------------
	//
	etc: function() {
		//
	}
};

//========================================
//Element class.

//----------------------------------------
//Scenario item
//2018/02/26
var ScenarioState = function(ar_id, ar_order, ar_time) {
	this.state_id = ar_id;
	this.select_order = ar_order;
	this.state_time = ar_time;

	this.play_item = new Array();
	this.ui_item = new Array();
	this.nextlink = new Array();
};

//----------------------------------------
//Play item
//2018/02/26
var PlayItem = function(ar_type, ar_source, ar_time) {
	this.media_type = ar_type;
	//1:html. 2:image.
	this.source = ar_source;
	this.time = ar_time;
};

//----------------------------------------
//UI item
//2018/02/26
var UiItem = function(ar_ui, ar_label, ar_media_type, ar_source, ar_proc) {
	this.ui = ar_ui;
	this.label = ar_label;
	this.media_type = ar_media_type;
	this.source = ar_source;
	this.proc = ar_proc;
};

//----------------------------------------
//Next item
//2018/02/28
var NextItem = function(ar_next, ar_proc) {
	this.next = ar_next;
	this.proc = ar_proc;
};

//========================================
//Start.
var oqSlide = new Oqslide();
var oq_tmid = 0;	//for timer.

window.onload = function() {
	oqSlide.start('start');
};
