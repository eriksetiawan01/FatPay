import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Modul Pembayaran', href: '/staff/pembayaran' }];

interface Siswa {
    id: number;
    nis: string;
    nama_lengkap: string;
    status_pembayaran: string;
    no_wa_ortu: string;
    kelas?: { nama_kelas: string };
}

interface Pos {
    id: number;
    nama_pos: string;
    tipe: string;
}

interface Tagihan {
    id: number;
    nis_siswa: string;
    tahun_ajaran: string;
    nominal_tagihan: string;
    sisa_tagihan: string;
    status: string;
    bulan: number | null;
    pos: Pos;
    siswa: Siswa;
}

interface Transaksi {
    id: number;
    tanggal: string;
    total_bayar: string;
    siswa: Siswa;
    petugas: { name: string };
    detail: {
        id: number;
        jumlah_bayar: string;
        status_pembayaran: string;
        tagihan: {
            tahun_ajaran: string;
            pos: Pos;
            status: string;
            nominal_tagihan: number;
            sisa_tagihan: number;
        };
    }[];
}

interface Kelas {
    id: number;
    nama_kelas: string;
}

interface PageProps {
    siswa?: Siswa[];
    pos?: Pos[];
    tagihan?: Tagihan[];
    transaksi?: Transaksi[];
    kelas?: Kelas[];
}

interface FlashProps {
    status_pembayaran?: string;
}

interface InertiaPageProps {
    flash?: FlashProps;
}

