import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

interface LaporanPembayaran {
    siswa?: {
        nama_lengkap: string;
        kelas?: {
            nama_kelas: string;
        };
    };
    tanggal: string;
    total_bayar: number;
    petugas?: {
        name: string;
    };
}

interface LaporanTunggakan {
    siswa?: {
        nama_lengkap: string;
        kelas?: {
            nama_kelas: string;
        };
    };
    pos?: {
        nama_pos: string;
    };
    nominal_tagihan: number;
    sisa_tagihan: number;
    status: string;
}

interface Kelas {
    id: string;
    nama_kelas: string;
}

interface Siswa {
    nis: string;
    nama_lengkap: string;
}

interface LaporanPageProps {
    kelas: Kelas[];
    angkatan: string[];
    siswa: Siswa[];
}

type Laporan = LaporanPembayaran | LaporanTunggakan;

export default function LaporanPage({ kelas, angkatan, siswa }: LaporanPageProps) {
    const [jenisLaporan, setJenisLaporan] = useState<'pembayaran' | 'tunggakan'>('pembayaran');
    const [filterWaktu, setFilterWaktu] = useState('bulan');
    const [periode, setPeriode] = useState(format(new Date(), 'yyyy-MM'));
    const [filterSiswa, setFilterSiswa] = useState('');
    const [filterKelas, setFilterKelas] = useState('');
    const [filterAngkatan, setFilterAngkatan] = useState('');
    const [laporan, setLaporan] = useState<Laporan[]>([]);

    const fetchLaporan = useCallback(async () => {
        const res = await axios.get('/admin/laporan/data', {
            params: {
                jenis: jenisLaporan,
                filter: filterWaktu,
                periode,
                nis: filterSiswa,
                kelas_id: filterKelas,
                angkatan: filterAngkatan,
            },
        });
        setLaporan(res.data.data);
    }, [jenisLaporan, filterWaktu, periode, filterSiswa, filterKelas, filterAngkatan]);

    useEffect(() => {
        fetchLaporan();
    }, [fetchLaporan]);

    return (
        <AppLayout>
            <Head title="Laporan" />

            <div className="m-10 mb-0">
                <h1 className="text-2xl font-bold">📊 Laporan</h1>
            </div>

            <Card className="m-10 mt-5">
                <CardHeader>
                    <CardTitle>Filter Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="pembayaran"
                        onValueChange={(val) => {
                            if (val === 'pembayaran' || val === 'tunggakan') {
                                setJenisLaporan(val);
                            }
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="pembayaran">Laporan Pembayaran</TabsTrigger>
                            <TabsTrigger value="tunggakan">Laporan Tunggakan</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 flex flex-wrap gap-4">
                            <Select onValueChange={setFilterWaktu} value={filterWaktu}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter Waktu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hari">Per Hari</SelectItem>
                                    <SelectItem value="minggu">Per Minggu</SelectItem>
                                    <SelectItem value="bulan">Per Bulan</SelectItem>
                                    <SelectItem value="triwulan">Per Triwulan</SelectItem>
                                    <SelectItem value="semester">Per Semester</SelectItem>
                                    <SelectItem value="tahun">Per Tahun</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="text"
                                placeholder="Periode (YYYY-MM)"
                                value={periode}
                                onChange={(e) => setPeriode(e.target.value)}
                                className="w-[180px]"
                            />

                            <Select onValueChange={setFilterSiswa} value={filterSiswa}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Pilih Siswa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {siswa.map((s) => (
                                        <SelectItem key={s.nis} value={s.nis}>
                                            {s.nama_lengkap}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select onValueChange={setFilterKelas} value={filterKelas}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kelas.map((k) => (
                                        <SelectItem key={k.id} value={k.id}>
                                            {k.nama_kelas}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select onValueChange={setFilterAngkatan} value={filterAngkatan}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Angkatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {angkatan.map((a) => (
                                        <SelectItem key={a} value={a}>
                                            {a}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <TabsContent value="pembayaran">
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Data Pembayaran</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader className="bg-blue-400">
                                            <TableRow>
                                                <TableHead className="text-center">No</TableHead>
                                                <TableHead className="text-center">Nama Siswa</TableHead>
                                                <TableHead className="text-center">Kelas</TableHead>
                                                <TableHead className="text-center">Tanggal</TableHead>
                                                <TableHead className="text-center">Total Bayar</TableHead>
                                                <TableHead className="text-center">Petugas</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jenisLaporan === 'pembayaran' &&
                                                laporan.map((item, i) => {
                                                    const pembayaran = item as LaporanPembayaran;
                                                    return (
                                                        <TableRow key={i} className="odd:bg-gray-100">
                                                            <TableCell className="text-center">{i + 1}</TableCell>
                                                            <TableCell className="text-center">{pembayaran.siswa?.nama_lengkap}</TableCell>
                                                            <TableCell className="text-center">{pembayaran.siswa?.kelas?.nama_kelas}</TableCell>
                                                            <TableCell className="text-center">{pembayaran.tanggal}</TableCell>
                                                            <TableCell className="text-center">Rp {pembayaran.total_bayar}</TableCell>
                                                            <TableCell className="text-center">{pembayaran.petugas?.name}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tunggakan">
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Data Tunggakan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader className="bg-blue-400">
                                            <TableRow>
                                                <TableHead className="text-center">No</TableHead>
                                                <TableHead className="text-center">Nama Siswa</TableHead>
                                                <TableHead className="text-center">Kelas</TableHead>
                                                <TableHead className="text-center">Jenis Pembayaran</TableHead>
                                                <TableHead className="text-center">Nominal</TableHead>
                                                <TableHead className="text-center">Sisa</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jenisLaporan === 'tunggakan' &&
                                                laporan.map((item, i) => {
                                                    const tunggakan = item as LaporanTunggakan;
                                                    return (
                                                        <TableRow key={i} className="odd:bg-gray-100">
                                                            <TableCell className="text-center">{i + 1}</TableCell>
                                                            <TableCell className="text-center">{tunggakan.siswa?.nama_lengkap}</TableCell>
                                                            <TableCell className="text-center">{tunggakan.siswa?.kelas?.nama_kelas}</TableCell>
                                                            <TableCell className="text-center">{tunggakan.pos?.nama_pos}</TableCell>
                                                            <TableCell className="text-center">Rp {tunggakan.nominal_tagihan}</TableCell>
                                                            <TableCell className="text-center">Rp {tunggakan.sisa_tagihan}</TableCell>
                                                            <TableCell className="text-center">{tunggakan.status}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
