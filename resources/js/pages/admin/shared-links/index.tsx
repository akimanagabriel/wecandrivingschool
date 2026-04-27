/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable curly */
// resources/js/pages/admin/shared-links/index.tsx
import { Head, router } from '@inertiajs/react';
import {
    Link as LinkIcon,
    Copy,
    RefreshCw,
    Trash2,
    Eye,
    Power,
    Plus,
    Search,
    Calendar,
    Users,
    BarChart3,
    ExternalLink,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Shared Links', href: '/admin/shared-links' },
];

interface SharedLink {
    id: number;
    name: string;
    token: string;
    max_uses: number;
    used_count: number;
    remaining_uses: number;
    expires_at: string | null;
    is_active: boolean;
    is_valid: boolean;
    created_by: string | null;
    created_at: string;
    last_used_at: string | null;
    url: string;
}

interface Props {
    links: {
        data: SharedLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function SharedLinksIndex({ links, filters }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [formData, setFormData] = useState({
        name: '',
        max_uses: 10,
        expires_at: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = () => {
        router.get('/admin/shared-links', { search }, { preserveState: true });
    };

    const handleCreate = () => {
        setIsSubmitting(true);
        router.post('/admin/shared-links', formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setFormData({ name: '', max_uses: 10, expires_at: '' });
                toast.success('Access link created successfully');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                toast.error('Failed to create link');
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
            router.delete(`/admin/shared-links/${id}`, {
                onSuccess: () => toast.success('Link deleted successfully'),
            });
        }
    };

    const handleToggleActive = (link: SharedLink) => {
        router.post(
            `/admin/shared-links/${link.id}/toggle-active`,
            {},
            {
                onSuccess: () =>
                    toast.success(
                        `Link ${link.is_active ? 'disabled' : 'enabled'} successfully`,
                    ),
            },
        );
    };

    const handleRegenerateToken = (id: number, name: string) => {
        if (
            confirm(
                `Regenerate token for "${name}"? The old URL will no longer work.`,
            )
        ) {
            router.post(
                `/admin/shared-links/${id}/regenerate-token`,
                {},
                {
                    onSuccess: () =>
                        toast.success('New link generated successfully'),
                },
            );
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Never';

        return new Date(date).toLocaleString();
    };

    const getStatusBadge = (link: SharedLink) => {
        if (!link.is_active) {
            return <Badge variant="destructive">Disabled</Badge>;
        }

        if (!link.is_valid) {
            return (
                <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800"
                >
                    Expired
                </Badge>
            );
        }

        if (link.remaining_uses === 0) {
            return <Badge variant="secondary">Used Up</Badge>;
        }

        return (
            <Badge variant="default" className="bg-green-500">
                Active
            </Badge>
        );
    };

    const getUsageColor = (used: number, max: number) => {
        const percentage = (used / max) * 100;

        if (percentage >= 90) return 'text-red-600';

        if (percentage >= 70) return 'text-yellow-600';

        return 'text-green-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shared Access Links" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Shared Access Links"
                    description="Create and manage time-limited, usage-limited links for students without accounts."
                />

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Links
                            </CardTitle>
                            <LinkIcon className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {links.total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active:{' '}
                                {
                                    links.data.filter(
                                        (l) => l.is_active && l.is_valid,
                                    ).length
                                }
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Uses
                            </CardTitle>
                            <Users className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {links.data.reduce(
                                    (sum, l) => sum + l.used_count,
                                    0,
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all links
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Remaining Uses
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {links.data.reduce(
                                    (sum, l) => sum + l.remaining_uses,
                                    0,
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Available capacity
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Expiring Soon
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    links.data.filter(
                                        (l) =>
                                            l.expires_at &&
                                            new Date(l.expires_at) <=
                                                new Date(
                                                    Date.now() +
                                                        7 * 24 * 60 * 60 * 1000,
                                                ),
                                    ).length
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Within 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or token..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                className="w-64 pl-8"
                            />
                        </div>
                        <Button onClick={handleSearch} variant="secondary">
                            Search
                        </Button>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Link
                    </Button>
                </div>

                {/* Links Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name / Details</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {links.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No shared links found. Create your
                                            first link to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    links.data.map((link) => (
                                        <TableRow key={link.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {link.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Created{' '}
                                                    {new Date(
                                                        link.created_at,
                                                    ).toLocaleDateString()}
                                                    {link.created_by &&
                                                        ` by ${link.created_by}`}
                                                </div>
                                                {link.last_used_at && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Last used:{' '}
                                                        {new Date(
                                                            link.last_used_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="rounded bg-muted px-2 py-1 text-xs">
                                                        {link.token.substring(
                                                            0,
                                                            16,
                                                        )}
                                                        ...
                                                    </code>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            link.url,
                                                                        )
                                                                    }
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Copy link
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`font-medium ${getUsageColor(link.used_count, link.max_uses)}`}
                                                    >
                                                        {link.used_count}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        / {link.max_uses}
                                                    </span>
                                                </div>
                                                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className="h-1.5 rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${(link.used_count / link.max_uses) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {link.remaining_uses}{' '}
                                                    remaining
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {link.expires_at ? (
                                                    <>
                                                        <div className="text-sm">
                                                            {new Date(
                                                                link.expires_at,
                                                            ).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                link.expires_at,
                                                            ) <= new Date()
                                                                ? 'Expired'
                                                                : 'Active'}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        Never
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(link)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        window.open(
                                                                            `/admin/shared-links/${link.id}/stats`,
                                                                            '_blank',
                                                                        )
                                                                    }
                                                                >
                                                                    <BarChart3 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                View statistics
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        window.open(
                                                                            link.url,
                                                                            '_blank',
                                                                        )
                                                                    }
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Open link
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRegenerateToken(
                                                                            link.id,
                                                                            link.name,
                                                                        )
                                                                    }
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Regenerate token
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleToggleActive(
                                                                            link,
                                                                        )
                                                                    }
                                                                >
                                                                    <Power
                                                                        className={`h-4 w-4 ${!link.is_active ? 'text-green-500' : 'text-red-500'}`}
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {link.is_active
                                                                    ? 'Disable'
                                                                    : 'Enable'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            link.id,
                                                                            link.name,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Delete
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {links.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {Math.min(links.per_page, links.total)} of{' '}
                            {links.total} links
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/shared-links', {
                                        page: links.current_page - 1,
                                        search: filters.search,
                                    })
                                }
                                disabled={links.current_page === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex gap-1">
                                {Array.from(
                                    { length: Math.min(5, links.last_page) },
                                    (_, i) => {
                                        let pageNum = links.current_page;

                                        if (links.last_page <= 5) {
                                            pageNum = i + 1;
                                        } else if (links.current_page <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            links.current_page >=
                                            links.last_page - 2
                                        ) {
                                            pageNum = links.last_page - 4 + i;
                                        } else {
                                            pageNum =
                                                links.current_page - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    pageNum ===
                                                    links.current_page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/shared-links',
                                                        {
                                                            page: pageNum,
                                                            search: filters.search,
                                                        },
                                                    )
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    },
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/shared-links', {
                                        page: links.current_page + 1,
                                        search: filters.search,
                                    })
                                }
                                disabled={
                                    links.current_page === links.last_page
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                <Dialog
                    open={showCreateModal}
                    onOpenChange={setShowCreateModal}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Access Link</DialogTitle>
                            <DialogDescription>
                                Generate a shareable link that students can use
                                without logging in.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Link Name (Optional)
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="E.g., School Visit March 2025, Workshop Students"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    A friendly name to help you identify this
                                    link
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_uses">Maximum Uses *</Label>
                                <Input
                                    id="max_uses"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={formData.max_uses}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            max_uses: parseInt(e.target.value),
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Number of times this link can be accessed
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expires_at">
                                    Expiration Date (Optional)
                                </Label>
                                <Input
                                    id="expires_at"
                                    type="datetime-local"
                                    value={formData.expires_at}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expires_at: e.target.value,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for no expiration
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Link'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
