<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Machine learning trainer</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">
        <link href="/css/app.css" rel="stylesheet" type="text/css">
        <meta name="csrf-token" content="{{ csrf_token() }}">
    </head>
    <body>
    <div id="app" class="row" style="height: 98vh; width: 100%; overflow: auto;">
        <div class="col-sm-4">
            <data-list v-on:view-data="viewData"></data-list>
        </div>
        <div class="col-sm-8">

            <random-chart :rowdata="chartData"></random-chart>

        </div>
    </div>
    <script src="/js/manifest.js"></script>
    <script src="/js/vendor.js"></script>
    <script src="/js/app.js"></script>
    </body>
</html>
