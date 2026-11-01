import Vue from "vue";
// 内部 BFE 未随需求提供：以同名前缀提供可替换的本地语义化适配层。
export default function install() {
  Vue.component("bfe-button", {
    inheritAttrs: false,
    props: { kind: { default: "secondary" }, loading: Boolean },
    template:
      '<button v-bind="$attrs" :disabled="loading || $attrs.disabled" :class="[\'bfe-button\',\'bfe-button--\'+kind]" @click="$emit(\'click\',$event)"><span v-if="loading" class="spinner"></span><slot/></button>',
  });
  Vue.component("bfe-input", {
    props: ["value"],
    template:
      '<input class="bfe-input" v-bind="$attrs" :value="value" @input="$emit(\'input\',$event.target.value)" @keyup.enter="$emit(\'enter\')">',
  });
  Vue.component("bfe-form", {
    template:
      '<form class="bfe-form" @submit.prevent="$emit(\'submit\')"><slot/></form>',
  });
  Vue.component("bfe-form-item", {
    props: ["label"],
    template: '<div class="bfe-form-item"><span>{{label}}</span><slot/></div>',
  });
  Vue.component("bfe-option", {
    props: ["value"],
    template: '<option :value="value"><slot/></option>',
  });
  Vue.component("bfe-select", {
    props: ["value", "label"],
    template:
      '<select class="bfe-select" :aria-label="label" :value="value" @change="$emit(\'input\',$event.target.value)"><slot/></select>',
  });
  Vue.component("bfe-tag", {
    props: { kind: String, closable: Boolean },
    template:
      '<span :class="[\'bfe-tag\',kind]"><slot/><button v-if="closable" aria-label="移除条件" @click="$emit(\'close\')">×</button></span>',
  });
  Vue.component("bfe-table", {
    props: ["loading"],
    template:
      '<div class="bfe-table" :aria-busy="loading"><div v-if="loading" class="table-loading" role="status">正在加载产品…</div><slot/></div>',
  });
  Vue.component("bfe-page", {
    props: ["value", "total", "size"],
    computed: {
      count() {
        return Math.max(1, Math.ceil(this.total / this.size));
      },
    },
    template:
      '<nav class="pagination" aria-label="分页"><span>共 {{total}} 条</span><button aria-label="上一页" :disabled="value<=1" @click="$emit(\'input\',value-1)">‹</button><button v-for="n in count" :key="n" :class="{active:n===value}" :aria-current="n===value?\'page\':null" @click="$emit(\'input\',n)">{{n}}</button><button aria-label="下一页" :disabled="value>=count" @click="$emit(\'input\',value+1)">›</button><select aria-label="每页条数" :value="size" @change="$emit(\'size\',Number($event.target.value))"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option></select></nav>',
  });
  Vue.component("bfe-message", {
    props: ["message"],
    template:
      '<div v-if="message" class="message" :class="message.kind" role="status">{{message.text}}</div>',
  });
}
