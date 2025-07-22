    // import { NavFooter } from '@/components/nav-footer';
    import { NavMain } from '@/components/nav-main';
    import { NavUser } from '@/components/nav-user';
    import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
    import { SharedData, type NavItem } from '@/types';
    import { Link, usePage } from '@inertiajs/react';
    import { ChartLine, CreditCard, HandCoins, LayoutGrid, School, Users } from 'lucide-react';
    import AppLogo from './app-logo';



    // const footerNavItems: NavItem[] = [
    //     {
    //         title: 'Repository',
    //         href: 'https://github.com/laravel/react-starter-kit',
    //         icon: Folder,
    //     },
    //     {
    //         title: 'Documentation',
    //         href: 'https://laravel.com/docs/starter-kits#react',
    //         icon: BookOpen,
    //     },
    // ];

    export function AppSidebar() {
        const {auth} = usePage<SharedData>().props;
        const role = auth.user?.role;

        const mainNavItems: NavItem[] =
        role === 'admin'
            ? [
                {
                    title: 'Dashboard',
                    href: '/admin/dashboard-admin',
                    icon: LayoutGrid,
                },
                {
                    title: 'Data Siswa',
                    icon: Users,
                    children: [
                        {
                            title: 'Daftar Siswa',
                            href: '/admin/siswa',
                            icon: Users,
                        },
                        {
                            title: 'Data Kelas',
                            href: '/admin/kelas',
                            icon: School,
                        },
                    ],
                },
                {
                    title: 'Pembayaran',
                    href: '/admin/pembayaran',
                    icon: CreditCard,
                },
                {
                    title: 'Buku Kas',
                    href: '/admin/buku-kas',
                    icon: HandCoins,
                },
                {
                    title: 'Laporan',
                    href: '/admin/laporan',
                    icon: ChartLine,
                },
                {
                    title: 'Profil',
                    href: '/admin/profil',
                    icon: School,
                },
            ]
            : role === 'staff'
            ? [
                {
                    title: 'Dashboard',
                    href: '/admin/dashboard-admin',
                    icon: LayoutGrid,
                },
                {
                    title: 'Pembayaran',
                    href: '/admin/pembayaran',
                    icon: CreditCard,
                },
            ]
            : [];


        return (
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />
                </SidebarContent>

                <SidebarFooter>
                    {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
        );
    }
