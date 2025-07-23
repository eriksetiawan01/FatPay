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
    public static $duplikat = [];

    public function model(array $row)
    {
        // Normalisasi nama kolom
        $normalized = [];
        foreach ($row as $key => $value) {
            $normalized[strtolower(str_replace([' ', '_'], '', $key))] = $value;
        }

        // Mapping dinamis dari nama kolom Excel ke field database
        $mapping = [
            'nis' => ['nis', 'noinduk', 'noinduksiswa'],
            'nisn' => ['nisn'],
            'nik_siswa' => ['nik', 'niksiswa'],
            'nama_lengkap' => ['namasiswa', 'namalengkap'],
            'jenis_kelamin' => ['jeniskelamin', 'jk', 'lp'],
            'tempat_lahir' => ['tempatlahir', 'ttl'],
            'tanggal_lahir' => ['tanggallahir', 'tgllahir', 'ttl'],
            'alamat' => ['alamat'],
            'no_wa_ortu' => ['nowaortu', 'nowhatsapp', 'nomorwa', 'nowa'],
            'nama_orang_tua' => ['namaortu', 'namaorangtua'],
            'alamat_orang_tua' => ['alamatortu', 'alamatorangtua'],
            'keterangan' => ['keterangan'],
            'status' => ['status'],
            'kelas' => ['kelas', 'namakelas']
        ];

        $data = [];

        // Loop semua target field
        foreach ($mapping as $targetKey => $sourceKeys) {
            foreach ($sourceKeys as $sourceKey) {
                if (isset($normalized[$sourceKey])) {
                    // Khusus jenis_kelamin
                    if ($targetKey === 'jenis_kelamin') {
                        $jk = strtolower($normalized[$sourceKey]);
                        if (in_array($jk, ['l', 'laki', 'laki-laki'])) {
                            $data[$targetKey] = 'L';
                        } elseif (in_array($jk, ['p', 'perempuan'])) {
                            $data[$targetKey] = 'P';
                        } else {
                            Log::warning("Jenis kelamin tidak valid: $jk");
                            return null;
                        }
                    }
                    // Khusus tempat & tanggal lahir dari satu kolom TTL
                    elseif ($targetKey === 'tempat_lahir' && isset($normalized['ttl'])) {
                        $ttl = explode(' ', $normalized['ttl'], 2);
                        $data['tempat_lahir'] = $ttl[0] ?? '-';
                    }
                    elseif ($targetKey === 'tanggal_lahir' && isset($normalized['ttl'])) {
                        $ttl = explode(' ', $normalized['ttl'], 2);
                        $tanggalLahir = $ttl[1] ?? null;
                        try {
                            $data['tanggal_lahir'] = Carbon::parse($tanggalLahir)->format('Y-m-d');
                        } catch (\Exception $e) {
                            Log::error("Format TTL tidak valid: " . $tanggalLahir);
                            return null;
                        }
                    }
                    // Khusus tanggal_lahir dari kolom sendiri
                    elseif ($targetKey === 'tanggal_lahir') {
                        try {
                            $data[$targetKey] = is_numeric($normalized[$sourceKey])
                                ? Carbon::instance(Date::excelToDateTimeObject($normalized[$sourceKey]))->format('Y-m-d')
                                : Carbon::parse($normalized[$sourceKey])->format('Y-m-d');
                        } catch (\Exception $e) {
                            Log::error("Gagal parsing tanggal_lahir: " . $normalized[$sourceKey]);
                            return null;
                        }
                    }
                    // Untuk semua field lain
                    else {
                        $data[$targetKey] = $normalized[$sourceKey];
                    }

                    break; // field ditemukan, lanjut field berikutnya
                }
            }
        }

        // Cari ID kelas dari nama
        if (!isset($data['kelas'])) {
            Log::warning('Kolom kelas tidak ditemukan');
            return null;
        }

        $kelas = Kelas::where('nama_kelas', $data['kelas'])->first();
        if (!$kelas) {
            Log::warning('Kelas tidak ditemukan: ' . $data['kelas']);
            return null;
        }

                // Cek apakah data siswa dengan NIS atau NISN sudah ada
        $existing = Siswa::where('nis', $data['nis'] ?? '')
            ->orWhere('nisn', $data['nisn'] ?? '')
            ->first();

        if ($existing) {
            self::$duplikat[] = $data['nama_lengkap'] ?? 'Tanpa Nama';
            return null; // Lewati baris ini
        }


        return new Siswa([
            'nis' => $data['nis'] ?? null,
            'nisn' => $data['nisn'] ?? null,
            'nik_siswa' => $data['nik_siswa'] ?? null,
            'nama_lengkap' => $data['nama_lengkap'] ?? null,
            'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
            'tempat_lahir' => $data['tempat_lahir'] ?? null,
            'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
            'alamat' => $data['alamat'] ?? null,
            'no_wa_ortu' => $data['no_wa_ortu'] ?? null,
            'nama_orang_tua' => $data['nama_orang_tua'] ?? '-',
            'alamat_orang_tua' => $data['alamat_orang_tua'] ?? '-',
            'keterangan' => $data['keterangan'] ?? null,
            'status' => $data['status'] ?? 'Aktif',
            'id_kelas' => $kelas->id,
        ]);
    }
}
