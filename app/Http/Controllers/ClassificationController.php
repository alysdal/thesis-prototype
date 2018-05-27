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

        $entries = TrainingData::distinct('device')->whereNotIn('device', ['big-drill', 'saw', 'stibo-drill', 'train-smalldrill', 'train-hammerdrill', 'train-anglegrinder', 'train-saw'])->get(['device']);

        foreach ($entries as $entry) {
            $first50IDs = TrainingData::where('device', $entry->device)->where('ml_classification', '!=', 'not interesting')->take(50)->get(['id'])->pluck('id');

            $notInteresting = TrainingData::where('device', $entry->device)
                ->where('ml_classification', 'not interesting')->where('category', null)
                ->whereIn('id', $first50IDs)
                ->count();

            $saw = TrainingData::where('device', $entry->device)
                ->where('ml_classification', 'saw')->where('category', null)
                ->whereIn('id', $first50IDs)
                ->count();

            $drill = TrainingData::where('device', $entry->device)
                ->where('ml_classification', 'drill')->where('category', null)
                ->whereIn('id', $first50IDs)
                ->count();


            $bigDrill = TrainingData::where('device', $entry->device)
                ->where('ml_classification', 'big drill')->where('category', null)
                ->whereIn('id', $first50IDs)
                ->count();


            $angle = TrainingData::where('device', $entry->device)
                ->where('ml_classification', 'angle grinder')->where('category', null)
                ->whereIn('id', $first50IDs)
                ->count();


            $unclassifyable = TrainingData::where('device', $entry->device)
                ->where('ml_classification', 'unclassifyable')->where('category', null)
                ->whereIn('id', $first50IDs)
                ->count();

            $total = $saw + $drill + $bigDrill + $angle + $unclassifyable;

            $location = DeviceLocation::where('device', $entry->device)->orderBy('id', 'DESC')->first();

            $entryData = [
                'saw' => $saw,
                'drill' => $drill,
                'big drill' => $bigDrill,
                'angle grinder' => $angle,
                'unclassifyable' => $unclassifyable
            ];

            $obj = [
                "name" => $entry->device,
                "location" => $location,
                "entries" => $entryData,
                "unclassifyable" => $unclassifyable,
                "total" => $total,
            ];

            $data[] = $obj;
        }

        return json_encode($data);
    }

}