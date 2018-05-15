<template>
        <l-map style="height: 100%" ref="map" :zoom.sync="map.zoom" :center="map.center" :bounds="map.bounds">
            <l-control-layers :position="map.layerCtrlPosition" />

            <l-tile-layer v-for="tileMap in map.baseMaps" :key="tileMap.name" layerType="base"
                          :name="tileMap.name" :visible="tileMap.visible"
                          :url="tileMap.url" :attribution="tileMap.attribution" />

            <l-tile-layer v-for="tileMap in map.overlayMaps" :key="tileMap.name" layerType="overlay"
                          :name="tileMap.name" :visible="tileMap.visible"
                          :url="tileMap.url" :attribution="tileMap.attribution" />

            <v-marker-cluster>
                <l-marker v-for="d in fakePins" v-bind:data="d" v-bind:key="d.id"  :lat-lng="d.coords" :icon="d.classification !== 'unknown' ? icon1 : icon2">
                    <!--<l-tooltip :content="device.title" />-->
                    <l-popup :content='"<h3>"+ d.classification + "</h3><img src=\"/images/" + d.classification + ".png\" align=\"right\" width=\"50\">Usage level: Medium<br> Last used: 1 hours ago<br>On construction site since: November 2017"'></l-popup>
                </l-marker>
            </v-marker-cluster>

            <v-marker-cluster>
                <l-marker v-for="device in devices" v-bind:data="device" v-bind:key="device.title" :lat-lng="device.position" :icon="d.classification !== 'unknown' ? icon1 : icon2">
                    <!--<l-tooltip :content="device.title" />-->
                    <l-popup :content="'<h3>'+ device.classification + '</h3><img src=\'/images/' + device.classification + '.png\' align=\'right\' width=\'50\'>Usage level: High<br>' + 'Last used: 3 hours ago' + '<br>' + 'On construction site since: November 2017'"></l-popup>
                </l-marker>
            </v-marker-cluster>



            <l-circle v-for="circle in geofences" v-bind:data="circle" v-bind:key="circle.id" :lat-lng="circle.center" :radius="circle.radius"></l-circle>

        </l-map>
</template>

