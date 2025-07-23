<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Share flash message ke semua halaman Inertia
            Inertia::share([
                'flash' => function () {
                    return [
                        'success' => session('success'),
                        'error' => session('error'),
                    ];
                },
                'backupFile' => function () {
                    return session('backupFile');
                },
            ]);


        // Share error bag ke semua view (untuk blade)
        View::composer('*', function ($view) {
            $view->with('errors', session('errors') ?: new \Illuminate\Support\MessageBag);
        });
    }
}
