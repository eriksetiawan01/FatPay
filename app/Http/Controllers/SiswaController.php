<?php

namespace App\Http\Controllers;

use App\Imports\SiswaImport;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;


class SiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
        {
            $query = Siswa::with('kelas');

            if ($request->filled('search')) {
                $query->where('nama_lengkap', 'like', '%' . $request->search . '%');
            }

            if ($request->filled('kelas')) {
                $query->where('id_kelas', $request->kelas);
            }

            if ($request->filled('angkatan')) {
                $query->whereHas('kelas', function ($q) use ($request) {
                    $q->where('angkatan', $request->angkatan);
                });
            }

            $siswa = $query->paginate(10)->withQueryString();
            $kelas = Kelas::all();
            $angkatan = Kelas::select('angkatan')->distinct()->pluck('angkatan');

            return Inertia::render('siswa/index', [
                'siswa' => $siswa,
                'kelas' => $kelas,
                'angkatan' => $angkatan,
                'filters' => $request->only(['search', 'kelas', 'angkatan']),
            ]);
        }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nis' => 'required|unique:siswa',
            'nisn' => 'required',
            'nik_siswa' => 'required',
            'nama_lengkap' => 'required',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required',
            'tanggal_lahir' => 'required|date',
            'alamat' => 'required',
            'no_wa_ortu' => 'required',
            'nama_orang_tua' => 'required',
            'alamat_orang_tua' => 'required',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:Aktif,Lulus,Pindah',
            'id_kelas' => 'required|exists:kelas,id',
        ]);

        Siswa::create($request->all());

        return redirect()->back()->with('success', 'Data siswa berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $siswa = Siswa::findOrFail($id);

        $validated = $request->validate([
            'nis' => 'required|unique:siswa,nis,' . $siswa->id,
            'nisn' => 'required',
            'nik_siswa' => 'required',
            'nama_lengkap' => 'required',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required',
            'tanggal_lahir' => 'required|date',
            'alamat' => 'required',
            'no_wa_ortu' => 'required',
            'nama_orang_tua' => 'required',
            'alamat_orang_tua' => 'required',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:Aktif,Lulus,Pindah',
            'id_kelas' => 'required|exists:kelas,id',

        ]);

        $siswa->update([
            'nis' => $validated['nis'],
            'nisn' => $validated['nisn'],
            'nik_siswa' => $validated['nik_siswa'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'jenis_kelamin' => $validated['jenis_kelamin'],
            'tempat_lahir' => $validated['tempat_lahir'],
            'tanggal_lahir' => $validated['tanggal_lahir'],
            'alamat' => $validated['alamat'],
            'no_wa_ortu' => $validated['no_wa_ortu'],
            'nama_orang_tua' => $validated['nama_orang_tua'],
            'alamat_orang_tua' => $validated['alamat_orang_tua'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $validated['status'],
            'id_kelas' => $validated['id_kelas'],
        ]);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil diubah.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->delete();

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil dihapus.');
    }

    /**
     * Import siswa data from Excel file.
     */
    public function import(Request $request)
{
    $request->validate([
        'file' => 'required|mimes:xlsx,xls',
    ]);

    Excel::import(new SiswaImport, $request->file('file'));

    return redirect()->back()->with('success', 'Import berhasil!');
}

    /**
     * Download the template for importing siswa data.
     */
public function downloadTemplate(): StreamedResponse
{
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

        $sheet->fromArray([
        'nis',
        'nisn',
        'nik_siswa',
        'nama_lengkap',
        'jenis_kelamin', // L/P
        'tempat_lahir',
        'tanggal_lahir', // YYYY-MM-DD
        'alamat',
        'no_wa_ortu',
        'nama_orang_tua',
        'alamat_orang_tua',
        'keterangan',
        'status',
        'nama_kelas', // ganti dari id_kelas ke kelas
    ], NULL, 'A1');

    // Generate file
    $writer = new Xlsx($spreadsheet);
    $fileName = 'template_import_siswa.xlsx';

    return response()->streamDownload(function () use ($writer) {
        $writer->save('php://output');
    }, $fileName);
}

public function batchUpdate(Request $request)
{
    $validated = $request->validate([
        'ids' => 'required|array',
        'action' => 'required|in:naik,pindah,tinggal,lulus',
        'target_kelas_id' => 'nullable|exists:kelas,id', // untuk pindah/naik
    ]);

    $siswa = Siswa::whereIn('id', $validated['ids'])->get();

    foreach ($siswa as $item) {
        if ($validated['action'] === 'naik') {
            // logika: ambil kelas sekarang -> kelas berikutnya
            $nextKelas = Kelas::where('id', '>', $item->id_kelas)->orderBy('id')->first();
            if ($nextKelas) {
                $item->update(['id_kelas' => $nextKelas->id]);
            }
        } elseif ($validated['action'] === 'pindah') {
            $item->update(['id_kelas' => $validated['target_kelas_id']]);
        } elseif ($validated['action'] === 'tinggal') {
            // tidak perlu ubah apa pun
        } elseif ($validated['action'] === 'lulus') {
            $item->update(['status' => 'Lulus']);
        }
    }

    return back()->with('success', 'Aksi berhasil dilakukan.');
}

}
