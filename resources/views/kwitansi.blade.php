<!DOCTYPE html>
<html>
<head>
    <title>Kwitansi Pembayaran</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; }
        .subtitle { font-size: 14px; }
        .content { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; }
        .footer { margin-top: 50px; margin-right: 50px; text-align: right; }
        .signature { margin-top: 70px; }
        .status-info { 
            margin-top: 20px; 
            padding: 10px; 
            background-color: #f8f8f8; 
            border-left: 4px solid #3498db;
        }
        .lunas { color: green; font-weight: bold; }
        .belum-lunas { color: red; font-weight: bold; }
        .total-tagihan {
            margin-top: 10px;
            padding: 8px;
            background-color: #e9f7fe;
            border: 1px solid #3498db;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">KWITANSI PEMBAYARAN</div>
        <div class="subtitle">SMK BINA BANGSA</div>
    </div>
    
    <div class="content">
        <table>
            <tr>
                <td width="30%">No. Transaksi</td>
                <td width="70%">: {{ $transaksi->id }}</td>
            </tr>
            <tr>
                <td>Tanggal</td>
                <td>: {{ date('d/m/Y', strtotime($transaksi->tanggal)) }}</td>
            </tr>
            <tr>
                <td>Nama Siswa</td>
                <td>: {{ $transaksi->siswa->nama_lengkap }}</td>
            </tr>
            <tr>
                <td>NIS</td>
                <td>: {{ $transaksi->siswa->nis }}</td>
            </tr>
            <tr>
                <td>Kelas</td>
                <td>: {{ $transaksi->siswa->kelas->nama_kelas ?? '-' }}</td>
            </tr>
            <tr>
                <td>Status Pembayaran</td>
                <td>
                    @php
                        $allLunas = true;
                        foreach($transaksi->detail as $detail) {
                            if($detail->tagihan->status !== 'Lunas') {
                                $allLunas = false;
                                break;
                            }
                        }
                    @endphp
                    @if($allLunas)
                        <span class="lunas">LUNAS</span>
                    @else
                        <span class="belum-lunas">BELUM LUNAS</span>
                    @endif
                </td>
            </tr>
        </table>
        
        <!-- Tambah informasi total tagihan -->
        <div class="total-tagihan">
            <strong>Total yang Harus Dibayar:</strong> 
            Rp {{ number_format($transaksi->detail->sum('tagihan.nominal_tagihan'), 0, ',', '.') }}
        </div>
        
        <table style="margin-top: 20px;">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Jenis Pembayaran</th>
                    <th>Tahun Ajaran</th>
                    <th>Tagihan</th>
                    <th>Jumlah Bayar</th>
                    <th>Sisa Bayar</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaksi->detail as $index => $detail)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $detail->tagihan->pos->nama_pos }}</td>
                    <td>{{ $detail->tagihan->tahun_ajaran }}</td>
                    <td>Rp {{ number_format($detail->tagihan->nominal_tagihan, 0, ',', '.') }}</td>
                    <td>Rp {{ number_format($detail->jumlah_bayar, 0, ',', '.') }}</td>
                    <td>Rp {{ number_format($detail->tagihan->sisa_tagihan, 0, ',', '.') }}</td>
                    <td>
                        @if($detail->tagihan->status === 'Lunas')
                            <span class="lunas">LUNAS</span>
                        @else
                            <span class="belum-lunas">BELUM LUNAS</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3">TOTAL</th>
                    <th>Rp {{ number_format($transaksi->detail->sum('tagihan.nominal_tagihan'), 0, ',', '.') }}</th>
                    <th>Rp {{ number_format($transaksi->total_bayar, 0, ',', '.') }}</th>
                    <th>Rp {{ number_format($transaksi->detail->sum('tagihan.sisa_tagihan'), 0, ',', '.') }}</th>
                    <th></th>
                </tr>
            </tfoot>
        </table>
        
        @if(!$allLunas)
        <div class="status-info">
            <p><strong>Catatan:</strong> Pembayaran ini belum melunasi seluruh tagihan. Sisa tagihan:</p>
            <ul>
                @foreach($transaksi->detail as $detail)
                    @if($detail->tagihan->status !== 'Lunas')
                    <li>
                        {{ $detail->tagihan->pos->nama_pos }}: 
                        Rp {{ number_format($detail->tagihan->sisa_tagihan, 0, ',', '.') }}
                    </li>
                    @endif
                @endforeach
            </ul>
        </div>
        @endif
    </div>
    
    <div class="footer">
        <div class="signature">
            <p>Petugas,</p>
            <br><br><br>
            <p>{{ $transaksi->petugas->name }}</p>
        </div>
    </div>
</body>
</html>