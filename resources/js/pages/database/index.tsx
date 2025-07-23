import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { DatabaseBackup, DownloadCloud, RefreshCcw, UploadCloud } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

interface FlashProps {
    success?: string;
    error?: string;
}

interface AuthUser {
    id: number;
    name: string;
    role: string;
}

interface InertiaProps {
    auth: {
        user: AuthUser;
    };
    flash: FlashProps;
    backupFile?: string;
}

export default function DatabasePage() {
    const { flash, backupFile } = usePage<InertiaProps>().props;

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 2000,
                showConfirmButton: false,
            });
        }

        if (flash.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
                timer: 2500,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    const handleBackup = () => {
        Swal.fire({
            title: 'Backup Database?',
            text: 'Yakin ingin melakukan backup database?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Backup',
        }).then((result) => {
            if (result.isConfirmed) {
                router.visit(route('admin.backup'), {
                    method: 'post',
                    preserveScroll: true,
                    preserveState: false,
                });
            }
        });
    };

    const handleRestore = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('sql_file', file);

            Swal.fire({
                title: 'Restore Database?',
                text: 'Yakin ingin melakukan restore dari file ini?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Restore',
            }).then((result) => {
                if (result.isConfirmed) {
                    router.post(route('admin.restore'), formData, {
                        forceFormData: true,
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Restore Selesai',
                                text: 'Database berhasil direstore.',
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                        onError: () => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal',
                                text: 'Terjadi kesalahan saat restore.',
                            });
                        },
                    });
                }
            });
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.sql';

        input.onchange = () => {
            if (input.files && input.files.length > 0) {
                const formData = new FormData();
                formData.append('sql_file', input.files[0]);

                router.post(route('admin.import'), formData, {
                    forceFormData: true,
                });
            }
        };

        input.click();
    };

    const handleReset = () => {
        Swal.fire({
            title: 'Reset Database?',
            text: '⚠️ Semua data akan dihapus! Lanjutkan reset?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Reset',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.reset'));
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Database" />
            <div className="m-10 mb-4">
                <h1 className="text-2xl font-bold">🗂️ Manajemen Database</h1>

                {backupFile && (
                    <div className="mt-4">
                        <p className="mb-2 text-sm text-gray-600">📦 File backup tersedia:</p>
                        <a
                            href={backupFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            ⬇️ Unduh Backup Terbaru
                        </a>
                    </div>
                )}
            </div>

            <Card className="m-10 mt-4">
                <CardHeader>
                    <CardTitle>⚙️ Aksi Database</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button onClick={handleBackup} className="w-full">
                        <DownloadCloud className="mr-2 h-5 w-5" />
                        Backup Database
                    </Button>

                    <Button onClick={handleRestore} variant="outline" className="w-full">
                        <UploadCloud className="mr-2 h-5 w-5" />
                        Restore Database
                    </Button>

                    <Button onClick={handleImport} variant="secondary" className="w-full">
                        <DatabaseBackup className="mr-2 h-5 w-5" />
                        Import Database
                    </Button>

                    <Button onClick={handleReset} variant="destructive" className="w-full">
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        Reset Database
                    </Button>
                </CardContent>
            </Card>

            {/* Hidden File Input for Restore */}
            <input type="file" accept=".sql" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        </AppLayout>
    );
}
