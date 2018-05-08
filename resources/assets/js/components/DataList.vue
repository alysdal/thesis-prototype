<template>
    <div style="height: 100%; overflow: hidden;">
        <button v-on:click="viewData(null, !viewLatestInGraph)" class="btn form-control" :class="{'btn-danger': viewLatestInGraph,'btn-default': !viewLatestInGraph}">
            Live <span>{{ viewLatestInGraph ? 'ON' : 'OFF' }}</span>
        </button>
        <div style="height: calc(100% - 30px); overflow: auto;">
            <table-component
                    :data="rows"
                    sort-by="id"
                    sort-order="desc"
                    table-class="table"
                    filter-input-class="form-control"
                    @rowClick="rowClicked"
            >
                <table-column show="id" label="#" data-type="numeric"></table-column>
                <table-column show="device" label="Device">
                    <template slot-scope="row">
                        <div :style="{'background-color': stringToColor(row.device), 'border-radius': '5px'}" class="text-center">
                            {{ row.device }}
                        </div>
                    </template>
                </table-column>
                <table-column show="created_at" label="Date" data-type="date:YYYY-MM-DD HH:mm:ss">
                    <template slot-scope="row">
                        <div :style="{'background-color': viewingId === row.id ?  '#2ecc71' : '', 'border-radius': '5px'}" class="text-center">
                            <small>{{ row.created_at.substring(5) }}</small>
                        </div>
                    </template>
                </table-column>
                <table-column show="ml_classification" label="ML">
                    <template slot-scope="row">
                        <div v-bind:title="row.ml_classification_all" :style="{'background-color': stringToColor(row.ml_classification), 'border-radius': '5px'}" class="text-center">
                            <small>{{ row.ml_classification }}</small>
                        </div>
                    </template>
                </table-column>
                <table-column show="category" label="Classified as">
                    <template slot-scope="row">
                        <div :style="{'border-radius': '4px', 'border': row.category ? '2px solid' : '','border-color': stringToColor(row.category)}" class="text-center">
                            <small>{{ row.category }}</small>
                        </div>
                    </template>
                </table-column>
                <table-column label="" :sortable="false" :filterable="false">
                    <template slot-scope="row">
                        <button @click="setCategory(row, t, row.category == t)"  v-for="t of categories" :value="t" class="btn btn-sm" :class="{'btn-primary': row.category == t}">{{ t }}</button>
                        <!--<button @click="setCategory(row, '', row.category == null)" value="" class="btn btn-sm" :class="{'btn-primary': row.category == null}">non</button>-->
                        <!--
                        <select @change="setCategory(row)" style="width: 100%;" v-model="row.category">
                            <option></option>
                            <option>{{ t }}</option>
                        </select>
                        -->
                    </template>
                </table-column>
                <table-column label="" :sortable="false" :filterable="false">
                    <template slot-scope="row">
                        <button class="btn btn-sm btn-outline-danger btn-block" @click="trashData(row)">X</button>
                        <!--<longpress
                                class="btn btn-sm btn-outline-danger btn-block"
                                :value="row"
                                duration="1"
                                :on-confirm="trashData"
                                pressing-text="{$rcounter}..."
                                action-text="Done">
                            Trash</longpress>-->
                    </template>
                </table-column>
            </table-component>
        </div>
    </div>
</template>

<script>
    import Longpress from 'vue-longpress';


    export default {
        components: {Longpress},

        data() {
            return {
                rows: [],
                latestId: 0,
                viewLatestInGraph: true,
                categories: ['not interesting', 'drill', 'saw', 'big drill'],
                viewingId: null,
                isUpdating: false,
            }
        },
        mounted() {
            this.updateData();
            setInterval(() => {
                this.updateData();
            }, 5000)
        },
        methods: {
            updateData() {
                if(!this.isUpdating) {
                    this.isUpdating = true;
                    this.fillData();
                }
            },
            fillData() {
                axios.get('api/trainingdata')
                    .catch(err => {
                        console.dir('ERROR', err);
                        this.isUpdating = false;
                    })
                    .then(response => {
                        this.rows = response.data.reverse();
                        let lastRowId =  this.rows[0].id
                        if (lastRowId !== this.latestId) {
                            this.latestId = lastRowId;
                            if (this.viewLatestInGraph) {
                                this.viewData(this.rows[0], true);
                                //console.log('visualizing latest', this.latestId);
                            }

                        }
                        this.isUpdating = false;
                    })
            },
            setCategory(row, value, unset) {
                console.log('setCategory', row);
                if (unset) {
                    value = '';
                }
                axios.put('api/trainingdata/' + row.id, {category:value}).then((res) => {
                    //console.log(res.data);
                    this.updateData();
                })
            },
            trashData(row) {
                console.log('trashData', row);
                axios.delete('api/trainingdata/' + row.id).then((res) => {
                    //console.log(res.data);
                    updateData();
                });
                this.viewData(null, true)
            },
            rowClicked(row) {
                //console.log(row);
                this.viewData(row.data, false);
            },
            viewData(rowData, live) {
                if (live) {
                    rowData = {id: 'latest'};
                    this.viewLatestInGraph = true;
                } else {
                    this.viewLatestInGraph = false;
                }

                if (rowData != null) {
                    this.viewingId = rowData.id
                    this.$emit('view-data', rowData)
                }
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
        }
    }
</script>

<style>
    .table-component__filter {
        align-self: flex-end;
    }

    .table-component__filter__field {
        padding: 0 1.25em 0 .75em;
        height: 2.5em;
        border: solid 2px #e0e0e0;
        font-size: inherit;
    }

    .table-component__filter__clear {
        position: absolute;
        top: 34px;
        right: 0px;
        bottom: 0;
        width: 2em;
        font-weight: bold;
        font-size: 26px;
        cursor: pointer;
    }

    .table-component__filter__field:focus {
        outline: 0;
        border-color: #007593;
    }
    .table-component__th--sort,
    .table-component__th--sort-asc,
    .table-component__th--sort-desc {
        text-decoration: underline;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .table-component__th--sort-asc:after,
    .table-component__th--sort-desc:after {
        position: absolute;
        left: .25em;
        display: inline-block;
        color: #bbb;
    }

    .table-component__th--sort-asc:after {
        content: '↑';
    }

    .table-component__th--sort-desc:after {
        content: '↓';
    }

    .table td {
        padding: 2px 2px 0 2px;
        font-size: 13px;
    }
    tr:hover {
        background: lightgray;
    }
    .btn {
        padding:1px 2px 1px 2px;
        margin-right:3px;
    }
    .btn-sm {
        border: 1px solid lightgray;
    }
</style>
