import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Download, Pencil, Plus, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Interfaces
interface Kelas {
    id: number;
    nama_kelas: string;
    angkatan: string;
}

interface Siswa {
    id: number;
    nis: string;
    nik_siswa: string;
    nisn: string;
    nama_lengkap: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    no_wa_ortu: string;
    nama_orang_tua: string;
    alamat_orang_tua: string;
    keterangan: string | null;
    status: 'Aktif' | 'Lulus' | 'Pindah';
    kelas: {
        id: number;
        nama_kelas: string;
        angkatan: string;
    };
}

interface SiswaPagination {
    data: Siswa[];
    current_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PageProps {
    siswa: SiswaPagination;
    kelas: Kelas[];
    angkatan: string[];
    filters: {
        search?: string;
        kelas?: string;
        angkatan?: string;
    };
}

// Constants
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Siswa',
        href: '/admin/siswa',
    },
];

const initialFormState = {
    nis: '',
    nik_siswa: '',
    nisn: '',
    nama_lengkap: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    no_wa_ortu: '',
    nama_orang_tua: '',
    alamat_orang_tua: '',
    keterangan: '',
    status: 'Aktif',
    id_kelas: '',
};

const formFields = [
    { label: 'NIS', name: 'nis', type: 'text' },
    { label: 'NIK Siswa', name: 'nik_siswa', type: 'text' },
    { label: 'NISN', name: 'nisn', type: 'text' },
    { label: 'Nama Lengkap', name: 'nama_lengkap', type: 'text' },
    { label: 'Tempat Lahir', name: 'tempat_lahir', type: 'text' },
    { label: 'Tanggal Lahir', name: 'tanggal_lahir', type: 'date' },
    { label: 'Alamat', name: 'alamat', type: 'textarea' },
    { label: 'No. WA Orang Tua', name: 'no_wa_ortu', type: 'text' },
    { label: 'Nama Orang Tua', name: 'nama_orang_tua', type: 'text' },
    { label: 'Alamat Orang Tua', name: 'alamat_orang_tua', type: 'textarea' },
    { label: 'Keterangan', name: 'keterangan', type: 'textarea' },
];

