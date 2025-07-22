import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Kelas',
        href: '/admin/kelas',
    },
];

interface Kelas {
    id: number;
    nama_kelas: string;
    angkatan: string;
    tahun_ajaran: string;
}

interface PageProps {
    kelas: Kelas[];
}

export default function KelasPage({ kelas }: PageProps) {
    const [data, setData] = useState({
        nama_kelas: '',
        angkatan: '',
        tahun_ajaran: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    const resetForm = () => {
        setData({ nama_kelas: '', angkatan: '', tahun_ajaran: '' });
        setEditMode(false);
        setSelectedId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode && selectedId) {
            router.put(`/admin/kelas/${selectedId}`, data, {
                onSuccess: () => {
                    resetForm();
                    setOpen(false);
                },
            });
        } else {
            router.post('/admin/kelas', data, {
                onSuccess: () => {
                    resetForm();
                    setOpen(false);
                },
            });
        }
    };

    const handleEdit = (item: Kelas) => {
        setData({
            nama_kelas: item.nama_kelas,
            angkatan: item.angkatan,
            tahun_ajaran: item.tahun_ajaran,
        });
        setSelectedId(item.id);
        setEditMode(true);
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data kelas ini?')) {
            router.delete(`/admin/kelas/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kelas" />

            <div className="m-10 mb-0 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
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
                            Tambah Kelas
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editMode ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
                            <div>
                                <Label htmlFor="nama_kelas">Nama Kelas</Label>
                                <Input id="nama_kelas" name="nama_kelas" value={data.nama_kelas} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="angkatan">Angkatan</Label>
                                <Input id="angkatan" name="angkatan" value={data.angkatan} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
                                <Input id="tahun_ajaran" name="tahun_ajaran" value={data.tahun_ajaran} onChange={handleChange} required />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="submit">{editMode ? 'Simpan Perubahan' : 'Tambah Kelas'}</Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="m-10 mt-5">
                <CardHeader>
                    <CardTitle>Daftar Kelas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table className="w-full table-auto border-collapse">
                        <TableHeader className="bg-blue-400">
                            <TableRow>
                                <TableHead className="border border-gray-500 text-center">No</TableHead>
                                <TableHead className="border border-gray-500 text-center">Nama Kelas</TableHead>
                                <TableHead className="border border-gray-500 text-center">Angkatan</TableHead>
                                <TableHead className="border border-gray-500 text-center">Tahun Ajaran</TableHead>
                                <TableHead className="border border-gray-500 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kelas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="border border-gray-300 py-4 text-center">
                                        Tidak ada data kelas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                kelas.map((item, index) => (
                                    <TableRow key={item.id} className="odd:bg-gray-200" >
                                        <TableCell className="border border-gray-300 text-center">{index + 1}</TableCell>
                                        <TableCell className="border border-gray-300 text-center">{item.nama_kelas}</TableCell>
                                        <TableCell className="border border-gray-300 text-center">{item.angkatan}</TableCell>
                                        <TableCell className="border border-gray-300 text-center">{item.tahun_ajaran}</TableCell>
                                        <TableCell className="border border-gray-300 text-center">
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
