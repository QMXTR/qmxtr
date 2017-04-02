import QAAPanel from "../components/QAAPanel.vue";
import QAside from "../components/QAside.vue";
import QControlBar from "../components/QControlBar.vue";
import QController from "../components/QController.vue";
import QLyricPanel from "../components/QLyricPanel.vue";
import QPanel from "../components/QPanel.vue";
import QPlaylist from "../components/QPlaylist.vue";
import QSeekbar from "../components/QSeekbar.vue";
import QTab from "../components/QTab.vue";
import QTabbar from "../components/QTabbar.vue";
import QWorkspace from "../components/QWorkspace.vue";

class QmxtrUI{
	static install(Vue){
		Vue.component('q-aa-panel', QAAPanel);
		Vue.component('q-aside', QAside);
		Vue.component('q-controlbar', QControlBar);
		Vue.component('q-controller', QController);
		Vue.component('q-lyric-panel', QLyricPanel);
		Vue.component('q-panel', QPanel);
		Vue.component('q-playlist', QPlaylist);
		Vue.component('q-seekbar', QSeekbar);
		Vue.component('q-tab', QTab);
		Vue.component('q-tabbar', QTabbar);
		Vue.component('q-workspace', QWorkspace);
	}
}

export default QmxtrUI;
