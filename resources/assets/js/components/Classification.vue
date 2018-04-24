<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 device" v-for="device in devices">
                <div class="card card-default">
                    <div class="card-header">
                        <h1>
                            {{device.name}}
                        </h1>
                    </div>
                    <div class="card-body">
                        <h2>Classified as:</h2>
                        <p>{{device.classification[0]}} with {{(device.classification[1] / device.total * 100).toFixed(2)}}%</p>
                        <ul>
                            <li v-for="entry in device.entries">
                                {{entry[0]}}: {{entry[1]}}
                            </li>
                            <li>
                                Total: {{device.total}}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        mounted() {
            this.getClassification();
        },
        methods : {
            getClassification() {
                axios.get('api/classifications').then(response => {
                    let classifications = response.data;

                    let sorted = classifications.map(classification => {

                        let sortable = [];
                        for (let entry in classification.entries) {
                            sortable.push([entry, classification.entries[entry]]);
                        }

                        sortable.sort((a, b) => {
                            return b[1] - a[1];
                        });

                        classification.entries = sortable;
                        classification.classification = sortable[0];

                        return classification;
                    });

                    this.devices = sorted;


                    console.log(sorted);
                })
            }
        },
        name: "Classification",
        data() {
            return {
                devices: []
            }
        }
    }
</script>

<style scoped>
    h1:first-letter, h2:first-letter, p:first-letter, li:first-letter {
        text-transform: capitalize;
    }

    .device {
        margin-bottom: 16px;
    }

</style>