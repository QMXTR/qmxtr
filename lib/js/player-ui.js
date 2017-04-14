import "roboto-fontface";
import "typeface-notosans-jp";
import "typeface-nanum-square";

import QAAPanel from "../components/QAAPanel.vue";
import QAside from "../components/QAside.vue";
import QControlBar from "../components/QControlBar.vue";
import QController from "../components/QController.vue";
import QIcon from "../components/QIcon.vue";
import QLyricPanel from "../components/QLyricPanel.vue";
import QPanel from "../components/QPanel.vue";
import QPlaylist from "../components/QPlaylist.vue";
import QSeekbar from "../components/QSeekbar.vue";
import QTab from "../components/QTab.vue";
import QTabPanel from "../components/QTabPanel.vue";
import QWorkspace from "../components/QWorkspace.vue";


class QmxtrUI{
	static install(Vue){
		Vue.component('q-aa-panel', QAAPanel);
		Vue.component('q-aside', QAside);
		Vue.component('q-controlbar', QControlBar);
		Vue.component('q-controller', QController);
		Vue.component('q-icon', QIcon);
		Vue.component('q-lyric-panel', QLyricPanel);
		Vue.component('q-panel', QPanel);
		Vue.component('q-playlist', QPlaylist);
		Vue.component('q-seekbar', QSeekbar);
		Vue.component('q-tab', QTab);
		Vue.component('q-tab-panel', QTabPanel);
		Vue.component('q-workspace', QWorkspace);
	}
}

export default QmxtrUI;
