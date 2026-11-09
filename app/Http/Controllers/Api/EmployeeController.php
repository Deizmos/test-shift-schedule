<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        return EmployeeResource::collection(
            Employee::query()->orderBy('id')->get(),
        );
    }
}
