<?php

namespace App\Http\Controllers;

use App\TrainingData;
use Illuminate\Http\Request;

class TrainingDataController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return TrainingData::get(['id', 'device', 'type', 'category', 'ml_classification', 'ml_classification_all', 'created_at', 'updated_at']);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\TrainingData  $trainingData
     * @return \Illuminate\Http\Response
     */
    public function show($trainingData)
    {
        if ($trainingData == 'latest') {
            $data = TrainingData::orderBy('id', 'DESC')->first();
        } else {
            $data = TrainingData::findOrFail($trainingData);
        }

        $data['data'] = json_decode($data['data']);
        return $data;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\TrainingData  $trainingData
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $trainingData)
    {
        $data = TrainingData::findOrFail($trainingData);
        $data->category = $request->category;
        $data->save();
        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\TrainingData  $trainingData
     * @return \Illuminate\Http\Response
     */
    public function destroy($trainingData)
    {
        $data = TrainingData::findOrFail($trainingData);
        $data->delete();
    }
}
