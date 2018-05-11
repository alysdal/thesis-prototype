<template>
        <l-map style="height: 100%" ref="map" :zoom.sync="map.zoom" :center="map.center" :bounds="map.bounds">
            <l-control-layers :position="map.layerCtrlPosition" />

            <l-tile-layer v-for="tileMap in map.baseMaps" :key="tileMap.name" layerType="base"
                          :name="tileMap.name" :visible="tileMap.visible"
                          :url="tileMap.url" :attribution="tileMap.attribution" />

            <l-tile-layer v-for="tileMap in map.overlayMaps" :key="tileMap.name" layerType="overlay"
                          :name="tileMap.name" :visible="tileMap.visible"
                          :url="tileMap.url" :attribution="tileMap.attribution" />

            <l-marker :lat-lng="test">
                <!--<l-tooltip :content="device.title" />-->
            </l-marker>

            <l-marker v-for="device in devices" v-bind:data="device" v-bind:key="device.title" :lat-lng="device.position" @click="onClickHardware(device)">
                <!--<l-tooltip :content="device.title" />-->
                <l-popup :content="device.classification + '<br>' + 'Last used: 3 hours ago' + '<br>' + 'On construction site since: November 2017'"></l-popup>
            </l-marker>



            <l-circle :lat-lng="circle.center" :radius="circle.radius"></l-circle>

        </l-map>
</template>

<script>
    // Map imports
    import { LMap, LTileLayer, LLayerGroup, LMarker, LPolyline, LCircle, LControlLayers, LTooltip, LPopup, LRectangle } from 'vue2-leaflet';

    export default {
        components: {
            // Map imports
            LMap,
            LTileLayer,
            LLayerGroup,
            LMarker,
            LPolyline,
            LControlLayers,
            LTooltip,
            LPopup,
            LRectangle,
            LCircle
        },
        mounted() {
            setInterval(this.getClassification, 20000);
            this.getClassification();
        },
        methods : {
            onClickHardware(device) {
                console.dir(device);
            },
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
                    console.log(sorted)

                    let markers = sorted.map((item) => {
                        return {
                            id: item.name,
                            title: item.name,
                            classification: item.classification[0],
                            position: L.latLng(item.location.lat, item.location.lon),
                            visible: true
                        };
                    });
                    this.devices = markers;

                })
            }
        },
        name: "Classification",
        computed: {
        },
        data() {
            return {
                devices: [],
                circle: {
                    center: L.latLng(56.161451, 10.135240),
                    radius: 1000
                },
                test: L.latLng(47.413220, -1.219482),
                map: {
                    zoom: 15,
                    center: L.latLng(56.161451, 10.135240),
                    //bounds: null,
                    url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                    //icons: {},
                    //layerCtrlPosition: 'bottomleft',
                    //markerExpander: null,
                    baseMaps: [
                        {
                            name: 'Color map',
                            visible: true,
                            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                        },
                        {
                            name: 'BW map',
                            visible: false,
                            url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                            attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                        }
                    ],
                    overlayMaps: [
                        {
                            name: 'Railways',
                            visible: false,
                            url: 'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
                            attribution: 'Railways: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                        }
                    ],
                },
                flags: {
                    flyToActiveHardwareMarker: true
                },
            }
        }
    }
</script>

<style scoped="">


</style>