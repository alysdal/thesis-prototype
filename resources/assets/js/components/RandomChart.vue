<template>
    <div style="height: 100%">
        <div style="height: 20px" class="text-center">
            <label><input type="checkbox" v-model="show.x"> Show X</label>
            <label><input type="checkbox" v-model="show.y"> Show Y</label>
            <label><input type="checkbox" v-model="show.z"> Show Z</label>
            <label><input type="checkbox" v-model="show.d"> Show Magitude</label>
            <label><input type="checkbox" v-model="fixedYAxis"> Fixed Y </label>
        </div>
        <line-chart :chart-data="datacollection" :options="options" style="height: calc(100% - 20px)"></line-chart>
    </div>
</template>

<script>
    import LineChart from './bab.vue'

    export default {
        components: {
            LineChart
        },
        props: ['rowdata'],
        data () {
            return {
                datacollection: null,
                lastRow: null,
                fetchId: 'latest',
                show: {
                    x: true,
                    y: true,
                    z: true,
                    d: true
                },
                fixedYAxis: true,
                apiRow: [],
                showD: true,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    height: "100%",
                    scales: {
                        yAxes: [{
                            display:true,
                            type: 'linear',
                            ticks: {
                                min: -5000,
                                max: 5000,
                                stepSize: 250
                            }
                        }]
                    }
                }
            }
        },
        mounted () {
            this.fillData();
        },
        watch: {
            rowdata: function(newVal, oldVal) { // watch it
                this.fetchId = newVal.id;
                this.refreshData();
            },
            show: {
                handler(val){
                    this.fillData();
                },
                deep: true
            },
            fixedYAxis: function(newVal, oldVal) { // watch it
                if (newVal === true) {
                    this.options.scales.yAxes[0].ticks.max = 5000;
                    this.options.scales.yAxes[0].ticks.min = -5000;
                    this.options.scales.yAxes[0].ticks.stepSize = 250;
                } else {
                    this.options.scales.yAxes[0].ticks.max = undefined;
                    this.options.scales.yAxes[0].ticks.min = undefined;
                    this.options.scales.yAxes[0].ticks.stepSize = undefined;
                }
                this.fillData();
            },
        },
        methods: {
            refreshData() {
                axios.get('api/trainingdata/' + this.fetchId)
                    .then(response => {
                        this.apiRow = response.data;
                        if (this.apiRow.id === (this.lastRow ? this.lastRow.id : 0)) {
                            // do nothing
                            //console.log('Ignoring same data', this.apiRow.id);
                            return;
                        }
                        this.fillData();
                    })
            },
            fillData () {
                let apiData = this.apiRow.data;

                //console.log('Drawing new data #', this.apiRow.id);
                this.lastRow = this.apiRow;

                //console.log(response.data)
                let labels = [];
                let data = {
                    x: [],
                    y: [],
                    z: [],
                    d: [],
                };

                let lastData = {
                    x: null,
                    y: null,
                    z: null,
                    d: null,
                }


                for (let property in apiData) {
                    let row = apiData[property];
                    //console.log(row);

                    let x = row.x;
                    let y = row.y;
                    let z = row.z;

                    if (lastData.x === null) {
                        lastData.x = x;
                    }
                    if (lastData.y === null) {
                        lastData.y = y;
                    }
                    if (lastData.z === null) {
                        lastData.z = z;
                    }
                    /*if (lastData.d === null) {
                        lastData.d = d;
                    }*/

                    x = lastData.x - x;
                    y = lastData.y - y;
                    z = lastData.z - z;

                    let d = Math.round(Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2)));
                    /*console.log(
                        x,y,z,
                        '->',
                        Math.pow(x,2), Math.pow(y,2), Math.pow(z,2),
                        '->', Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2),
                    );*/
                    let newD = d;
                    /*if (lastData.d === null) {
                        lastData.d = d;
                    }*/
                    //d = lastData.d - newD;

                    lastData.x = row.x;
                    lastData.y = row.y;
                    lastData.z = row.z;
                    lastData.d = d;


                    data.x.push(x);
                    data.y.push(y);
                    data.z.push(z);
                    data.d.push(d);
                    labels.push(row.t);
                }

                let datasets = [];
                if (this.show.x) {
                    datasets.push({
                        label: 'X',
                        backgroundColor: '#3498db',
                        borderColor: '#3498db',
                        data: data.x,
                        fill: false,
                    });
                }
                if (this.show.y) {
                    datasets.push({
                        label: 'Y',
                        backgroundColor: '#e74c3c',
                        borderColor: '#e74c3c',
                        data: data.y,
                        fill: false,
                    });
                }
                if (this.show.z) {
                    datasets.push({
                        label: 'Z',
                        backgroundColor: '#27ae60',
                        borderColor: '#27ae60',
                        data: data.z,
                        fill: false,
                    });
                }
                if (this.show.d) {
                    datasets.push({
                        label: 'Magitude',
                        backgroundColor: 'rgb(255, 189, 102)',
                        borderColor: 'rgb(255, 189, 102)',
                        data: data.d,
                        fill: false,
                    });
                }

                this.datacollection = {
                    labels: labels,
                    datasets: datasets
                }

            }
        }
    }
</script>

<style>
</style>