export default function SiswaPage({ siswa, kelas, angkatan, filters }: PageProps) {
    // State management
    const [form, setForm] = useState(initialFormState);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [kelasFilter, setKelasFilter] = useState(filters.kelas || '');
    const [angkatanFilter, setAngkatanFilter] = useState(filters.angkatan || '');
    const [activeTab, setActiveTab] = useState('daftar-siswa');
    const [activeActionTab, setActiveActionTab] = useState('naik-pindah');
    const [selectedActionStudents, setSelectedActionStudents] = useState<Siswa[]>([]);
    const [naikPindahMode, setNaikPindahMode] = useState<'all' | 'selected'>('selected');
    const [dariKelasId, setDariKelasId] = useState('');
    const [keKelasId, setKeKelasId] = useState('');
    const [kelasLulusTinggalId, setKelasLulusTinggalId] = useState('');
    const [actionSearchQuery, setActionSearchQuery] = useState('');
    const [availableStudentsForAction, setAvailableStudentsForAction] = useState<Siswa[]>([]);
    const { props } = usePage();
    const flash = props.flash as { success?: string; duplikat?: string[] };

    // Form handling
    const resetForm = () => {
        setForm(initialFormState);
        setEditMode(false);
        setSelectedId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editMode && selectedId ? `/admin/siswa/${selectedId}` : '/admin/siswa';
        const method = editMode && selectedId ? 'put' : 'post';

        router[method](url, form, {
            onSuccess: () => {
                resetForm();
                setOpen(false);
            },
        });
    };

    const handleEdit = (s: Siswa) => {
        setForm({
            nis: s.nis,
            nik_siswa: s.nik_siswa,
            nisn: s.nisn,
            nama_lengkap: s.nama_lengkap,
            jenis_kelamin: s.jenis_kelamin,
            tempat_lahir: s.tempat_lahir,
            tanggal_lahir: s.tanggal_lahir,
            alamat: s.alamat,
            no_wa_ortu: s.no_wa_ortu,
            nama_orang_tua: s.nama_orang_tua,
            alamat_orang_tua: s.alamat_orang_tua,
            keterangan: s.keterangan || '',
            status: s.status,
            id_kelas: String(s.kelas?.id ?? ''),
        });
        setSelectedId(s.id);
        setEditMode(true);
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data siswa ini?')) {
            router.delete(`/admin/siswa/${id}`);
        }
    };

    // Import handling
    const {
        data: importData,
        setData: setImportData,
        post: postImport,
        processing,
    } = useForm<{ file: File | null }>({
        file: null,
    });

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport('/admin/siswa/import', {
            onSuccess: () => {
                setImportData('file', null);
                alert('Import berhasil!');
            },
            onError: (err) => {
                console.error(err);
                alert('Terjadi kesalahan saat import.');
            },
        });
    };

    useEffect(() => {
    if (flash?.success) {
        if (flash.duplikat?.length) {
            alert(
                `${flash.success}\n\nData yang duplikat:\n- ${flash.duplikat.join('\n- ')}`
            );
        } else {
            alert(flash.success);
        }
    }
}, [flash]);

    // Filter students for action tabs
    useEffect(() => {
        let filtered: Siswa[] = [];

        if (activeActionTab === 'naik-pindah' && naikPindahMode === 'selected' && dariKelasId) {
            filtered = siswa.data.filter((s) => String(s.kelas?.id) === dariKelasId);
        } else if ((activeActionTab === 'lulus' || activeActionTab === 'tinggal') && kelasLulusTinggalId) {
            filtered = siswa.data.filter((s) => String(s.kelas?.id) === kelasLulusTinggalId && s.status === 'Aktif');
        }

        setAvailableStudentsForAction(filtered);
        setSelectedActionStudents([]);
    }, [dariKelasId, naikPindahMode, activeActionTab, kelasLulusTinggalId, siswa.data]);

    // Student selection for actions
    const handleAddStudentToAction = (student: Siswa) => {
        if (!selectedActionStudents.some((s) => s.id === student.id)) {
            setSelectedActionStudents((prev) => [...prev, student]);
            setActionSearchQuery('');
            setAvailableStudentsForAction((prev) => prev.filter((s) => s.id !== student.id));
        }
    };

    const handleRemoveStudentFromAction = (studentId: number) => {
        setSelectedActionStudents((prev) => prev.filter((s) => s.id !== studentId));
        const removedStudent = siswa.data.find((s) => s.id === studentId);

        if (removedStudent) {
            const shouldReAdd =
                (naikPindahMode === 'selected' && String(removedStudent.kelas?.id) === dariKelasId) ||
                ((activeActionTab === 'lulus' || activeActionTab === 'tinggal') && String(removedStudent.kelas?.id) === kelasLulusTinggalId);

            if (shouldReAdd) {
                setAvailableStudentsForAction((prev) => [...prev, removedStudent].sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap)));
            }
        }
    };

    // Batch actions
    const handleBatchUpdate = (action: 'naik' | 'pindah' | 'tinggal' | 'lulus') => {
        if (selectedActionStudents.length === 0 && naikPindahMode === 'selected' && action !== 'naik') {
            alert('Pilih setidaknya satu siswa.');
            return;
        }

        let payload: { action: string; ids: number[]; target_kelas_id?: string | number | null } = {
            action,
            ids: selectedActionStudents.map((s) => s.id),
        };

        if (action === 'naik') {
            if (naikPindahMode === 'all') {
                payload.ids = siswa.data.filter((s) => String(s.kelas?.id) === dariKelasId).map((s) => s.id);
                if (payload.ids.length === 0) {
                    alert('Tidak ada siswa di kelas ini untuk dinaikkan.');
                    return;
                }
            }
            payload.target_kelas_id = null;
        } else if (action === 'pindah') {
            if (!keKelasId) {
                alert('Pilih kelas tujuan.');
                return;
            }
            payload.target_kelas_id = keKelasId;
        } else if (action === 'lulus' || action === 'tinggal') {
            if (!kelasLulusTinggalId) {
                alert(`Pilih kelas yang akan ${action === 'lulus' ? 'diluluskan' : 'ditinggal'}.`);
                return;
            }
            payload.ids = siswa.data.filter((s) => String(s.kelas?.id) === kelasLulusTinggalId && s.status === 'Aktif').map((s) => s.id);
            if (payload.ids.length === 0) {
                alert(`Tidak ada siswa aktif di kelas ini untuk ${action === 'lulus' ? 'diluluskan' : 'ditinggal'}.`);
                return;
            }
        }

        router.post('/admin/siswa/batch', payload, {
            onSuccess: () => {
                alert('Aksi berhasil dilakukan!');
                setSelectedActionStudents([]);
                setDariKelasId('');
                setKeKelasId('');
                setKelasLulusTinggalId('');
                setActionSearchQuery('');
                setNaikPindahMode('selected');
                router.reload();
            },
            onError: (errors) => {
                console.error('Error during batch update:', errors);
                alert('Terjadi kesalahan saat melakukan aksi.');
            },
        });
    };

    // Filter students for search in action section
    const filteredAvailableStudents = availableStudentsForAction.filter(
        (s) =>
            s.nama_lengkap.toLowerCase().includes(actionSearchQuery.toLowerCase()) ||
            s.nis.includes(actionSearchQuery) ||
            s.nik_siswa.includes(actionSearchQuery),
    );

    // Render helpers
    const renderFormField = (field: { label: string; name: string; type: string }) => {
        const { label, name, type } = field;
        return (
            <div key={name} className={type === 'textarea' ? 'col-span-2' : ''}>
                <Label htmlFor={name}>{label}</Label>
                {type === 'textarea' ? (
                    <textarea
                        id={name}
                        name={name}
                        value={(form as any)[name]}
                        onChange={handleChange}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                ) : (
                    <Input id={name} name={name} type={type} value={(form as any)[name]} onChange={handleChange} />
                )}
            </div>
        );
    };

    const renderStudentTableRow = (item: Siswa, index: number) => (
        <TableRow key={item.id} className="odd:bg-gray-200">
            <TableCell className="border border-gray-400 text-center">{(siswa.current_page - 1) * 10 + index + 1}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.nis}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.nik_siswa}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.tempat_lahir}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.tanggal_lahir}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.nisn}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.nama_lengkap}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.jenis_kelamin}</TableCell>
            <TableCell className="border border-gray-400 text-center">
                {item.kelas?.nama_kelas} ({item.kelas?.angkatan})
            </TableCell>
            <TableCell className="border border-gray-400 text-center">{item.no_wa_ortu}</TableCell>
            <TableCell className="border border-gray-400 text-center">{item.status}</TableCell>
            <TableCell className="border border-gray-400 text-center">
                <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );

    const renderPagination = () => (
        <div className="mt-4 flex justify-center gap-2">
            {siswa.links.map((link, index) => (
                <Button
                    key={index}
                    variant={link.active ? 'default' : 'outline'}
                    disabled={!link.url}
                    onClick={() => link.url && router.visit(link.url)}
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
            ))}
        </div>
    );

    const renderStudentSelection = () => (
        <>
            <Label>Pilih siswa yang akan diproses:</Label>
            <Input
                type="text"
                placeholder="Cari nama / NIS / NIK siswa..."
                value={actionSearchQuery}
                onChange={(e) => setActionSearchQuery(e.target.value)}
                className="max-w-lg"
            />
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded border p-2 md:grid-cols-2">
                {filteredAvailableStudents.length > 0 ? (
                    filteredAvailableStudents.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded bg-gray-100 p-2 text-sm">
                            <span>
                                {s.nama_lengkap} ({s.kelas.nama_kelas})
                            </span>
                            <Button size="sm" variant="secondary" onClick={() => handleAddStudentToAction(s)}>
                                Tambah
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="col-span-2 text-sm text-muted-foreground">Tidak ada siswa tersedia untuk dipilih atau sudah ditambahkan.</p>
                )}
            </div>

            <div className="flex min-h-[50px] flex-wrap gap-2 rounded border p-2">
                {selectedActionStudents.length > 0 ? (
                    selectedActionStudents.map((s) => (
                        <span
                            key={s.id}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                            {s.nama_lengkap} ({s.kelas.nama_kelas})
                            <button
                                type="button"
                                onClick={() => handleRemoveStudentFromAction(s.id)}
                                className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-200 focus:text-blue-500 focus:outline-none"
                            >
                                &times;
                            </button>
                        </span>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Siswa yang akan {activeActionTab === 'lulus' ? 'diluluskan' : activeActionTab === 'tinggal' ? 'ditinggal' : 'diproses'} akan
                        muncul di sini.
                    </p>
                )}
            </div>
        </>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Siswa" />

            <div className="mx-10 my-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manajemen Siswa</h1>

                <Dialog
                    open={open}
                    onOpenChange={(o) => {
                        if (!o) resetForm();
                        setOpen(o);
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Siswa
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{editMode ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto pr-2">
                            {formFields.map(renderFormField)}

                            <div>
                                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                                <select
                                    id="jenis_kelamin"
                                    name="jenis_kelamin"
                                    value={form.jenis_kelamin}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Lulus">Lulus</option>
                                    <option value="Pindah">Pindah</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="id_kelas">Kelas</Label>
                                <select
                                    id="id_kelas"
                                    name="id_kelas"
                                    value={form.id_kelas}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="">Pilih Kelas</option>
                                    {kelas.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_kelas} ({k.angkatan})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 pt-2">
                                <Button type="submit">{editMode ? 'Simpan Perubahan' : 'Tambah Siswa'}</Button>
                                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="daftar-siswa">Daftar Siswa</TabsTrigger>
                        <TabsTrigger value="modul-siswa">Modul Siswa</TabsTrigger>
                    </TabsList>

                    {/* Daftar Siswa Tab */}
                    <TabsContent value="daftar-siswa" className="mt-4 space-y-4">
                        <div className="mx-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <form onSubmit={handleImport} className="flex items-center gap-3">
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    required
                                    onChange={(e) => setImportData('file', e.target.files?.[0] ?? null)}
                                    className="max-w-sm"
                                />
                                <Button type="submit" disabled={processing}>
                                    Import Excel
                                </Button>
                            </form>
                            <a href="/admin/siswa/template" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="gap-2 text-blue-600 hover:text-blue-800">
                                    <Download className="h-4 w-4" />
                                    Download Template
                                </Button>
                            </a>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.get('/admin/siswa', { search, kelas: kelasFilter, angkatan: angkatanFilter });
                            }}
                            className="mx-10 mb-6 flex flex-wrap items-center gap-3"
                        >
                            <Input
                                type="text"
                                placeholder="Cari nama siswa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />

                            <select
                                value={kelasFilter}
                                onChange={(e) => setKelasFilter(e.target.value)}
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Semua Kelas</option>
                                {kelas.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama_kelas} ({k.angkatan})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={angkatanFilter}
                                onChange={(e) => setAngkatanFilter(e.target.value)}
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Semua Angkatan</option>
                                {angkatan.map((a) => (
                                    <option key={a} value={a}>
                                        Angkatan {a}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Filter</Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setKelasFilter('');
                                    setAngkatanFilter('');
                                    router.get('/admin/siswa');
                                }}
                            >
                                Reset
                            </Button>
                        </form>

                        <Card className="mx-10 mb-10">
                            <CardHeader>
                                <CardTitle>Daftar Siswa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table className="w-full table-auto border-collapse ">
                                    <TableHeader className="bg-blue-400">
                                        <TableRow>
                                            <TableHead className="border border-gray-400 text-center">No</TableHead>
                                            <TableHead className="border border-gray-400 text-center">NIS</TableHead>
                                            <TableHead className="border border-gray-400 text-center">NIK</TableHead>
                                            <TableHead className="border border-gray-400 text-center">Tempat Lahir</TableHead>
                                            <TableHead className="border border-gray-400 text-center">Tanggal Lahir</TableHead>
                                            <TableHead className="border border-gray-400 text-center">NISN</TableHead>
                                            <TableHead className="border border-gray-400 text-center">Nama</TableHead>
                                            <TableHead className="border border-gray-400 text-center">JK</TableHead>
                                            <TableHead className="border border-gray-400 text-center">Kelas</TableHead>
                                            <TableHead className="border border-gray-400 text-center">No WA Ortu</TableHead>
                                            <TableHead className="border border-gray-400 text-center">Status</TableHead>
                                            <TableHead className="border border-gray-400 text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {siswa.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-4 text-center">
                                                    Tidak ada data siswa
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            siswa.data.map(renderStudentTableRow)
                                        )}
                                    </TableBody>
                                </Table>

                                {renderPagination()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Modul Siswa Tab */}
                    <TabsContent value="modul-siswa" className="mt-4 space-y-4">
                        <Card className="mx-10 mb-6">
                            <CardHeader>
                                <CardTitle>Modul Data Siswa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeActionTab} onValueChange={setActiveActionTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="naik-pindah">Naik & Pindah Kelas</TabsTrigger>
                                        <TabsTrigger value="tinggal">Tinggal Kelas</TabsTrigger>
                                        <TabsTrigger value="lulus">Kelulusan</TabsTrigger>
                                    </TabsList>

                                    {/* Naik & Pindah Kelas Tab */}
                                    <TabsContent value="naik-pindah" className="mt-4 space-y-4">
                                        <h2 className="mb-0 text-center text-xl font-semibold">Proses Naik & Pindah Kelas</h2>
                                        <div className="flex items-center justify-center space-x-4">
                                            <Label htmlFor="mode-naik">
                                                <Input
                                                    type="radio"
                                                    id="mode-naik"
                                                    name="naikPindahMode"
                                                    value="all"
                                                    checked={naikPindahMode === 'all'}
                                                    onChange={() => {
                                                        setNaikPindahMode('all');
                                                        setSelectedActionStudents([]);
                                                    }}
                                                    className="mr-1 scale-50"
                                                />
                                                Naik Kelas (semua siswa)
                                            </Label>
                                            <Label htmlFor="mode-pindah">
                                                <Input
                                                    type="radio"
                                                    id="mode-pindah"
                                                    name="naikPindahMode"
                                                    value="selected"
                                                    checked={naikPindahMode === 'selected'}
                                                    onChange={() => {
                                                        setNaikPindahMode('selected');
                                                        setSelectedActionStudents([]);
                                                    }}
                                                    className="mr-1 scale-50"
                                                />
                                                Pindah Kelas (pilih siswa)
                                            </Label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="dari_kelas">Dari Kelas:</Label>
                                                <select
                                                    id="dari_kelas"
                                                    name="dari_kelas"
                                                    value={dariKelasId}
                                                    onChange={(e) => setDariKelasId(e.target.value)}
                                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                                >
                                                    <option value="">Pilih kelas asal</option>
                                                    {kelas.map((k) => (
                                                        <option key={k.id} value={k.id}>
                                                            {k.nama_kelas} ({k.angkatan})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {naikPindahMode === 'selected' && (
                                                <div>
                                                    <Label htmlFor="ke_kelas">Ke Kelas:</Label>
                                                    <select
                                                        id="ke_kelas"
                                                        name="ke_kelas"
                                                        value={keKelasId}
                                                        onChange={(e) => setKeKelasId(e.target.value)}
                                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Pilih kelas tujuan</option>
                                                        {kelas.map((k) => (
                                                            <option key={k.id} value={k.id}>
                                                                {k.nama_kelas} ({k.angkatan})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {naikPindahMode === 'selected' && renderStudentSelection()}

                                        <Button
                                            onClick={() => handleBatchUpdate(naikPindahMode === 'all' ? 'naik' : 'pindah')}
                                            disabled={
                                                (naikPindahMode === 'selected' && selectedActionStudents.length === 0) ||
                                                (naikPindahMode === 'selected' && !keKelasId) ||
                                                !dariKelasId ||
                                                (naikPindahMode === 'all' && !dariKelasId)
                                            }
                                        >
                                            {naikPindahMode === 'all' ? 'Naikkan Semua Siswa' : 'Pindahkan Siswa Terpilih'}
                                        </Button>
                                    </TabsContent>

                                    {/* Tinggal Kelas Tab */}
                                    <TabsContent value="tinggal" className="mt-4 space-y-4">
                                        <h2 className="text-xl font-semibold">Proses Tinggal Kelas</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Gunakan fitur ini untuk membuat siswa tinggal di kelas yang sama.
                                        </p>

                                        <div>
                                            <Label htmlFor="kelas_tinggal">Pilih kelas yang akan ditinggal:</Label>
                                            <select
                                                id="kelas_tinggal"
                                                name="kelas_tinggal"
                                                value={kelasLulusTinggalId}
                                                onChange={(e) => setKelasLulusTinggalId(e.target.value)}
                                                className="w-full rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="">Pilih kelas</option>
                                                {kelas.map((k) => (
                                                    <option key={k.id} value={k.id}>
                                                        {k.nama_kelas} ({k.angkatan})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {renderStudentSelection()}
                                        <Button
                                            onClick={() => handleBatchUpdate('tinggal')}
                                            disabled={selectedActionStudents.length === 0 || !kelasLulusTinggalId}
                                        >
                                            Proses Tinggal Kelas
                                        </Button>
                                    </TabsContent>

                                    {/* Kelulusan Tab */}
                                    <TabsContent value="lulus" className="mt-4 space-y-4">
                                        <h2 className="text-xl font-semibold">Posting Kelulusan</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Gunakan fitur ini untuk mengubah status siswa menjadi "Lulus".
                                        </p>

                                        <div>
                                            <Label htmlFor="kelas_lulus">Pilih kelas yang akan diluluskan:</Label>
                                            <select
                                                id="kelas_lulus"
                                                name="kelas_lulus"
                                                value={kelasLulusTinggalId}
                                                onChange={(e) => setKelasLulusTinggalId(e.target.value)}
                                                className="w-full rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="">Pilih kelas</option>
                                                {kelas.map((k) => (
                                                    <option key={k.id} value={k.id}>
                                                        {k.nama_kelas} ({k.angkatan})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {renderStudentSelection()}
                                        <Button
                                            onClick={() => handleBatchUpdate('lulus')}
                                            disabled={selectedActionStudents.length === 0 || !kelasLulusTinggalId}
                                        >
                                            Proses Kelulusan Siswa
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </AppLayout>
    );
}
