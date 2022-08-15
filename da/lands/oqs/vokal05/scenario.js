//Ver. 2019/09/13

oqSlide.init({point:100})

oqSlide.addState('start', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_4049.jpg',0),
new PlayItem(oqs_HTML_MX, '単語が２つ続けて発音されます．発音されている母音が同じ母音であるか，違う母音であるかを答えてください．',0)
], [
new UiItem(oqs_BUTTON, 'スタート', oqs_STATE, 'question01', )
], [

]);

oqSlide.addState('question01', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_4049.jpg',0),
new PlayItem(oqs_HTML_MX, '単語が２つ続けて発音されます．発音されている母音が同じ母音であるか，違う母音であるかを答えてください．',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/ev01.mp3',)
], [
new UiItem(oqs_BUTTON, '同じ', oqs_STATE, 'mistake01', ),
new UiItem(oqs_BUTTON, '違う', oqs_STATE, 'correct01', ),
new UiItem(oqs_BUTTON, 'もう一度聞く', oqs_STATE, 'question01', )
], [

]);

oqSlide.addState('correct01', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, 'Glimrende!（素晴らしい！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_009.mp3',),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev01.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play01', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'question02', )
], [

]);

oqSlide.addState('mistake01', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_3451.jpg',0),
new PlayItem(oqs_HTML_MX, 'Prøv igen!（もう１回！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_005.mp3',)
], [
new UiItem(oqs_BUTTON, 'もう一度', oqs_STATE, 'question01', ),
new UiItem(oqs_BUTTON, '正解を確認', oqs_STATE, 'play01', )
], [

]);

oqSlide.addState('play01', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, '２つの単語の発音は異なっています．',0),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev01.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play01', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'question02', )
], [

]);

oqSlide.addState('question02', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_4049.jpg',0),
new PlayItem(oqs_HTML_MX, '単語が２つ続けて発音されます．発音されている母音が同じ母音であるか，違う母音であるかを答えてください．',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/ev02.mp3',)
], [
new UiItem(oqs_BUTTON, '同じ', oqs_STATE, 'mistake02', ),
new UiItem(oqs_BUTTON, '違う', oqs_STATE, 'correct02', ),
new UiItem(oqs_BUTTON, 'もう一度聞く', oqs_STATE, 'question02', )
], [

]);

oqSlide.addState('correct02', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, 'Glimrende!（素晴らしい！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_009.mp3',),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev02.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play02', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'question03', )
], [

]);

oqSlide.addState('mistake02', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_3451.jpg',0),
new PlayItem(oqs_HTML_MX, 'Prøv igen! （もう１回）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_005.mp3',)
], [
new UiItem(oqs_BUTTON, 'もう一度', oqs_STATE, 'question02', ),
new UiItem(oqs_BUTTON, '正解を確認', oqs_STATE, 'play02', )
], [

]);

oqSlide.addState('play02', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, '２つの単語の発音は異なっています．',0),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev02.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play02', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'question03', )
], [

]);

oqSlide.addState('question03', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_4049.jpg',0),
new PlayItem(oqs_HTML_MX, '単語が２つ続けて発音されます．発音されている母音が同じ母音であるか，違う母音であるかを答えてください．',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/ev03.mp3',)
], [
new UiItem(oqs_BUTTON, '同じ', oqs_STATE, 'mistake03', ),
new UiItem(oqs_BUTTON, '違う', oqs_STATE, 'correct03', ),
new UiItem(oqs_BUTTON, 'もう一度聞く', oqs_STATE, 'question03', )
], [

]);

oqSlide.addState('correct03', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, 'Glimrende!（素晴らしい！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_009.mp3',),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev03.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play03', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'question04', )
], [

]);

oqSlide.addState('mistake03', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_3451.jpg',0),
new PlayItem(oqs_HTML_MX, 'Prøv igen! （もう１回！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_005.mp3',)
], [
new UiItem(oqs_BUTTON, 'もう一度', oqs_STATE, 'question03', ),
new UiItem(oqs_BUTTON, '正解を確認', oqs_STATE, 'play03', )
], [

]);

oqSlide.addState('play03', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, '２つの単語の発音は異なっています．',0),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev03.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play03', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'question04', )
], [

]);

oqSlide.addState('question04', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_4049.jpg',0),
new PlayItem(oqs_HTML_MX, '単語が２つ続けて発音されます．発音されている母音が同じ母音であるか，違う母音であるかを答えてください．',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/ev04.mp3',)
], [
new UiItem(oqs_BUTTON, '同じ', oqs_STATE, 'correct04', ),
new UiItem(oqs_BUTTON, '違う', oqs_STATE, 'mistake04', ),
new UiItem(oqs_BUTTON, 'もう一度聞く', oqs_STATE, 'question04', )
], [

]);

oqSlide.addState('correct04', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, 'Glimrende! （素晴らしい！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_009.mp3',),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev04.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play04', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'finished', )
], [

]);

oqSlide.addState('mistake04', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_3451.jpg',0),
new PlayItem(oqs_HTML_MX, 'Prøv igen! （もう１回！）',0),
new PlayItem(oqs_AUDIO, 'oqs/vokal05/00q_005.mp3',)
], [
new UiItem(oqs_BUTTON, 'もう一度', oqs_STATE, 'question04', ),
new UiItem(oqs_BUTTON, '正解を確認', oqs_STATE, 'play04', )
], [

]);

oqSlide.addState('play04', oqs_ORDER ,86400, [
new PlayItem(oqs_HTML_MX, '２つの単語の発音は同じです．',0),
new PlayItem(oqs_VIDEO, 'oqs/vokal05/ev04.mp4',)
], [
new UiItem(oqs_BUTTON, 'もう１度確認', oqs_STATE, 'play04', ),
new UiItem(oqs_BUTTON, '次へ', oqs_STATE, 'finished', )
], [

]);

oqSlide.addState('finished', oqs_ORDER ,86400, [
new PlayItem(oqs_IMAGE, 'oqs/vokal05/IMG_4049.jpg',0),
new PlayItem(oqs_HTML_MX, 'お疲れさまでした！',0)
], [
new UiItem(oqs_BUTTON, '最初から', oqs_STATE, 'start', )
], [

]);

