//oq-composer 0.4
//2017/06/24-


//----------------------------------------
//Main class.
//2017/06/24
var OqComp = function() {
	this.REFPAGE = 'oq_refpage';
	this.params = new Object();

	this.sections = new Array();
	this.pages = new Array();
	this.nowsection = 0;

	this.displaySwitch = new Array();
	this.DISPLAYSWITCH = 'oq_display_switch';

	this.inf = new Array();	//Information.

	this.settings = {
		lang: 'ja',
		title: ''
	};

	this.allTextResource = {
		ja: {appName: 'oq-composer'
		},
		en: {appName: 'oq-composer'
		}
	};

	this.textResource = null;

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

OqComp.prototype = {
	//====================
	//Input

	//--------------------
	//言語を追加
	addLang: function(ar_lang) {
		this.pages.ar_lang = new Array();
		this.settings.lang = ar_lang;
	},

	//--------------------
	//項目を追加☆
	addPage: function(ar_display, ar_level, ar_itemId, ar_no, ar_itemName, ar_content, ar_file) {
		this.sections.push(new IndexItem(ar_display, ar_level, ar_itemId, ar_no, ar_itemName, ar_content, ar_file));
	},

	//--------------------
	//Add information item.
	addInf: function(ar_display, ar_level, ar_date_time, ar_short_inf, ar_long_inf) {
		this.inf.push(new InfItem(ar_display, ar_level, ar_date_time, ar_short_inf, ar_long_inf));
	},

	//--------------------
	//追加完了
	endSection: function() {
		//＠＠＠番号を調整する
	},

	//====================
	//Output

	//--------------------
	//On resize
	resizePage: function() {
		var count;
console.log('resize');
		for(count=0; count < this.sections[this.nowsection].content.length ; count++) {
			if(this.sections[this.nowsection].content[count][0]==1) this.adjustPage(this.REFPAGE + count);
		}
	},

	//--------------------
	//Set size of component pages
	adjustPage: function(ar_eid) {
		if(document.getElementById(ar_eid)) {
			var ref = document.getElementById(ar_eid);
			var page = ref.contentWindow.document.documentElement;

			ref.style.height = page.offsetHeight+'px';
		}
	},

	//--------------------
	//Make page
	makePage: function() {
		var itemId, lang, count;

		itemId = this.params['page'];
		lang = this.params.lang;

		if(itemId==null) {
			for(this.nowsection=0; this.sections[this.nowsection].content==null && this.nowsection < this.sections.length-1; this.nowsection++) {}

		} else {
			for(count=0; this.sections[count].itemId!=itemId && count < this.sections.length-1; count++) {}

			this.nowsection = count;
		}

		//Fill file of empty menu.
		for(count=this.sections.length-1; count>=0; count--) {
			if(this.sections[count].file == null) {
				this.sections[count].file = this.sections[count+1].file;
				this.sections[count].menuLink = this.sections[count+1].file + '?page=' + this.sections[count+1].itemId;
			} else {
				this.sections[count].menuLink = this.sections[count].file + '?page=' + this.sections[count].itemId;
			}
		}

		if(document.getElementById('oq_vmenu_all'))
			document.getElementById('oq_vmenu_all').innerHTML=this.makeVMenuHTML(this.nowsection);

		if(document.getElementById('oq_vmenu_selected'))
			document.getElementById('oq_vmenu_selected').innerHTML=this.makeHMenuHTML(this.nowsection, 2);

		if(document.getElementById('oq_hmenu'))
			document.getElementById('oq_hmenu').innerHTML=this.makeHMenuHTML(this.nowsection, 1);

		if(document.getElementById('oq_content'))
			document.getElementById('oq_content').innerHTML=this.makeContentHTML(this.nowsection);
	},

	//--------------------
	//V Menu HTML作成. Jun. 25, 2017
	makeVMenuHTML: function(ar_itemId) {
		var count, rtn='';

		for(count=0; count < this.sections.length; count++) {
			if(this.sections[count].display == 0) continue;

			if(count == ar_itemId) {
				rtn += '<div class="oq_menu' + this.sections[count].level + ' oq_selected_item">' +
					this.sections[count].no + ' ' + this.sections[count].itemName + '</div>\n';

			} else {
				rtn += '<div class="oq_menu' + this.sections[count].level + '"><a href="' +
					this.sections[count].menuLink + '">' +
					this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div>\n';
			}
		}

		return rtn;
	},

	//--------------------
	//H Menu HTML作成. Aug. 02, 2017
	makeHMenuHTML: function(ar_itemId, ar_type) {
		var count, rtn='', trace=0, levels=['', '', '', '', '', '', ''], selected_path=0;

		trace = this.sections[ar_itemId].level;

		//Selected item.
		if(this.sections[ar_itemId].display == 1) {
			rtn = '<div class="oq_menu' + this.sections[ar_itemId].level + '"><div class="oq_menu_item oq_selected_item">' +
				this.sections[ar_itemId].no + ' ' + this.sections[ar_itemId].itemName + '</div></div>\n';
			levels[this.sections[ar_itemId].level] =
				'<div class="oq_menu_item oq_selected_item">' +
				this.sections[ar_itemId].no + ' ' + this.sections[ar_itemId].itemName + '</div>';
		}

		//Selected item to first.
		for(count=ar_itemId-1; count >= 0; count--) {
			if(this.sections[count].level < trace) {
				trace = this.sections[count].level;
				selected_path = 1;
			}

			if(this.sections[count].display == 0) continue;

			if(this.sections[count].level == trace) {
				if(selected_path==0) {
					rtn = '<div class="oq_menu' + this.sections[count].level + '"><div class="oq_menu_item"><a href="' +
						this.sections[count].menuLink + '">' +
						this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div></div>\n' + rtn;

					levels[this.sections[count].level] = '<div class="oq_menu_item"><a href="' +
						this.sections[count].menuLink + '">' +
						this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div>' + levels[this.sections[count].level];
				} else {
					rtn = '<div class="oq_menu' + this.sections[count].level + '"><div class="oq_menu_item oq_selected_path"><a href="' +
						this.sections[count].menuLink + '">' +
						this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div></div>\n' + rtn;

					levels[this.sections[count].level] = '<div class="oq_menu_item oq_selected_path"><a href="' +
						this.sections[count].menuLink + '">' +
						this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div>' + levels[this.sections[count].level];
				}
			}

			selected_path = 0;
		}

		if(ar_itemId < this.sections.length-1) {
			trace = this.sections[ar_itemId+1].level;

			for(count=ar_itemId+1; count < this.sections.length; count++) {
				if(this.sections[count].level < trace) trace = this.sections[count].level;
				if(this.sections[count].display == 0) continue;

				if(this.sections[count].level == trace) {
					rtn += '<div class="oq_menu' + this.sections[count].level + '"><div class="oq_menu_item"><a href="' +
						this.sections[count].menuLink + '">' +
						this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div></div>\n';

					levels[this.sections[count].level] += '<div class="oq_menu_item"><a href="' +
						this.sections[count].menuLink + '">' +
						this.sections[count].no + ' ' + this.sections[count].itemName + '</a></div>';
				}
			}
		}

		//Menu Vertical.
		if(ar_type==2) return rtn;

		//Menu Horizontal.
		rtn = '';
		for(count=1; count<7 && levels[count]!=''; count++) {
			rtn += '<div class="oq_menu' + count + '">' + levels[count] + '<div class="clear_both"></div></div>';
		}

		return rtn;
	},

	//--------------------
	//Content HTML作成　Jun. 25 2017
	makeContentHTML: function(ar_itemNo) {
		var rtn='', count;

		console.log('open:'+ar_itemNo);

		document.title = this.sections[ar_itemNo].no + ' ' + this.sections[ar_itemNo].itemName + ' - ' + this.settings.title;

		//タイトルを抜いた
		rtn = '';//'<div class="oq_title">' + this.sections[ar_itemNo].no + ' ' +
//			this.sections[ar_itemNo].itemName + '</div>';

		rtn += this.makeContentBodyHTML(this.sections[ar_itemNo].content);

		return rtn;
	},

	//--------------------
	//Content HTML作成　Jul. 28 2017
	makeContentBodyHTML: function(ar_content) {
		var rtn='', count;

		if(ar_content==null) return rtn;

		for(count=0; count < ar_content.length ; count++) {
			if(ar_content[count][0]==1) {
				rtn += '<iframe class="oq_reffer" id="' + this.REFPAGE + count + '" src="' + ar_content[count][1] +
					'" onLoad="oq_comp.adjustPage(this.id)"></iframe>';
			} else {
				rtn += '<div>' + ar_content[count][1] + '</div>';
			}
		}

		return rtn;
	},

	//--------------------
	//Set Div display switch. 　Feb. 09, 2018
	setSwitchDiv: function() {
		var counta, countb, els, tmp;

		els = document.getElementsByClassName(this.DISPLAYSWITCH);

		for(countb=0; countb<els.length; countb++) {
			this.displaySwitch.push(new Array());
			this.displaySwitch[countb].push(this.DISPLAYSWITCH+countb);
			els[countb].setAttribute('id', this.DISPLAYSWITCH+countb);
console.log(this.DISPLAYSWITCH+countb+' ');

			for(counta=0; counta<els[countb].options.length; counta++) {
				tmp = document.getElementById(els[countb].options[counta].value);
				this.displaySwitch[countb].push(els[countb].options[counta].value);
console.log(els[countb].options[counta].value+' ');
				if(counta == els[countb].selectedIndex) {
					tmp.style.display='block';
				} else {
					tmp.style.display='none';
				}
			}

			els[countb].addEventListener( 'click' , oq_comp.ehSwitchDiv , false );
		}

	},

	ehSwitchDiv: function(e) {
		var ele, counta, tmp;

		ele = e.target.parentNode;

		for(counta=0; counta<ele.options.length; counta++) {
			tmp = document.getElementById(ele.options[counta].value);

			if(ele.options[counta].selected) {
				tmp.style.display='block';
			} else {
				tmp.style.display='none';
			}
		}

		window.parent.oq_comp.resizePage();
	}
};

//========================================
//Processing

//----------------------------------------
//Index item
//2017/06/23
var IndexItem = function(ar_display, ar_level, ar_itemId, ar_no, ar_itemName, ar_content, ar_file) {
	this.display = ar_display;	//Display in index. 1:yes, 0:no.
	this.level = ar_level;	//0：表紙　1以上：そのレベル
	this.itemId = ar_itemId;	//ID for system.
	this.no = ar_no;	//Number (String)
	this.itemName = ar_itemName;	//Name for reader.
	this.content = ar_content;
	this.file = ar_file;
	this.menuLink = null;
};

//----------------------------------------
//Infromation item. !!!Under construction!!!
//Nov. 10, 2018
var InfItem = function(ar_display, ar_level, ar_date_time, ar_short_inf, ar_long_inf) {
	this.display = ar_display;	//Display in index. 1:yes, 0:no.
	this.level = ar_level;	//Priority.
	this.date_time = new Date(ar_date_time);

	this.short_inf = ar_short_inf;
	this.long_inf = ar_long_inf;
};

//========================================
//Start.
var oq_comp = new OqComp();
var oq_tmid = 0;

window.onload = function() {
	oq_comp.setSwitchDiv();

	if(window == window.parent) {
		if(oq_comp.sections.length>0) {
			oq_comp.makePage();
		} else {
			var temp = document.getElementsByClassName('oq_page_component')[0];

			temp.style.overflow='visible';
		}
	}
};

window.onresize = function() {
	if(window != window.parent || oq_comp.sections.length==0) return;

	if (oq_tmid > 0) {
		clearTimeout(oq_tmid);
	}

	oq_tmid = setTimeout(function () {
		oq_comp.resizePage();
	}, 200);
};
