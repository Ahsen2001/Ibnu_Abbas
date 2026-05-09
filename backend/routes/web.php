<?php

use App\Http\Controllers\SignedFileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/signed-file', SignedFileController::class)
    ->middleware('signed')
    ->name('signed-files.show');
