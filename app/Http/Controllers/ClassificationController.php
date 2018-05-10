<?php

namespace App\Http\Controllers;

use App\DeviceLocation;
use App\TrainingData;
use Illuminate\Http\Request;

class ClassificationController extends Controller
{


    public function getData()
    {
        $data = [];

        $entries = TrainingData::distinct('device')->get(['device']);

        foreach ($entries as $entry) {
            $notInteresting = TrainingData::where('device', $entry->device)->where('ml_classification', 'not interesting')->where('category', null)->count();
            $saw = TrainingData::where('device', $entry->device)->where('ml_classification', 'saw')->where('category', null)->count();
            $drill = TrainingData::where('device', $entry->device)->where('ml_classification', 'drill')->where('category', null)->count();
            $bigDrill = TrainingData::where('device', $entry->device)->where('ml_classification', 'big drill')->where('category', null)->count();
            $total = $saw + $drill + $bigDrill;

            $location = DeviceLocation::where('device', $entry->device)->orderBy('id', 'DESC')->first();

            $entryData = [
                'saw' => $saw,
                'drill' => $drill,
                'big drill' => $bigDrill,
            ];

            $obj = [
                "name" => $entry->device,
                "location" => $location,
                "entries" => $entryData,
                "total" => $total,
            ];

            $data[] = $obj;
        }

        return json_encode($data);
    }

}