export default function PembayaranPage({ siswa = [], pos = [], tagihan = [], transaksi = [], kelas = [] }: PageProps) {
    const [namaPos, setNamaPos] = useState('');
    const [tipe, setTipe] = useState('Bulanan');
    const [modeInput, setModeInput] = useState<'siswa' | 'kelas'>('siswa');
    const [pembayaranNIS, setPembayaranNIS] = useState('');
    const [tagihanSiswa, setTagihanSiswa] = useState<Tagihan[]>([]);
    const [jumlahBayar, setJumlahBayar] = useState<Record<number, number>>({});
    const [showFormBayar, setShowFormBayar] = useState(false);

    const [formTagihan, setFormTagihan] = useState({
        nis_siswa: '',
        id_pos: '',
        tahun_ajaran: '',
        bulan: '',
        nominal_tagihan: '',
        kelas_id: '',
    });

    const handleSubmitPos = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/staff/pos-pembayaran', { nama_pos: namaPos, tipe });
        setNamaPos('');
        setTipe('Bulanan');
    };

    const handleSubmitTagihan = (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = modeInput === 'siswa' ? '/staff/tagihan' : '/staff/tagihan-kelas';
        const payload = {
            ...formTagihan,
            sisa_tagihan: formTagihan.nominal_tagihan,
            status: 'Belum Lunas',
        };
        router.post(endpoint, payload);
        setFormTagihan({
            nis_siswa: '',
            id_pos: '',
            tahun_ajaran: '',
            bulan: '',
            nominal_tagihan: '',
            kelas_id: '',
        });
    };

    const mulaiPembayaran = (nis: string) => {
        const tagihanTerpilih = tagihan.filter((t) => t.nis_siswa === nis && t.status === 'Belum Lunas');
        setTagihanSiswa(tagihanTerpilih);
        setPembayaranNIS(nis);
        setJumlahBayar({});
        setShowFormBayar(true);
    };

    const handleBayar = () => {
        const bayarPayload = tagihanSiswa
            .filter((t) => jumlahBayar[t.id] && jumlahBayar[t.id] > 0)
            .map((t) => ({
                id_tagihan: t.id,
                jumlah_bayar: jumlahBayar[t.id],
            }));

        if (bayarPayload.length === 0) {
            alert('Mohon isi minimal 1 jumlah pembayaran');
            return;
        }

        router.post(
            `/staff/pembayaran/${pembayaranNIS}/bayar`,
            { bayar: bayarPayload },
            {
                onSuccess: () => {
                    setShowFormBayar(false);
                    setJumlahBayar({});
                    setPembayaranNIS('');
                    setTagihanSiswa([]);
                },
            },
        );
    };

    const [activeTab, setActiveTab] = useState('transaksi');

    const handleFilterTagihan = () => {
        // Tidak perlu fetch ulang karena datanya sudah tersedia di props
        // Cukup trigger render ulang dengan perubahan state
        // Bisa ditambahkan logika tambahan jika butuh
    };

    const { props } = usePage<InertiaPageProps>();
    const flashStatus = props.flash?.status_pembayaran;

    useEffect(() => {
        if (flashStatus === 'Lunas') {
            setActiveTab('riwayat');
        } else if (flashStatus === 'Belum Lunas') {
            setActiveTab('transaksi');
        }
    }, [flashStatus]);

    const { errors } = usePage().props as { errors: Record<string, string> };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modul Pembayaran" />
            <h1 className="m-10 mb-4 text-3xl font-bold">🧾 Modul Pembayaran</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-10">
                <div className="flex justify-center">
                    <TabsList className="my-6 flex flex-wrap gap-2">
                        <TabsTrigger value="jenis">💰 Jenis Pembayaran</TabsTrigger>
                        <TabsTrigger value="tagihan">📄 Tagihan Siswa</TabsTrigger>
                        <TabsTrigger value="transaksi">💳 Transaksi Pembayaran</TabsTrigger>
                        <TabsTrigger value="riwayat">⏳ History Transaksi</TabsTrigger>
                        <TabsTrigger value="broadcast">📢 Broadcast Tagihan</TabsTrigger>
                    </TabsList>
                </div>

                {/* === Jenis Pembayaran === */}
                <TabsContent value="jenis">
                    <form onSubmit={handleSubmitPos} className="mb-6 flex flex-col gap-4 md:flex-row">
                        <Input type="text" placeholder="Nama Pos Pembayaran" value={namaPos} onChange={(e) => setNamaPos(e.target.value)} required />
                        <select value={tipe} onChange={(e) => setTipe(e.target.value)} className="rounded border px-3 py-2">
                            <option value="Bulanan">Bulanan</option>
                            <option value="Tahunan">Tahunan</option>
                            <option value="Bebas">Bebas</option>
                        </select>
                        <Button type="submit">Tambah</Button>
                    </form>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Jenis Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="w-full table-auto border-collapse">
                                <TableHeader className="bg-blue-400">
                                    <TableRow>
                                        <TableHead className="border border-gray-500 text-center">No</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Nama Pos</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Tipe</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="border border-gray-300 py-4 text-center">
                                                Tidak ada data jenis pembayaran
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pos.map((p, i) => (
                                            <TableRow key={p.id} className="odd:bg-gray-200">
                                                <TableCell className="border border-gray-300 text-center">{i + 1}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{p.nama_pos}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{p.tipe}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === Tagihan Siswa === */}
                <TabsContent value="tagihan">
                    <Card className="mt-4 mb-4">
                        <CardHeader>
                            <CardTitle>📄 Tambah Tagihan Siswa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex gap-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="siswa"
                                        checked={modeInput === 'siswa'}
                                        onChange={() => setModeInput('siswa')}
                                    />{' '}
                                    Per Siswa
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="kelas"
                                        checked={modeInput === 'kelas'}
                                        onChange={() => setModeInput('kelas')}
                                    />{' '}
                                    Per Kelas
                                </label>
                            </div>

                            <form onSubmit={handleSubmitTagihan} className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                {modeInput === 'siswa' ? (
                                    <select
                                        required
                                        value={formTagihan.nis_siswa}
                                        onChange={(e) => setFormTagihan({ ...formTagihan, nis_siswa: e.target.value })}
                                        className="rounded border px-3 py-2"
                                    >
                                        <option value="">Pilih Siswa</option>
                                        {siswa
                                            .filter((s) => s.status_pembayaran !== 'Lunas')
                                            .map((s) => (
                                                <option key={s.nis} value={s.nis}>
                                                    {s.nama_lengkap}
                                                </option>
                                            ))}
                                    </select>
                                ) : (
                                    <select
                                        required
                                        value={formTagihan.kelas_id}
                                        onChange={(e) => setFormTagihan({ ...formTagihan, kelas_id: e.target.value })}
                                        className="rounded border px-3 py-2"
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {kelas.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.nama_kelas}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <select
                                    required
                                    value={formTagihan.id_pos}
                                    onChange={(e) => setFormTagihan({ ...formTagihan, id_pos: e.target.value })}
                                    className="rounded border px-3 py-2"
                                >
                                    <option value="">Pilih POS</option>
                                    {pos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama_pos}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="text"
                                    placeholder="Tahun Ajaran"
                                    required
                                    value={formTagihan.tahun_ajaran}
                                    onChange={(e) => setFormTagihan({ ...formTagihan, tahun_ajaran: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Bulan (1-12 atau kosong)"
                                    value={formTagihan.bulan}
                                    onChange={(e) => setFormTagihan({ ...formTagihan, bulan: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Nominal Tagihan"
                                    required
                                    value={formTagihan.nominal_tagihan}
                                    onChange={(e) => setFormTagihan({ ...formTagihan, nominal_tagihan: e.target.value })}
                                />
                                <Button type="submit">Tambah Tagihan</Button>
                            </form>

                            <Table className="w-full table-auto border-collapse">
                                <TableHeader className="bg-blue-400">
                                    <TableRow>
                                        <TableHead className="border border-gray-500 text-center">No</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Nama Siswa</TableHead>
                                        <TableHead className="border border-gray-500 text-center">POS</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Bulan</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Tahun Ajaran</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Tagihan</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Sisa</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tagihan
                                        .filter((t) => t.status !== 'Lunas')
                                        .map((t, i) => (
                                            <TableRow key={t.id} className="odd:bg-gray-200">
                                                <TableCell className="border border-gray-300 text-center">{i + 1}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{t.siswa?.nama_lengkap || '-'}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{t.pos?.nama_pos}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{t.bulan ?? '-'}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{t.tahun_ajaran}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">
                                                    Rp {Number(t.nominal_tagihan).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="border border-gray-300 text-center">
                                                    Rp {Number(t.sisa_tagihan).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="border border-gray-300 text-center">{t.status}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === Transaksi Pembayaran === */}
                <TabsContent value="transaksi">
                    <Card className="mt-4 mb-5">
                        <CardHeader>
                            <CardTitle>💳 Transaksi Pembayaran Siswa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {showFormBayar && (
                                <div className="mb-10 border-t pt-6">
                                    <h3 className="mb-4 text-lg font-semibold">🧾 Form Pembayaran untuk NIS: {pembayaranNIS}</h3>

                                    {errors?.bayar && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{errors.bayar}</div>}

                                    <Table className="w-full table-auto border-collapse">
                                        <TableHeader className="bg-blue-400">
                                            <TableRow>
                                                <TableHead className="border border-gray-500 text-center">No</TableHead>
                                                <TableHead className="border border-gray-500 text-center">POS</TableHead>
                                                <TableHead className="border border-gray-500 text-center">Bulan</TableHead>
                                                <TableHead className="border border-gray-500 text-center">Tahun</TableHead>
                                                <TableHead className="border border-gray-500 text-center">Tagihan</TableHead>
                                                <TableHead className="border border-gray-500 text-center">Sisa</TableHead>
                                                <TableHead className="border border-gray-500 text-center">Bayar</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tagihanSiswa.map((t, i) => (
                                                <TableRow key={t.id} className="odd:bg-gray-200">
                                                    <TableCell className="border border-gray-300 text-center">{i + 1}</TableCell>
                                                    <TableCell className="border border-gray-300 text-center">{t.pos?.nama_pos}</TableCell>
                                                    <TableCell className="border border-gray-300 text-center">{t.bulan ?? '-'}</TableCell>
                                                    <TableCell className="border border-gray-300 text-center">{t.tahun_ajaran}</TableCell>
                                                    <TableCell className="border border-gray-300 text-center">
                                                        Rp {Number(t.nominal_tagihan).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300 text-center">
                                                        Rp {Number(t.sisa_tagihan).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300 text-center">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={Number(t.sisa_tagihan)}
                                                            value={jumlahBayar[t.id] ?? ''}
                                                            onChange={(e) =>
                                                                setJumlahBayar({
                                                                    ...jumlahBayar,
                                                                    [t.id]: Number(e.target.value),
                                                                })
                                                            }
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <div className="mt-4 flex gap-4">
                                        <Button onClick={handleBayar}>💳 Proses Pembayaran</Button>
                                        <Button variant="outline" onClick={() => setShowFormBayar(false)}>
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Table className="w-full table-auto border-collapse">
                                <TableHeader className="bg-blue-400">
                                    <TableRow>
                                        <TableHead className="border border-gray-500 text-center">No</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Nama Lengkap</TableHead>
                                        <TableHead className="border border-gray-500 text-center">NIS</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Kelas</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Status Pembayaran</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {siswa
                                        .filter((s) => s.status_pembayaran !== 'Lunas')
                                        .map((s, index) => (
                                            <TableRow key={s.id} className="odd:bg-gray-200">
                                                <TableCell className="border border-gray-300 text-center">{index + 1}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{s.nama_lengkap}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{s.nis}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{s.kelas?.nama_kelas ?? '-'}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">{s.status_pembayaran}</TableCell>
                                                <TableCell className="border border-gray-300 text-center">
                                                    <button
                                                        onClick={() => mulaiPembayaran(s.nis)}
                                                        className="text-sm text-blue-600 underline hover:text-blue-800"
                                                    >
                                                        Bayar
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === Riwayat Transaksi === */}
                <TabsContent value="riwayat">
                    <Card className="mt-4 mb-4">
                        <CardHeader>
                            <CardTitle>🧾 Riwayat Transaksi Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="w-full table-auto border-collapse">
                                <TableHeader className="bg-blue-400">
                                    <TableRow>
                                        <TableHead className="border border-gray-500 text-center">No</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Tanggal</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Nama</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Pos Pembayaran</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Tahun Ajaran</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Total Pembayaran</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Jumlah Bayar</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Sisa Bayar</TableHead>
                                        <TableHead className="border border-gray-500 text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaksi
                                        .filter((t) => t.detail.length > 0)
                                        .flatMap((t, i) =>
                                            t.detail.map((d) => (
                                                <TableRow key={d.id} className="odd:bg-gray-200">
                                                    <TableCell className="border border-gray-300">{i + 1}</TableCell>
                                                    <TableCell className="border border-gray-300">
                                                        {new Date(t.tanggal).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300">{t.siswa.nama_lengkap}</TableCell>
                                                    <TableCell className="border border-gray-300">{d.tagihan.pos.nama_pos}</TableCell>
                                                    <TableCell className="border border-gray-300">{d.tagihan.tahun_ajaran}</TableCell>
                                                    <TableCell className="border border-gray-300">
                                                        Rp {Number(d.tagihan.nominal_tagihan).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300">
                                                        Rp {Number(d.jumlah_bayar).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300">
                                                        Rp {Number(d.tagihan?.sisa_tagihan || 0).toLocaleString()}
                                                    </TableCell>

                                                    <TableCell className="border border-gray-300 text-center">
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                                d.tagihan?.status === 'Lunas'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                        >
                                                            {d.tagihan?.status === 'Lunas' ? 'Lunas' : 'Belum Lunas'}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            )),
                                        )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === Broadcast Tagihan (Dummy/Teks) === */}
                <TabsContent value="broadcast">
                    <Card className="mt-4 mb-5">
                        <CardHeader>
                            <CardTitle>📢 Broadcast Tagihan ke Orang Tua</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 rounded bg-gray-100 p-3 text-sm text-gray-600">
                                Pilih jenis pembayaran, lalu klik 'Lihat Daftar Tagihan'. Klik link di kolom 'Kirim Pesan' untuk membuka WhatsApp.
                            </p>

                            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                                <select
                                    className="rounded border px-3 py-2"
                                    value={formTagihan.id_pos}
                                    onChange={(e) => setFormTagihan({ ...formTagihan, id_pos: e.target.value })}
                                >
                                    <option value="">Pilih Item Pembayaran</option>
                                    {pos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama_pos} ({p.tipe})
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={() => handleFilterTagihan()}>Lihat Daftar Tagihan</Button>
                            </div>

                            {tagihan.length > 0 && formTagihan.id_pos && (
                                <>
                                    <p className="mb-2 text-sm text-gray-600">
                                        Ditemukan{' '}
                                        {tagihan.filter((t) => t.pos.id.toString() === formTagihan.id_pos && t.status === 'Belum Lunas').length}{' '}
                                        tagihan yang siap di-broadcast:
                                    </p>

                                    <Table className="w-full table-auto border-collapse">
                                        <TableHeader className="bg-blue-400">
                                            <TableRow>
                                                <TableHead className="border border-gray-500 text-center">Nama Siswa</TableHead>
                                                <TableHead className="border border-gray-500 text-center">No. WA Ortu</TableHead>
                                                <TableHead className="border border-gray-500 text-center">Kirim Pesan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {siswa
                                                .filter((s) => s.status_pembayaran === 'Belum Lunas')
                                                .map((s) => {
                                                    const tagihanSiswa = tagihan.find(
                                                        (t) =>
                                                            t.nis_siswa === s.nis &&
                                                            String(t.pos.id || '') === formTagihan.id_pos &&
                                                            t.status === 'Belum Lunas',
                                                    );

                                                    if (!tagihanSiswa) return null;

                                                    // Format nomor WA dari database (pastikan sudah dalam format 628...)
                                                    let nomor = s.no_wa_ortu;

                                                    // Bersihkan nomor dari karakter non-digit
                                                    nomor = nomor.replace(/\D/g, '');

                                                    // Jika nomor diawali dengan 0, ganti dengan 62
                                                    if (nomor.startsWith('0')) {
                                                        nomor = '62' + nomor.substring(1);
                                                    }
                                                    // Jika belum ada kode negara, tambahkan 62
                                                    else if (!nomor.startsWith('62')) {
                                                        nomor = '62' + nomor;
                                                    }

                                                    const message = encodeURIComponent(
                                                        `Halo Bapak/Ibu wali dari ${s.nama_lengkap},\n\nKami mengingatkan bahwa masih ada tagihan pembayaran *${tagihanSiswa.pos.nama_pos}* untuk tahun ajaran ${tagihanSiswa.tahun_ajaran}. Mohon segera melakukan pembayaran. Terima kasih.`,
                                                    );
                                                    const linkWA = `https://wa.me/${nomor}?text=${message}`;

                                                    return (
                                                        <TableRow key={s.nis} className="odd:bg-gray-200">
                                                            <TableCell className="border border-gray-300 text-center">{s.nama_lengkap}</TableCell>
                                                            <TableCell className="border border-gray-300 text-center">{nomor}</TableCell>
                                                            <TableCell className="border border-gray-300 text-center">
                                                                <a
                                                                    href={linkWA}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    Buka WhatsApp
                                                                </a>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
