import { Link, router } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CreditCard,
    HelpCircle,
    LayoutGrid,
    Link2Icon,
    Tag,
    Users,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useWeCanAuth } from '@/hooks/use-wecan-auth';
import type { NavItem } from '@/types';

const studentNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
    { title: 'Access / Pay', href: '/student/payment', icon: CreditCard },
];

const adminNavItems: NavItem[] = [
    { title: 'Overview', href: '/admin', icon: BarChart3 },
    { title: 'Questions', href: '/admin/questions', icon: HelpCircle },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Payments', href: '/admin/payments', icon: CreditCard },
    { title: 'Pricing Plans', href: '/admin/pricing-plans', icon: Tag },
    { title: 'Links', href: '/admin/shared-links', icon: Link2Icon },
];

export function AppSidebar() {
    const { isAdmin } = useWeCanAuth();

    const mainNavItems = isAdmin ? adminNavItems : studentNavItems;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="h-40" size="lg" asChild>
                            <Link
                                href={isAdmin ? '/admin' : '/student/dashboard'}
                                prefetch
                                className="flex"
                            >
                                <img
                                    className="rounded-2xl object-cover"
                                    src="/app-logo.jpeg"
                                />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Take Quiz shortcut for students */}
                {!isAdmin && (
                    <div className="px-3 pt-3">
                        <button
                            onClick={() => router.post('/quiz/start')}
                            className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <BookOpen className="h-4 w-4 shrink-0" />
                            Start New Quiz
                        </button>
                    </div>
                )}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
