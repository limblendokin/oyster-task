import Vue from 'vue';
import App from './App.vue';
import { Table, Icon, Input, Button } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import { createProvider } from './vue-apollo'
Vue.use(Table);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Button);
// Vue.use(Table);
Vue.config.productionTip = false;

new Vue({
  apolloProvider: createProvider(),
  render: (h) => h(App)
}).$mount('#app');
