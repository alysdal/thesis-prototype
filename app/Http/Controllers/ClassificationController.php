<?php

namespace App\Http\Controllers;

use App\TrainingData;
use Illuminate\Http\Request;

class ClassificationController extends Controller {


    public function getData() {
        $data = [];

        $entries = TrainingData::distinct('device')->get(['device']);

        foreach ($entries as $entry) {
            $notInteresting = TrainingData::where('device', $entry->device)->where('ml_classification', 'not interesting')->count();
            $saw = TrainingData::where('device', $entry->device)->where('ml_classification', 'saw')->count();
            $drill = TrainingData::where('device', $entry->device)->where('ml_classification', 'drill')->count();
            $bigDrill = TrainingData::where('device', $entry->device)->where('ml_classification', 'big drill')->count();

            $entryData = [
                'not interesting' => $notInteresting,
                'saw' => $saw,
                'drill' => $drill,
                'big drill' => $bigDrill
            ];

            $data[$entry->device] = $entryData;
        }

        return json_encode($data);
    }
}