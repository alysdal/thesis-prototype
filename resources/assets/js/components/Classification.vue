<template>
    <div class="row">
        <div class="col-md-4" v-for="device in devices">
            <div class="card card-default">
                <div class="card-header" :style="{'background-color': stringToColor(device.name)}">
                        {{device.name}}
                </div>
                <div class="card-body">
                    <p>Classified as:
                    <strong>{{device.classification[0]}}</strong> with {{(device.classification[1] / (device.total - device.unclassifyable) * 100).toFixed(2)}}% (excluding unclassifyable)</p>
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
            },
            stringToColor(str) {
                if (str == null) {
                    return "white";
                }
                var hash = 9;
                for (var i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }

                var shortened = hash % 360;
                return "hsl(" + shortened + ",100%,70%)";
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


</style>