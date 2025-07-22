<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard-admin', [AdminController::class, 'dashboardAdmin'])
            ->name('admin.dashboard');

        // manajemen kelas
        Route::get('/kelas', [KelasController::class, 'index'])->name('kelas.index');
        Route::post('/kelas', [KelasController::class, 'store'])->name('kelas.store');
        Route::put('/kelas/{id}', [KelasController::class, 'update'])->name('kelas.update');
        Route::delete('/kelas/{id}', [KelasController::class, 'destroy'])->name('kelas.destroy');

        // manajemen siswa
        Route::get('/siswa', [SiswaController::class, 'index'])->name('siswa.index');
        Route::post('/siswa', [SiswaController::class, 'store'])->name('siswa.store');
        Route::put('/siswa/{siswa}', [SiswaController::class, 'update'])->name('siswa.update');
        Route::delete('/siswa/{siswa}', [SiswaController::class, 'destroy'])->name('siswa.destroy');

        // import excell data siswa
        Route::get('/siswa/template', [SiswaController::class, 'downloadTemplate'])->name('siswa.template');
        Route::post('/siswa/import', [SiswaController::class, 'import'])->name('siswa.import');
        Route::post('/siswa/batch', [SiswaController::class, 'batchUpdate'])->name('siswa.batch');

        // Manajemen pembayaran
        Route::get('/pembayaran', [PembayaranController::class, 'index'])->name('pembayaran.index');
        Route::post('/pos-pembayaran', [PembayaranController::class, 'store'])->name('pos.store');
        Route::get('/pembayaran/{nis}', [PembayaranController::class, 'show'])->name('pembayaran.show');
        Route::post('/pembayaran/{nis}/bayar', [PembayaranController::class, 'bayar'])->name('pembayaran.bayar');
        Route::post('/tagihan-kelas', [PembayaranController::class, 'storeByKelas'])->name('tagihan.kelas');
        Route::post('/tagihan', [PembayaranController::class, 'storeBySiswa'])->name('tagihan.siswa');







    });

    Route::middleware(['staff'])->prefix('staff')->group(function () {
        Route::get('/dashboard-staff', [StaffController::class, 'dashboardStaff'])
        ->name('staff.dashboard');


    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';