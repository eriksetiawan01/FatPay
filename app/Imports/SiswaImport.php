<?php

namespace App\Imports;

use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class SiswaImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Cari ID kelas berdasarkan nama kelas
        $kelas = Kelas::where('nama_kelas', $row['nama_kelas'])->first();

        Log::info('Memproses siswa: ' . ($row['nama_lengkap'] ?? '[nama kosong]'));

        if (!$kelas) {
            Log::warning('Kelas tidak ditemukan untuk siswa: ' . ($row['nama_lengkap'] ?? '[nama kosong]'));
            return null;
        }

        // Konversi tanggal_lahir dari serial Excel jika perlu
        $tanggalLahir = $row['tanggal_lahir'];

        if (is_numeric($tanggalLahir)) {
            try {
                $tanggalLahir = Carbon::instance(Date::excelToDateTimeObject($tanggalLahir))->format('Y-m-d');
            } catch (\Exception $e) {
                Log::error("Gagal konversi tanggal_lahir untuk siswa: " . $row['nama_lengkap']);
                return null;
            }
        } else {
            try {
                $tanggalLahir = Carbon::parse($tanggalLahir)->format('Y-m-d');
            } catch (\Exception $e) {
                Log::error("Format tanggal_lahir tidak valid untuk siswa: " . $row['nama_lengkap']);
                return null;
            }
        }

        return new Siswa([
            'nis' => $row['nis'],
            'nisn' => $row['nisn'],
            'nik_siswa' => $row['nik_siswa'],
            'nama_lengkap' => $row['nama_lengkap'],
            'jenis_kelamin' => $row['jenis_kelamin'],
            'tempat_lahir' => $row['tempat_lahir'],
            'tanggal_lahir' => $tanggalLahir,
            'alamat' => $row['alamat'],
            'no_wa_ortu' => $row['no_wa_ortu'],
            'nama_orang_tua' => $row['nama_orang_tua'],
            'alamat_orang_tua' => $row['alamat_orang_tua'],
            'keterangan' => $row['keterangan'],
            'status' => $row['status'],
            'id_kelas' => $kelas->id,
        ]);
    }
}
