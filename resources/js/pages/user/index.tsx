import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    users: User[];
}

export default function UserPage({ users }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'staff',
    });

    const resetForm = () => {
        setForm({ name: '', username: '', email: '', password: '', role: 'staff' });
        setEditMode(false);
        setSelectedId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode && selectedId) {
            router.put(`/admin/user/${selectedId}`, form, {
                onSuccess: () => {
                    setOpen(false);
                    resetForm();
                },
            });
        } else {
            router.post('/admin/user', form, {
                onSuccess: () => {
                    setOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleEdit = (user: User) => {
        setEditMode(true);
        setSelectedId(user.id);
        setForm({ ...user, password: '' });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus user ini?')) {
            router.delete(`/admin/user/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen User" />

            <div className="m-10 mb-0 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manajemen User</h1>
                <Dialog
                    open={open}
                    onOpenChange={(o) => {
                        setOpen(o);
                        if (!o) resetForm();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editMode ? 'Edit User' : 'Tambah User'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
                            <div>
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" value={form.username} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="password">Password {editMode && '(Kosongkan jika tidak diubah)'}</Label>
                                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <select id="role" name="role" value={form.role} onChange={handleChange} className="w-full rounded border px-2 py-1">
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="submit">{editMode ? 'Simpan Perubahan' : 'Tambah User'}</Button>
                                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="m-10 mt-5">
                <CardHeader>
                    <CardTitle>Daftar User</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-blue-400">
                            <TableRow>
                                <TableHead className="text-center">No</TableHead>
                                <TableHead className="text-center">Nama</TableHead>
                                <TableHead className="text-center">Username</TableHead>
                                <TableHead className="text-center">Email</TableHead>
                                <TableHead className="text-center">Role</TableHead>
                                <TableHead className="text-center">Dibuat</TableHead>
                                <TableHead className="text-center">Diperbarui</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, i) => (
                                <TableRow key={user.id} className="odd:bg-gray-100">
                                    <TableCell className="text-center">{i + 1}</TableCell>
                                    <TableCell className="text-center">{user.name}</TableCell>
                                    <TableCell className="text-center">{user.username}</TableCell>
                                    <TableCell className="text-center">{user.email}</TableCell>
                                    <TableCell className="text-center capitalize">{user.role}</TableCell>
                                    <TableCell className="text-center">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {new Date(user.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
