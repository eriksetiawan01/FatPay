<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Kelas;
use App\Models\PosPembayaran;
use App\Models\Siswa;
use App\Models\Tagihan;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PembayaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $siswa = Siswa::with('kelas')
    ->whereHas('tagihan') // hanya siswa yang punya tagihan
    ->orderBy('nama_lengkap')
    ->get();
    $pos = PosPembayaran::all();
    $tagihan = Tagihan::select('id', 'nis_siswa', 'id_pos', 'tahun_ajaran', 'bulan', 'nominal_tagihan', 'sisa_tagihan', 'status')
    ->with(['siswa', 'pos'])
    ->get();
    $transaksi = Transaksi::with(['siswa', 'detail.tagihan.pos', 'petugas'])->get();

    $siswa->each(function ($s) {
        $total = Tagihan::where('nis_siswa', $s->nis)->count();
        $belumLunas = Tagihan::where('nis_siswa', $s->nis)->where('status', 'Belum Lunas')->count();

        if ($total === 0) {
            $s->status_pembayaran = '-';
        } elseif ($belumLunas > 0) {
            $s->status_pembayaran = 'Belum Lunas';
        } else {
            $s->status_pembayaran = 'Lunas';
        }
    });

    return inertia('pembayaran/index', [
        'siswa' => $siswa,
        'pos' => $pos,
        'tagihan' => $tagihan,
        'transaksi' => $transaksi,
        'kelas' => Kelas::all(),
    ]);

    }

    public function storeByKelas(Request $request)
{
    $request->validate([
        'kelas_id' => 'required|exists:kelas,id',
        'id_pos' => 'required|exists:pos_pembayaran,id',
        'tahun_ajaran' => 'required|string',
        'bulan' => 'nullable|numeric',
        'nominal_tagihan' => 'required|numeric|min:1',
    ]);

    $siswaKelas = Siswa::where('id_kelas', $request->kelas_id)->get();

    $jumlahTerbuat = 0;
    foreach ($siswaKelas as $siswa) {
        $exists = Tagihan::where([
            'nis_siswa' => $siswa->nis,
            'id_pos' => $request->id_pos,
            'tahun_ajaran' => $request->tahun_ajaran,
        ])
        ->when($request->bulan, function ($query) use ($request) {
            return $query->where('bulan', $request->bulan);
        })
        ->exists();

        if (!$exists) {
            Tagihan::create([
                'nis_siswa' => $siswa->nis,
                'id_pos' => $request->id_pos,
                'tahun_ajaran' => $request->tahun_ajaran,
                'bulan' => $request->bulan,
                'nominal_tagihan' => $request->nominal_tagihan,
                'sisa_tagihan' => $request->nominal_tagihan,
                'status' => 'Belum Lunas',
            ]);
            $jumlahTerbuat++;
        }
    }

    return redirect()->back()->with('success', "{$jumlahTerbuat} tagihan berhasil ditambahkan untuk siswa di kelas.");
}


public function storeBySiswa(Request $request)
{
    $request->validate([
        'nis_siswa' => 'required|exists:siswa,nis',
        'id_pos' => 'required|exists:pos_pembayaran,id',
        'tahun_ajaran' => 'required|string',
        'bulan' => 'nullable|numeric',
        'nominal_tagihan' => 'required|numeric|min:1',
    ]);

    $exists = Tagihan::where([
        'nis_siswa' => $request->nis_siswa,
        'id_pos' => $request->id_pos,
        'tahun_ajaran' => $request->tahun_ajaran,
    ])
    ->when($request->bulan, function ($query) use ($request) {
        return $query->where('bulan', $request->bulan);
    })
    ->exists();

    if ($exists) {
        return redirect()->back()->with('error', 'Tagihan untuk siswa ini dengan POS, bulan dan tahun tersebut sudah ada.');
    }

    Tagihan::create([
        'nis_siswa' => $request->nis_siswa,
        'id_pos' => $request->id_pos,
        'tahun_ajaran' => $request->tahun_ajaran,
        'bulan' => $request->bulan,
        'nominal_tagihan' => $request->nominal_tagihan,
        'sisa_tagihan' => $request->nominal_tagihan,
        'status' => 'Belum Lunas',
    ]);

    return redirect()->back()->with('success', 'Tagihan berhasil ditambahkan untuk siswa.');
}



        public function show($nis)
        {
            $siswa = Siswa::where('nis', $nis)->firstOrFail();
            $tagihan = Tagihan::where('nis_siswa', $nis)->with('pos')->get();
            $transaksi = Transaksi::where('nis_siswa', $nis)
                ->with(['detail.tagihan.pos', 'petugas'])
                ->orderByDesc('tanggal')
                ->get();

            return inertia('Admin/Pembayaran/Detail', [
                'siswa' => $siswa,
                'tagihan' => $tagihan,
                'transaksi' => $transaksi,
            ]);
        }

    public function bayar(Request $request, $nis)
{
    DB::transaction(function () use ($request, $nis) {
        $totalBayar = array_sum(array_column($request->input('bayar'), 'jumlah_bayar'));

        // Validasi: pastikan tidak ada pembayaran yang melebihi sisa tagihan
        foreach ($request->input('bayar') as $bayarItem) {
            $tagihan = Tagihan::find($bayarItem['id_tagihan']);
            $jumlahBayar = $bayarItem['jumlah_bayar'];

            if ($jumlahBayar > $tagihan->sisa_tagihan) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'bayar' => "Pembayaran melebihi sisa tagihan untuk POS {$tagihan->pos->nama_pos}. Maksimal Rp {$tagihan->sisa_tagihan}",
                ]);
            }
        }

        $transaksi = Transaksi::create([
            'tanggal' => now(),
            'nis_siswa' => $nis,
            'petugas_id' => Auth::id(),
            'total_bayar' => $totalBayar,
        ]);

        foreach ($request->input('bayar') as $bayarItem) {
            $tagihan = Tagihan::find($bayarItem['id_tagihan']);
            $bayar = $bayarItem['jumlah_bayar'];

            $tagihan->sisa_tagihan -= $bayar;
            if ($tagihan->sisa_tagihan <= 0) {
                $tagihan->sisa_tagihan = 0;
                $tagihan->status = 'Lunas';
            }
            $tagihan->save();

            DetailTransaksi::create([
                'id_transaksi' => $transaksi->id,
                'id_tagihan' => $tagihan->id,
                'jumlah_bayar' => $bayar,
            ]);
        }

        $masihAdaTagihan = Tagihan::where('nis_siswa', $nis)->where('status', 'Belum Lunas')->exists();
        session()->flash('status_pembayaran', $masihAdaTagihan ? 'Belum Lunas' : 'Lunas');
    });

    return redirect()->route('pembayaran.index');
}



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
        'nama_pos' => 'required|string|max:255',
        'tipe' => 'required|in:Bulanan,Tahunan,Bebas',
    ]);

    PosPembayaran::create([
        'nama_pos' => $request->nama_pos,
        'tipe' => $request->tipe,
    ]);

    return redirect()->route('pembayaran.index')->with('success', 'Jenis pembayaran berhasil ditambahkan.');
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
