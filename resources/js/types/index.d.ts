import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

/** Struktur autentikasi dari Inertia shared props */
export interface Auth {
    user: User;
}

/** Breadcrumb item untuk navigasi halaman */
export interface BreadcrumbItem {
    title: string;
    href: string;
}

/** Struktur navigasi sidebar */
export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

/** Shared props global dari Laravel ke Inertia */
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown; // extensibility
}

/** Struktur data user dari Laravel */
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

/** Struktur data kelas */
export interface Kelas {
    id: number;
    nama_kelas: string;
    angkatan?: string;
    tahun_ajaran?: string;
}

/** Struktur data siswa */
export interface Siswa {
    id: number;
    nis: string;
    nisn?: string;
    nik_siswa?: string;
    nama_lengkap: string;
    jenis_kelamin?: 'Laki-laki' | 'Perempuan';
    tempat_lahir?: string;
    tanggal_lahir?: string;
    alamat?: string;
    no_wa_ortu?: string;
    nama_orang_tua?: string;
    alamat_orang_tua?: string;
    keterangan?: string;
    status: 'Aktif' | 'Lulus' | 'Pindah';
    kelas?: {
        id: number;
        nama_kelas: string;
    };
}

export interface PageProps<T = Record<string, unknown>> extends InertiaPageProps<T> {
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen?: boolean;
}
