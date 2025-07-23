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

        // manajemen database
        Route::get('/database', [AdminController::class, 'databasePage'])->name('admin.database');
        Route::get('/backup/download/{filename}', function ($filename) {
    $path = storage_path('app/public/backups/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->download($path);
})->name('backup.download');
        Route::post('/backup-database', [AdminController::class, 'backupDatabase'])->name('admin.backup');
        Route::post('/restore-database', [AdminController::class, 'restoreDatabase'])->name('admin.restore');
        Route::post('/import-database', [AdminController::class, 'importDatabase'])->name('admin.import');
        Route::post('/reset-database', [AdminController::class, 'resetDatabase'])->name('admin.reset');



        // manajemen user
        Route::get('/user', [AdminController::class, 'userIndex'])->name('user.index');
        Route::post('/user', [AdminController::class, 'userStore'])->name('user.store');
        Route::put('/user/{id}', [AdminController::class, 'userUpdate'])->name('user.update');
        Route::delete('/user/{id}', [AdminController::class, 'userDestroy'])->name('user.destroy');

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

        // manajemen laporan
        Route::get('/laporan', [PembayaranController::class, 'laporanIndex'])->name('laporan.index');
        Route::get('/laporan/data', [PembayaranController::class, 'getLaporan'])->name('laporan.data');

        // generate kwitansi
        Route::get('/kwitansi/{id_transaksi}', [PembayaranController::class, 'generateKwitansi'])->name('kwitansi');




    });

    Route::middleware(['staff'])->prefix('staff')->group(function () {
        Route::get('/dashboard-staff', [StaffController::class, 'dashboardStaff'])
        ->name('staff.dashboard');

        // Manajemen pembayaran
        Route::get('/pembayaran', [StaffController::class, 'index'])->name('pembayaran.staff');
        Route::post('/pos-pembayaran', [StaffController::class, 'store'])->name('pos.store');
        Route::get('/pembayaran/{nis}', [StaffController::class, 'show'])->name('pembayaran.show');
        Route::post('/pembayaran/{nis}/bayar', [StaffController::class, 'bayar'])->name('pembayaran.bayar');
        Route::post('/tagihan-kelas', [StaffController::class, 'storeByKelas'])->name('tagihan.kelas');
        Route::post('/tagihan', [StaffController::class, 'storeBySiswa'])->name('tagihan.siswa');


    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';