<script>
    // Map imports
    import { LMap, LTileLayer, LLayerGroup, LMarker, LPolyline, LCircle, LControlLayers, LTooltip, LPopup, LRectangle } from 'vue2-leaflet';
    import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster';

    let copyPins = "";

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
            LCircle,
            'v-marker-cluster': Vue2LeafletMarkerCluster
        },
        mounted() {
            //setInterval(this.getClassification, 20000);
            this.getClassification();
            this.$refs.map.mapObject.on('click', (event) => {
                console.dir(event.latlng);

                function copyStringToClipboard (string) {
                    function handler (event){
                        event.clipboardData.setData('text/plain', string);
                        event.preventDefault();
                        document.removeEventListener('copy', handler, true);
                    }

                    document.addEventListener('copy', handler, true);
                    document.execCommand('copy');
                }

                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                let types = ['unknown', 'drill', 'drill',  'big drill', 'jackhammer',  'saw', 'saw',  'anglegrinder', 'anglegrinder', ]
                var type = types[Math.floor(Math.random()*types.length)];

                copyPins += `{id: ${getRandomInt(100,99999)}, title: 'bab', coords: [${event.latlng.lat} , ${event.latlng.lng}], classification: '${type}'},`;

                copyStringToClipboard(copyPins);
            });
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
                copyPins: "",
                icon1: L.AwesomeMarkers.icon({icon: '', markerColor: 'green'}),
                icon2: L.AwesomeMarkers.icon({icon: 'question-circle', markerColor: 'yellow'}),
                fakePins: [
                    // aarhus
                    {id: 13, title: 'bab', coords: [56.16161884308856 , 10.134868458844723], classification: 'drill'},
                    {id: 14, title: 'bab', coords: [56.161612868712695 , 10.134610966779293], classification: 'drill'},
                    {id: 31, title: 'bab', coords: [56.161612868712695 , 10.134610966779293], classification: 'anglegrinder'},
                    {id: 15, title: 'bab', coords: [56.161571048055556 , 10.134428576566279], classification: 'saw'},
                    {id: 16, title: 'bab', coords: [56.16146350901381 , 10.134364203549923], classification: 'jackhammer'},
                    {id: 17, title: 'bab', coords: [56.16135596967101 , 10.134525136090817], classification: 'saw'},
                    {id: 18, title: 'bab', coords: [56.16118271120766 , 10.134900645352902], classification: 'big drill'},
                    {id: 19, title: 'bab', coords: [56.1609258092891 , 10.135254696942868], classification: 'anglegrinder'},
                    {id: 20, title: 'bab', coords: [56.16123260711143 , 10.135810375213625], classification: 'unknown'},
                    {id: 21, title: 'bab', coords: [56.161340146799596 , 10.134512186050417], classification: 'saw'},
                    {id: 22, title: 'bab', coords: [56.161304300270324 , 10.13466238975525], classification: 'drill'},
                    {id: 30, title: 'bab', coords: [56.161304300270324 , 10.13466238975525], classification: 'drill'},
                    {id: 23, title: 'bab', coords: [56.16138196770812 , 10.13466238975525], classification: 'saw'},
                    {id: 24, title: 'bab', coords: [56.1613491084267 , 10.134539008140566], classification: 'drill'},
                    {id: 25, title: 'bab', coords: [56.161340146799596 , 10.134512186050417], classification: 'anglegrinder'},
                    {id: 26, title: 'bab', coords: [56.16166873842579 , 10.134753584861757], classification: 'saw'},
                    {id: 11104, title: 'bab', coords: [56.16201466675748 , 10.136110845487567], classification: 'anglegrinder'},{id: 73419, title: 'bab', coords: [56.16191609045254 , 10.135338369291278], classification: 'unknown'},{id: 91201, title: 'bab', coords: [56.16188621879503 , 10.136169854085894], classification: 'jackhammer'},{id: 13640, title: 'bab', coords: [56.16165023188404 , 10.1362610491924], classification: 'big drill'},{id: 27625, title: 'bab', coords: [56.16170997554287 , 10.13576752273366], classification: 'big drill'},{id: 4690, title: 'bab', coords: [56.1612618958367 , 10.136014285963029], classification: 'anglegrinder'},{id: 70069, title: 'bab', coords: [56.16099304550409 , 10.134893122594805], classification: 'jackhammer'},{id: 60148, title: 'bab', coords: [56.16087355586339 , 10.13426548568532], classification: 'jackhammer'},{id: 88798, title: 'bab', coords: [56.16116331759989 , 10.134158197324725], classification: 'drill'},{id: 93703, title: 'bab', coords: [56.161617372832076 , 10.134142104070635], classification: 'big drill'},

                    // randers
                    {id: 89766, title: 'bab', coords: [56.45995343034975 , 10.03479838371277], classification: 'big drill'},{id: 47566, title: 'bab', coords: [56.459983069804075 , 10.034648180007936], classification: 'big drill'},{id: 15170, title: 'bab', coords: [56.4599060071747 , 10.034648180007936], classification: 'big drill'},{id: 95329, title: 'bab', coords: [56.45984080021237 , 10.034648180007936], classification: 'unknown'},{id: 97997, title: 'bab', coords: [56.4597340976689 , 10.0350558757782], classification: 'anglegrinder'},{id: 87326, title: 'bab', coords: [56.4597340976689 , 10.035152435302736], classification: 'big drill'},{id: 19137, title: 'bab', coords: [56.45987636766026 , 10.035238265991213], classification: 'jackhammer'},{id: 14825, title: 'bab', coords: [56.45994750245611 , 10.035281181335451], classification: 'drill'},{id: 39299, title: 'bab', coords: [56.459983069804075 , 10.035098791122438], classification: 'anglegrinder'},{id: 21002, title: 'bab', coords: [56.4619036571333 , 10.03632187843323], classification: 'drill'},{id: 97480, title: 'bab', coords: [56.46189180195388 , 10.036225318908693], classification: 'big drill'},{id: 48849, title: 'bab', coords: [56.46185623639339 , 10.036225318908693], classification: 'unknown'},{id: 4410, title: 'bab', coords: [56.46185623639339 , 10.036514997482302], classification: 'anglegrinder'},{id: 74158, title: 'bab', coords: [56.46193329506569 , 10.036686658859255], classification: 'anglegrinder'},{id: 96367, title: 'bab', coords: [56.46193329506569 , 10.036772489547731], classification: 'saw'},{id: 7380, title: 'bab', coords: [56.46191551230903 , 10.036450624465944], classification: 'drill'},{id: 91228, title: 'bab', coords: [56.46164284233093 , 10.032137632369997], classification: 'saw'},{id: 28617, title: 'bab', coords: [56.46164284233093 , 10.032341480255129], classification: 'unknown'},{id: 32836, title: 'bab', coords: [56.46164284233093 , 10.032094717025759], classification: 'anglegrinder'},{id: 31674, title: 'bab', coords: [56.461512434258076 , 10.032094717025759], classification: 'anglegrinder'},{id: 38534, title: 'bab', coords: [56.46157171071034 , 10.032341480255129], classification: 'unknown'},{id: 43510, title: 'bab', coords: [56.46160134890178 , 10.032148361206056], classification: 'big drill'},


                    {id: 2, title: 'bab1', coords: [55.3690512248352 , 10.36598850041628], classification: 'saw'},
                    {id: 3, title: 'bab2', coords: [55.36800251458027 , 10.366803891956808], classification: 'saw'},
                    {id: 4, title: 'bab', coords: [55.36853940092308 , 10.365815162658693], classification: 'unknown'},
                    {id: 5, title: 'bab', coords: [55.368978393339525 , 10.365986824035646], classification: 'saw'},
                    {id: 6, title: 'bab', coords: [55.36771017973805 , 10.365965366363527], classification: 'drill'},
                    {id: 7, title: 'bab', coords: [55.36880767464517 , 10.36637842655182], classification: 'anglegrinder'},
                    {id: 8, title: 'bab', coords: [55.36842660347412 , 10.366340875625612], classification: 'saw'},
                    {id: 9, title: 'bab', coords: [55.36813088971666 , 10.365589857101442], classification: 'drill'},
                    {id: 10, title: 'bab', coords: [55.36849062368731 , 10.365321636199953], classification: 'big drill'},
                    {id: 12, title: 'bab', coords: [55.36849062368731 , 10.365321636199953], classification: 'jackhammer'},
                    {id: 11, title: 'bab', coords: [55.368893034084394 , 10.36514461040497], classification: 'drill'},

                    // fyn
                    {id: 99553, title: 'bab', coords: [55.36886864569198 , 10.393967628479004], classification: 'anglegrinder'},{id: 32914, title: 'bab', coords: [55.36878328620011 , 10.393431186676027], classification: 'anglegrinder'},{id: 5891, title: 'bab', coords: [55.36850281800189 , 10.393431186676027], classification: 'anglegrinder'},{id: 29941, title: 'bab', coords: [55.36860037238326 , 10.39360284805298], classification: 'anglegrinder'},{id: 48793, title: 'bab', coords: [55.36875889774005 , 10.39405345916748], classification: 'jackhammer'},{id: 92312, title: 'bab', coords: [55.36851501231271 , 10.393753051757814], classification: 'saw'},{id: 1216, title: 'bab', coords: [55.36868573226967 , 10.393452644348146], classification: 'jackhammer'},{id: 4758, title: 'bab', coords: [55.3648773208763 , 10.394916962832212], classification: 'drill'},{id: 54888, title: 'bab', coords: [55.36488951630431 , 10.394702386111021], classification: 'saw'},{id: 30174, title: 'bab', coords: [55.36491390714908 , 10.39502425119281], classification: 'unknown'},{id: 9625, title: 'bab', coords: [55.364633411526974 , 10.39502425119281], classification: 'unknown'},{id: 9687, title: 'bab', coords: [55.364633411526974 , 10.394916962832212], classification: 'big drill'},{id: 87302, title: 'bab', coords: [55.357392668575685 , 10.388847375288607], classification: 'unknown'},{id: 89244, title: 'bab', coords: [55.35766101786045 , 10.38871862925589], classification: 'saw'},{id: 49216, title: 'bab', coords: [55.35777079658903 , 10.388740086928012], classification: 'saw'},{id: 26520, title: 'bab', coords: [55.35746585492464 , 10.388933205977084], classification: 'anglegrinder'},

                    // kbh
                    {id: 93530, title: 'bab', coords: [55.64533325135243 , 12.459743656218054], classification: 'drill'},{id: 89021, title: 'bab', coords: [55.64533325135243 , 12.459883131086828], classification: 'saw'},{id: 10285, title: 'bab', coords: [55.64537260514218 , 12.460419572889807], classification: 'saw'},{id: 5616, title: 'bab', coords: [55.64553001990562 , 12.460312284529211], classification: 'unknown'},{id: 20745, title: 'bab', coords: [55.645511856695975 , 12.460027970373632], classification: 'saw'},{id: 40822, title: 'bab', coords: [55.64549672068151 , 12.459722198545935], classification: 'saw'},{id: 85053, title: 'bab', coords: [55.645620835827515 , 12.459722198545935], classification: 'drill'},{id: 31971, title: 'bab', coords: [55.64567532527955 , 12.460001148283483], classification: 'anglegrinder'},{id: 29049, title: 'bab', coords: [55.64574192339576 , 12.460178174078466], classification: 'anglegrinder'},{id: 48343, title: 'bab', coords: [55.645881173636425 , 12.460178174078466], classification: 'saw'},{id: 20759, title: 'bab', coords: [55.645881173636425 , 12.460001148283483], classification: 'unknown'},{id: 24787, title: 'bab', coords: [55.645778249593235 , 12.460027970373632], classification: 'anglegrinder'},{id: 85725, title: 'bab', coords: [55.64585090188712 , 12.460060156881811], classification: 'jackhammer'},{id: 65737, title: 'bab', coords: [55.64585090188712 , 12.46008697897196], classification: 'drill'},

                    // kbh 3
                    {id: 45435, title: 'bab', coords: [55.73707775650128 , 12.522665262222292], classification: 'unknown'},{id: 87123, title: 'bab', coords: [55.737083796742596 , 12.522836923599245], classification: 'jackhammer'},{id: 45468, title: 'bab', coords: [55.73709587722241 , 12.52320170402527], classification: 'drill'},{id: 99298, title: 'bab', coords: [55.73709587722241 , 12.523276805877687], classification: 'unknown'},{id: 93248, title: 'bab', coords: [55.73709587722241 , 12.523491382598879], classification: 'unknown'},{id: 27611, title: 'bab', coords: [55.73709587722241 , 12.52318024635315], classification: 'drill'},{id: 89518, title: 'bab', coords: [55.73709587722241 , 12.523008584976198], classification: 'drill'},{id: 69595, title: 'bab', coords: [55.73709587722241 , 12.52270817756653], classification: 'saw'},{id: 60915, title: 'bab', coords: [55.73697507225599 , 12.52270817756653], classification: 'saw'},{id: 58114, title: 'bab', coords: [55.73684822663882 , 12.52270817756653], classification: 'drill'},{id: 38067, title: 'bab', coords: [55.73669721941422 , 12.52270817756653], classification: 'big drill'},{id: 31751, title: 'bab', coords: [55.73690862936506 , 12.52270817756653], classification: 'drill'},{id: 33294, title: 'bab', coords: [55.737053595526696 , 12.52270817756653], classification: 'drill'},{id: 72484, title: 'bab', coords: [55.737005273532645 , 12.522751092910768], classification: 'jackhammer'},{id: 71305, title: 'bab', coords: [55.73687842801362 , 12.52272963523865], classification: 'saw'},

                    // kbh 2
                    {id: 64015, title: 'bab', coords: [55.659292732906685 , 12.493771102745088], classification: 'saw'},{id: 27398, title: 'bab', coords: [55.65940167368829 , 12.49421098502353], classification: 'unknown'},{id: 22396, title: 'bab', coords: [55.65941377820086 , 12.494489934761079], classification: 'drill'},{id: 58440, title: 'bab', coords: [55.65930181131674 , 12.494538214523347], classification: 'drill'},{id: 11968, title: 'bab', coords: [55.65922918397741 , 12.494516756851228], classification: 'drill'},{id: 43115, title: 'bab', coords: [55.659102085809316 , 12.494430926162751], classification: 'drill'},{id: 31600, title: 'bab', coords: [55.65908392889447 , 12.494151976425202], classification: 'anglegrinder'},{id: 85373, title: 'bab', coords: [55.65915050420773 , 12.494119789917024], classification: 'anglegrinder'},{id: 6127, title: 'bab', coords: [55.65936233399658 , 12.494146612007173], classification: 'anglegrinder'},{id: 21140, title: 'bab', coords: [55.6593260203999 , 12.494302180130036], classification: 'unknown'},{id: 19147, title: 'bab', coords: [55.6592806283567 , 12.4939534929581], classification: 'saw'},{id: 30650, title: 'bab', coords: [55.659135373464636 , 12.4939534929581], classification: 'anglegrinder'},{id: 70498, title: 'bab', coords: [55.6590445888834 , 12.494087603408847], classification: 'anglegrinder'},

                // kbh 4
                    {id: 34676, title: 'bab', coords: [55.7370868168629 , 12.522987127304079], classification: 'jackhammer'},{id: 82470, title: 'bab', coords: [55.73677574324392 , 12.523378729820253], classification: 'anglegrinder'},{id: 44614, title: 'bab', coords: [56.162054083206336 , 10.135354399681093], classification: 'big drill'},{id: 14062, title: 'bab', coords: [56.16158808437786 , 10.13517200946808], classification: 'saw'},{id: 73943, title: 'bab', coords: [55.684561209919956 , 12.582685975357892], classification: 'jackhammer'},{id: 56072, title: 'bab', coords: [55.68448862945343 , 12.582578686997294], classification: 'jackhammer'},{id: 3106, title: 'bab', coords: [55.68463379025178 , 12.58272889070213], classification: 'drill'},{id: 45083, title: 'bab', coords: [55.68460959682282 , 12.58317950181663], classification: 'unknown'},{id: 99759, title: 'bab', coords: [55.68445233916966 , 12.583093671128154], classification: 'big drill'},{id: 72962, title: 'bab', coords: [55.684476532695925 , 12.582750348374248], classification: 'drill'},{id: 79401, title: 'bab', coords: [55.68460959682282 , 12.582750348374248], classification: 'unknown'},{id: 54433, title: 'bab', coords: [55.68460959682282 , 12.583029298111798], classification: 'big drill'},{id: 61547, title: 'bab', coords: [55.68452491970354 , 12.583029298111798], classification: 'saw'},{id: 38925, title: 'bab', coords: [55.68452491970354 , 12.58270743303001], classification: 'anglegrinder'},{id: 61362, title: 'bab', coords: [55.68433137131383 , 12.582685975357892], classification: 'saw'},{id: 20027, title: 'bab', coords: [55.681585300332834 , 12.579617528244855], classification: 'saw'},{id: 78952, title: 'bab', coords: [55.681585300332834 , 12.579617528244855], classification: 'drill'},{id: 82888, title: 'bab', coords: [55.681562924392736 , 12.579621090553703], classification: 'drill'},{id: 9257, title: 'bab', coords: [55.681659705557934 , 12.579524531029167], classification: 'saw'},
                    {id: 89454, title: 'bab', coords: [55.71299392600409 , 12.426996231079102], classification: 'anglegrinder'},{id: 54548, title: 'bab', coords: [55.71299392600409 , 12.427275180816652], classification: 'drill'},{id: 51993, title: 'bab', coords: [55.71299392600409 , 12.427661418914797], classification: 'drill'},{id: 33016, title: 'bab', coords: [55.71292139831584 , 12.427790164947512], classification: 'saw'},{id: 3568, title: 'bab', coords: [55.71292139831584 , 12.42706060409546], classification: 'big drill'},{id: 14428, title: 'bab', coords: [55.71289722238983 , 12.427618503570558], classification: 'drill'},{id: 60731, title: 'bab', coords: [55.71289722238983 , 12.427167892456055], classification: 'anglegrinder'},{id: 69886, title: 'bab', coords: [55.71282469452202 , 12.427232265472414], classification: 'saw'},
                    {id: 9867, title: 'bab', coords: [55.70714292647206 , 12.597820758819582], classification: 'saw'},{id: 13627, title: 'bab', coords: [55.70716106108868 , 12.598035335540771], classification: 'drill'},{id: 5103, title: 'bab', coords: [55.70716106108868 , 12.598432302474977], classification: 'big drill'},{id: 32759, title: 'bab', coords: [55.70716106108868 , 12.598571777343752], classification: 'drill'},{id: 59809, title: 'bab', coords: [55.70698575944214 , 12.598571777343752], classification: 'unknown'},{id: 38559, title: 'bab', coords: [55.70682859178003 , 12.59787440299988], classification: 'anglegrinder'},{id: 9990, title: 'bab', coords: [55.706994826787955 , 12.597826123237612], classification: 'unknown'},{id: 18183, title: 'bab', coords: [55.7070341185956 , 12.597799301147463], classification: 'saw'},{id: 91472, title: 'bab', coords: [55.707091545012595 , 12.598115801811218], classification: 'drill'},{id: 42351, title: 'bab', coords: [55.707091545012595 , 12.59812653064728], classification: 'saw'},{id: 29295, title: 'bab', coords: [55.70745682340801 , 12.598612014770502], classification: 'anglegrinder'},{id: 6662, title: 'bab', coords: [55.70716710595902 , 12.598121166229248], classification: 'saw'},{id: 70950, title: 'bab', coords: [55.70698575944214 , 12.597965598106386], classification: 'big drill'},{id: 78079, title: 'bab', coords: [55.706946467585894 , 12.597836852073671], classification: 'drill'},


                    // odense
                    {id: 16729, title: 'bab', coords: [55.39516888745864 , 10.376812219619753], classification: 'anglegrinder'},{id: 75027, title: 'bab', coords: [55.39505311939479 , 10.376565456390383], classification: 'saw'},{id: 23182, title: 'bab', coords: [55.39499218869868 , 10.376189947128298], classification: 'anglegrinder'},{id: 25188, title: 'bab', coords: [55.394778930522826 , 10.376179218292238], classification: 'unknown'},{id: 14732, title: 'bab', coords: [55.39454129862887 , 10.376029014587404], classification: 'anglegrinder'},{id: 43363, title: 'bab', coords: [55.39454129862887 , 10.376297235488893], classification: 'saw'},{id: 81884, title: 'bab', coords: [55.39475455808662 , 10.37661910057068], classification: 'saw'},{id: 11474, title: 'bab', coords: [55.39480330294401 , 10.37688732147217], classification: 'drill'},{id: 24248, title: 'bab', coords: [55.39500437484542 , 10.377058982849123], classification: 'anglegrinder'},{id: 72287, title: 'bab', coords: [55.39502265405847 , 10.376715660095217], classification: 'anglegrinder'},{id: 49110, title: 'bab', coords: [55.39474846497522 , 10.3760826587677], classification: 'big drill'},{id: 68690, title: 'bab', coords: [55.39581350754233 , 10.366639480926098], classification: 'saw'},{id: 91609, title: 'bab', coords: [55.395862251094016 , 10.366725311614575], classification: 'anglegrinder'},{id: 55609, title: 'bab', coords: [55.395673369496414 , 10.366821871139111], classification: 'big drill'},{id: 13447, title: 'bab', coords: [55.39556978888234 , 10.366821871139111], classification: 'anglegrinder'},{id: 13538, title: 'bab', coords: [55.39551495197677 , 10.36710082087666], classification: 'drill'},{id: 99383, title: 'bab', coords: [55.395466207996876 , 10.36710082087666], classification: 'anglegrinder'},{id: 8149, title: 'bab', coords: [55.3956429046381 , 10.366757498122753], classification: 'unknown'},{id: 90212, title: 'bab', coords: [55.39538090588738 , 10.367261753417553], classification: 'saw'},{id: 57037, title: 'bab', coords: [55.39536871985672 , 10.367261753417553], classification: 'drill'},{id: 94387, title: 'bab', coords: [55.39388808917626 , 10.36757288966328], classification: 'anglegrinder'},{id: 61060, title: 'bab', coords: [55.39393683510199 , 10.36757288966328], classification: 'anglegrinder'},{id: 38086, title: 'bab', coords: [55.39381497017496 , 10.367208109237255], classification: 'saw'},{id: 18503, title: 'bab', coords: [55.39365654520821 , 10.367272482253613], classification: 'anglegrinder'},{id: 47531, title: 'bab', coords: [55.393595612359654 , 10.366939888335766], classification: 'saw'},{id: 16795, title: 'bab', coords: [55.3938819959313 , 10.366714582778515], classification: 'jackhammer'},{id: 76969, title: 'bab', coords: [55.39411963178822 , 10.366907701827587], classification: 'big drill'},{id: 34713, title: 'bab', coords: [55.39412572499654 , 10.367197380401196], classification: 'saw'},{id: 35633, title: 'bab', coords: [55.393717477962845 , 10.367197380401196], classification: 'jackhammer'},{id: 46703, title: 'bab', coords: [55.39376013083522 , 10.366939888335766], classification: 'saw'},
                    {id: 28624, title: 'bab', coords: [55.3091581704561 , 10.796493231318893], classification: 'drill'},{id: 96435, title: 'bab', coords: [55.30898719377976 , 10.796621977351608], classification: 'anglegrinder'},{id: 35650, title: 'bab', coords: [55.308706301925646 , 10.796847282908859], classification: 'anglegrinder'},{id: 89693, title: 'bab', coords: [55.30864523821584 , 10.796847282908859], classification: 'saw'},{id: 75814, title: 'bab', coords: [55.30747890331157 , 10.798209845088424], classification: 'anglegrinder'},{id: 24664, title: 'bab', coords: [55.30753386227077 , 10.798209845088424], classification: 'jackhammer'},{id: 28572, title: 'bab', coords: [55.30752775572354 , 10.797973810695114], classification: 'big drill'},{id: 50958, title: 'bab', coords: [55.3072651733018 , 10.797973810695114], classification: 'anglegrinder'},{id: 3147, title: 'bab', coords: [55.30724074694164 , 10.798038183711471], classification: 'saw'},{id: 29559, title: 'bab', coords: [55.30724074694164 , 10.798242031596603], classification: 'anglegrinder'},{id: 80126, title: 'bab', coords: [55.307283493062044 , 10.798413692973556], classification: 'saw'},{id: 9267, title: 'bab', coords: [55.30986649454862 , 10.798660456202926], classification: 'saw'},{id: 77241, title: 'bab', coords: [55.309994724281935 , 10.798660456202926], classification: 'anglegrinder'},{id: 73271, title: 'bab', coords: [55.309884813107345 , 10.798445879481735], classification: 'unknown'},{id: 35537, title: 'bab', coords: [55.30967720227981 , 10.798456608317794], classification: 'drill'},{id: 92982, title: 'bab', coords: [55.30967720227981 , 10.798842846415939], classification: 'big drill'},{id: 57236, title: 'bab', coords: [55.309787114029774 , 10.798864304088058], classification: 'big drill'},


                    {id: 11944, title: 'bab', coords: [55.50542954089368 , 9.739626981317999], classification: 'anglegrinder'},{id: 9626, title: 'bab', coords: [55.50576979776092 , 9.739626981317999], classification: 'anglegrinder'},{id: 64912, title: 'bab', coords: [55.50601283657994 , 9.739712812006475], classification: 'saw'},{id: 14038, title: 'bab', coords: [55.50611005168744 , 9.740227796137335], classification: 'big drill'},{id: 74383, title: 'bab', coords: [55.50611005168744 , 9.741772748529911], classification: 'drill'},{id: 26402, title: 'bab', coords: [55.50640169556968 , 9.739970304071905], classification: 'anglegrinder'},{id: 30330, title: 'bab', coords: [55.50528371562181 , 9.739369489252569], classification: 'saw'},{id: 34868, title: 'bab', coords: [55.56504661428865 , 9.756838779430838], classification: 'drill'},{id: 39573, title: 'bab', coords: [55.56504661428865 , 9.75705335615203], classification: 'unknown'},{id: 15973, title: 'bab', coords: [55.56507694846555 , 9.75704262731597], classification: 'anglegrinder'},{id: 36747, title: 'bab', coords: [55.56508604871402 , 9.756854872684928], classification: 'unknown'},{id: 88992, title: 'bab', coords: [55.56508604871402 , 9.756854872684928], classification: 'saw'},{id: 31981, title: 'bab', coords: [55.563950302456476 , 9.75563943386078], classification: 'jackhammer'},{id: 95357, title: 'bab', coords: [55.563950302456476 , 9.755854010581972], classification: 'jackhammer'},{id: 62919, title: 'bab', coords: [55.563950302456476 , 9.756031036376955], classification: 'anglegrinder'},{id: 46629, title: 'bab', coords: [55.563950302456476 , 9.756031036376955], classification: 'big drill'},{id: 56342, title: 'bab', coords: [55.56345360073115 , 9.755596690177907], classification: 'drill'},{id: 69082, title: 'bab', coords: [55.563977603978635 , 9.755752086639406], classification: 'anglegrinder'},{id: 92830, title: 'bab', coords: [55.563977603978635 , 9.756004214286804], classification: 'anglegrinder'},{id: 6138, title: 'bab', coords: [55.565733962029654 , 9.755821824073793], classification: 'big drill'},{id: 93348, title: 'bab', coords: [55.565733962029654 , 9.755735993385317], classification: 'jackhammer'},

                    // kørende
                    {id: 42436, title: 'bab', coords: [56.029087419764366 , 9.904174804687502], classification: 'anglegrinder'},{id: 66191, title: 'bab', coords: [56.032156723751555 , 9.898681640625002], classification: 'jackhammer'},{id: 29884, title: 'bab', coords: [55.71473455012692 , 9.558105468750002], classification: 'saw'},{id: 43131, title: 'bab', coords: [55.71473455012692 , 9.558105468750002], classification: 'drill'},{id: 93325, title: 'bab', coords: [55.44459522072959 , 9.975585937500002], classification: 'unknown'},{id: 63075, title: 'bab', coords: [55.44459522072959 , 9.975585937500002], classification: 'anglegrinder'},{id: 40930, title: 'bab', coords: [55.44459522072959 , 11.733398437500002], classification: 'big drill'},{id: 78852, title: 'bab', coords: [55.44459522072959 , 11.733398437500002], classification: 'anglegrinder'},{id: 56321, title: 'bab', coords: [55.66054546266749 , 12.373352050781252], classification: 'saw'},{id: 56236, title: 'bab', coords: [55.66054546266749 , 12.373352050781252], classification: 'drill'},






                ],
                devices: [],
                geofences: [{id: 1, center: L.latLng(56.161451, 10.135240),radius: 1000}],
                test: L.latLng(47.413220, -1.219482),
                map: {
                    zoom: 8,
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

<style>
    @import "~leaflet.markercluster/dist/MarkerCluster.css";
    @import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
    @import "~leaflet.awesome-markers/dist/leaflet.awesome-markers.css";

    h3 {
        text-transform: capitalize;
    }

</style>