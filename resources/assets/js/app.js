
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');


window.Vue = require('vue');
window.brain = require('brain.js');


/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */


//Vue.component('example-component', require('./components/bab.vue'));
Vue.component('random-chart', require('./components/RandomChart.vue'));
Vue.component('data-list', require('./components/DataList.vue'));

import { TableComponent, TableColumn } from 'vue-table-component';

Vue.component('table-component', TableComponent);
Vue.component('table-column', TableColumn);


const app = new Vue({
    el: '#app',
    data() {
        return {
            chartData: {}
        }
    },
    methods: {
        viewData: function (rowData) {
            console.log('viewing', rowData);
            this.chartData = rowData;
        }
    }
});

