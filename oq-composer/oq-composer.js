//oq-composer 0.45
//2017. 06. 24-
//2021. 11. 05: Media pause on switch.
//2021. 12. 05: Basic functions for Information.
//2021. 12. 11: Change to window eventlisteners from functions.
//2022. 01. 02: Update information.
//2022/03/07　公開用の完成品にするために複数メニューの準備

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


	window.addEventListener('load', function(){
		oq_comp.setSwitchDiv();
		oq_comp.makeInformation();

		if(window == window.parent) {
			if(oq_comp.sections.length>0) {
				oq_comp.makePage();
			} else {
				var temp = document.getElementsByClassName('oq_page_component')[0];

				temp.style.overflow='visible';
			}
		}
	}, false);

	window.addEventListener('resize', function(){
		if(window != window.parent || oq_comp.sections.length==0) return;

		if (oq_tmid > 0) {
			clearTimeout(oq_tmid);
		}

		oq_tmid = setTimeout(function () {
			oq_comp.resizePage();
		}, 200);
	}, false);

	this.settings = {
		lang: 'ja',
		locale: 'JP',
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
	addInf: function(ar_display, ar_level, ar_date_time, ar_type, ar_body) {
		this.inf.push(new InfItem(ar_display, ar_level, ar_date_time, ar_type, ar_body));
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
		var itemId, lang, counta, tmp;

		itemId = this.params['page'];
		lang = this.params.lang;

		if(itemId==null) {
			for(this.nowsection=0; this.sections[this.nowsection].content==null && this.nowsection < this.sections.length-1; this.nowsection++) {}

		} else {
			for(counta=0; this.sections[counta].itemId!=itemId && counta < this.sections.length-1; counta++) {}
			this.nowsection = counta;

			for(; this.sections[this.nowsection].content==null && this.nowsection < this.sections.length-1; this.nowsection++) {}
		}

		//Fill file of empty menu.
		for(counta=this.sections.length-1; counta>=0; counta--) {
			if(this.sections[counta].file == null) {
				this.sections[counta].file = this.sections[counta+1].file;
				this.sections[counta].menuLink = this.sections[counta+1].file + '?page=' + this.sections[counta+1].itemId;
			} else {
				this.sections[counta].menuLink = this.sections[counta].file + '?page=' + this.sections[counta].itemId;
			}
		}

		tmp = document.getElementsByClassName('oqc_vmenu_all');
		if(tmp) {
			for(counta=0; counta<tmp.length; counta++)
				tmp[counta].innerHTML=this.makeVMenuHTML(this.nowsection);
		}
		
		tmp = document.getElementsByClassName('oqc_vmenu_selected');
		if(tmp) {
			for(counta=0; counta<tmp.length; counta++)
				tmp[counta].innerHTML=this.makeHMenuHTML(this.nowsection, 2);
		}


		tmp = document.getElementsByClassName('oqc_hmenu');
		if(tmp) {
			for(counta=0; counta<tmp.length; counta++)
				tmp[counta].innerHTML=this.makeHMenuHTML(this.nowsection, 1);
		}

		tmp = document.getElementsByClassName('oqc_content');
		if(tmp) tmp[0].innerHTML = this.makeContentHTML(this.nowsection);


//		if(document.getElementById('oq_vmenu_all'))
//			document.getElementById('oq_vmenu_all').innerHTML=this.makeVMenuHTML(this.nowsection);

//		if(document.getElementById('oq_vmenu_selected'))
//			document.getElementById('oq_vmenu_selected').innerHTML=this.makeHMenuHTML(this.nowsection, 2);

//		if(document.getElementById('oq_hmenu'))
//			document.getElementById('oq_hmenu').innerHTML=this.makeHMenuHTML(this.nowsection, 1);

//		if(document.getElementById('oq_content'))
//			document.getElementById('oq_content').innerHTML=this.makeContentHTML(this.nowsection);
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
				rtn += '<div class="oq_menu' + this.sections[count].level + '">' +
					this.makeMenuLink(count) + '</div>\n';
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
					rtn = '<div class="oq_menu' + this.sections[count].level + '"><div class="oq_menu_item">' +
						this.makeMenuLink(count) + '</div></div>\n' + rtn;

					levels[this.sections[count].level] = '<div class="oq_menu_item">' +
						this.makeMenuLink(count) + '</div>' + levels[this.sections[count].level];
				} else {
					rtn = '<div class="oq_menu' + this.sections[count].level + '"><div class="oq_menu_item oq_selected_path">' +
						this.makeMenuLink(count) + '</div></div>\n' + rtn;

					levels[this.sections[count].level] = '<div class="oq_menu_item oq_selected_path">' +
						this.makeMenuLink(count) + '</div>' + levels[this.sections[count].level];
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
					rtn += '<div class="oq_menu' + this.sections[count].level + '"><div class="oq_menu_item">' +
						this.makeMenuLink(count) + '</div></div>\n';

					levels[this.sections[count].level] += '<div class="oq_menu_item">' +
						this.makeMenuLink(count) + '</div>';
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
	//Mar. 25 2020
	makeMenuLink: function(arItemId) {
		var rtn;

		if(this.sections[arItemId].content == null && this.sections[arItemId].menuLink == null) {
			rtn = '<a ' + this.sections[arItemId].file + '>';
		} else {
			rtn = '<a href="' + this.sections[arItemId].menuLink + '">';
		}

		return rtn + this.sections[arItemId].no + ' ' + this.sections[arItemId].itemName + '</a>';
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
	//Dec. 5, 2021
	makeInformation: function() {
		var counta, tmp;
		
console.log('inf!!');		

		tmp = document.getElementsByClassName('oqc_inf');
		if(!tmp) return;

		for(counta=0; counta<tmp.length; counta++) {
			tmp[counta].innerHTML = this.makeInfHTML(tmp[counta]);
		}
	},

	makeInfHTML: function(ar_div) {
		var rtn, counta, mina, maxa, dfa, countb, tmp, ord=1, infcp = Array(), re=null, stmp, sel = Array();
console.log('inf!!');

		stmp = ar_div.getAttribute('oqc_inf_cond');
		if(stmp!=null) re = new RegExp(stmp);

		stmp = ar_div.getAttribute('oqc_inf_select');
		if(stmp==null) for(counta=0; counta<=this.inf[counta].body.length; counta++) sel.push(counta-1);
		else {
			tmp = (stmp.replace(' ','')).split(',');
			
			for(counta=0; counta<tmp.length; counta++) {
				sel.push(parseInt(tmp[counta]));
			}
		}

		for(counta=0; counta<this.inf.length; counta++) {
			if(this.inf[counta].date_time > new Date()) continue;

			stmp = this.inf[counta].body[0];
			for(countb=1; countb < this.inf[counta].body.length; countb++) stmp += '\t' + this.inf[counta].body[countb];
			if(re != null) if(!re.test(stmp)) continue;

			infcp.push(this.inf[counta]);
		}

		tmp = ar_div.getAttribute('oqc_order');
		if(tmp == 'za') ord=-1;
		infcp.sort(function(a, b){return (a.date_time > b.date_time ? ord : -ord)});
		
		rtn = '<table>';

		mina = 0;
		maxa = infcp.length;
		tmp = ar_div.getAttribute('oqc_items');
		if(tmp){
			tmp = parseInt(tmp,10);
			if(tmp > 0) {
				if(tmp < maxa) maxa = tmp;
			} else {
				if(-tmp < maxa) mina = maxa + tmp;
			}
		}
console.log('inf:'+mina+' '+maxa);
		for(counta = mina; counta<maxa; counta++) {
			if(infcp[counta].display==0) continue;
			
			rtn += '<tr>';
			
			for(countb=0; countb<sel.length; countb++) {
				if(sel[countb]<0) rtn += '<td class="oqc_inf_date">' + infcp[counta].date_time.toLocaleDateString() + '</td>';
				else rtn += '<td class="oqc_inf_body'+sel[countb]+'">' + infcp[counta].body[sel[countb]] + '</td>';
			}
			
			rtn += '</tr>';
		}

		return rtn+'</table>';
	},

	//--------------------
	//Set Div display switch. 　Feb. 09, 2018 - Nov. 05, 2021
	//Nov. 05, 2021: Add movie stop.
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
		var ele, counta, tmp, media;

		ele = e.target.parentNode;

		for(counta=0; counta<ele.options.length; counta++) {
			tmp = document.getElementById(ele.options[counta].value);

			if(ele.options[counta].selected) {
				tmp.style.display='block';
			} else {
				tmp.style.display='none';

				//2021.11.05
				media = tmp.getElementsByTagName('video');
				for(var media_ele of media) {media_ele.pause();}

				media = tmp.getElementsByTagName('audio');
				for(var media_ele of media) {media_ele.pause();}
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
var InfItem = function(ar_display, ar_level, ar_date_time, ar_body) {
	this.display = ar_display;	//Display in index. 1:yes, 0:no.
	this.level = ar_level;	//Priority.
	this.date_time = new Date(ar_date_time);
	this.body = ar_body;
};

//========================================
//Start.
var oq_comp = new OqComp();
var oq_tmid = 0;
