<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function dashboardAdmin()
    {
        $user = Auth::user();

        return Inertia::render('dashboard/admin');

    }

    public function userIndex()
{
    $users = User::whereIn('role', ['admin', 'staff'])->get();
    return inertia('user/index', [
        'users' => $users,
    ]);
}

public function userStore(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'username' => 'required|string|unique:users,username',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:6',
        'role' => 'required|in:admin,staff',
    ]);

    $validated['password'] = Hash::make($validated['password']);

    User::create($validated);

    return back()->with('success', 'User berhasil ditambahkan.');
}

public function userUpdate(Request $request, $id)
{
    $user = User::findOrFail($id);

    $validated = $request->validate([
        'name' => 'required|string',
        'username' => 'required|string|unique:users,username,' . $user->id,
        'email' => 'required|email|unique:users,email,' . $user->id,
        'role' => 'required|in:admin,staff',
        'password' => 'nullable|string|min:6',
    ]);

    if ($request->filled('password')) {
        $validated['password'] = Hash::make($request->password);
    } else {
        unset($validated['password']);
    }

    $user->update($validated);

    return back()->with('success', 'User berhasil diperbarui.');
}

public function userDestroy($id)
{
    $user = User::findOrFail($id);
    $user->delete();

    return back()->with('success', 'User berhasil dihapus.');
}

/**
 * Display the database management page.
 */
public function databasePage()
{
    return Inertia::render('database/index');
}

/**
 * Backup the database.
 */
public function backupDatabase()
{
    Artisan::call('backup:run', ['--only-db' => true]);

    // Path asli backup hasil Spatie
    $backupPath = storage_path('app/public/laravel');

    // Cari file zip terbaru
    $files = collect(glob($backupPath . '/*.zip'))->sortByDesc(function ($file) {
    return filemtime($file);
});

if ($files->isEmpty()) {
    return back()->withErrors(['error' => 'Gagal menemukan file backup.']);
}

$latestBackup = $files->first();
$filename = 'backup_' . now()->format('Ymd_His') . '.zip';

// Hapus backup lama dari public
$publicFiles = Storage::disk('public')->files();
foreach ($publicFiles as $file) {
    if (str_starts_with($file, 'backup_') && str_ends_with($file, '.zip')) {
        Storage::disk('public')->delete($file);
    }
}

// Salin file ke storage/app/public
Storage::disk('public')->put($filename, file_get_contents($latestBackup));

// Tampilkan link download
session()->flash('backupFile', asset("storage/{$filename}"));
session()->flash('success', 'Backup database berhasil.');
return redirect()->route('admin.database');
}



/**
 * Restore the database from a backup.
 */
public function restoreDatabase(Request $request)
{
    $request->validate([
        'sql_file' => 'required|file|mimes:sql',
    ]);

    // Simpan file sementara
    $path = $request->file('sql_file')->storeAs('', 'restore_temp.sql');
    $restorePath = storage_path('app/restore_temp.sql');

    if (!file_exists($restorePath)) {
        return back()->withErrors(['error' => 'File restore tidak ditemukan.']);
    }

    // Path ke mysql.exe (pastikan sesuai dengan instalasi kamu)
    $mysql = 'C:\\xampp\\mysql\\bin\\mysql.exe';

    $command = sprintf(
        'cmd /c "%s -u%s -p%s %s < %s"',
        $mysql,
        env('DB_USERNAME'),
        env('DB_PASSWORD'),
        env('DB_DATABASE'),
        $restorePath
    );

    exec($command, $output, $result);

    // \Log::info("Restore command: $command");
    // \Log::info("Restore result: " . $result);
    // \Log::info("Restore output: ", $output);

    if ($result !== 0) {
        return back()->withErrors(['error' => 'Restore database gagal.']);
    }

    // Hapus file setelah restore
    Storage::delete('restore_temp.sql');

    return back()->with('success', 'Restore database berhasil.');
}


// Import database from SQL file
public function importDatabase(Request $request)
{
    $request->validate([
        'sql_file' => 'required|file|mimes:sql'
    ]);

    $file = $request->file('sql_file')->storeAs('', 'backup.sql');

    return back()->with('success', 'File SQL berhasil diunggah. Sekarang kamu bisa restore database.');
}

// Reset the database
public function resetDatabase()
{
    Artisan::call('migrate:fresh --seed'); // jika kamu punya seeder

    return back()->with('success', 'Database berhasil direset.');
}


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
