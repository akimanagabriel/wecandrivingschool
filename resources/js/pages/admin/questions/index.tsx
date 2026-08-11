// resources/js/pages/admin/questions/index.tsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    AdminQuestionRow,
    PaginatedData,
    WeCanPageProps,
} from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Questions', href: '/admin/questions' },
];

type Category = { id: number; name: string };

type Props = WeCanPageProps<{
    questions: PaginatedData<AdminQuestionRow>;
    categories: Category[];
    filters: { search?: string; category_id?: string };
}>;

const diffVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    easy: 'secondary',
    medium: 'outline',
    hard: 'destructive',
};

export default function QuestionsIndex({
    questions,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategory] = useState(filters.category_id ?? '');

    const applyFilter = () =>
        router.get(
            '/admin/questions',
            { search, category_id: categoryId },
            { preserveState: true },
        );

    const destroy = (id: number) => {
        if (confirm('Delete this question? This cannot be undone.')) {
            router.delete(`/admin/questions/${id}`);
        }
    };

    const toggleActive = (id: number, currentStatus: boolean) => {
        router.patch(
            `/admin/questions/${id}/toggle-active`,
            { is_active: !currentStatus },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Question ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
                    );
                },
                onError: () => {
                    toast.error('Failed to update status.');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Questions" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Questions"
                        description={`${questions.total} questions in bank`}
                    />
                    <Link href="/admin/questions/create">
                        <Button size="sm">
                            <Plus className="mr-1.5 h-4 w-4" /> Add Question
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search questions…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilter()
                            }
                        />
                    </div>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <Button variant="outline" onClick={applyFilter}>
                        Filter
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        {[
                                            '#',
                                            'Question',
                                            'Category',
                                            'Difficulty',
                                            'Options',
                                            'Has Images',
                                            'Active',
                                            '',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left font-semibold"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {questions.data.map((q, i) => {
                                        const optionsWithImages =
                                            q.options_with_images_count;

                                        return (
                                            <tr
                                                key={q.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {questions.from + i}
                                                </td>
                                                <td className="max-w-xs px-4 py-3">
                                                    <p className="line-clamp-2 font-medium">
                                                        {q.question_text}
                                                    </p>
                                                    {q.image_url && (
                                                        <div className="mt-1">
                                                            <img
                                                                src={
                                                                    q.image_url
                                                                }
                                                                alt="Question"
                                                                className="h-12 w-auto rounded-lg border border-muted bg-white object-contain"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    (
                                                                        e.target as HTMLImageElement
                                                                    ).style.display =
                                                                        'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {q.category}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            diffVariant[
                                                                q.difficulty
                                                            ] ?? 'outline'
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {q.difficulty}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {q.options_count}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {optionsWithImages > 0 ? (
                                                        <div className="flex items-center gap-1">
                                                            <ImageIcon className="h-4 w-4 text-green-500" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    optionsWithImages
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/50">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {/* ─── Custom Toggle Switch ─── */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleActive(
                                                                q.id,
                                                                q.is_active,
                                                            )
                                                        }
                                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${
                                                            q.is_active
                                                                ? 'bg-primary'
                                                                : 'bg-muted-foreground/30'
                                                        } `}
                                                        role="switch"
                                                        aria-checked={
                                                            q.is_active
                                                        }
                                                        aria-label={`Toggle active status for question ${q.id}`}
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                                q.is_active
                                                                    ? 'translate-x-5'
                                                                    : 'translate-x-0'
                                                            } `}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={`/admin/questions/${q.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                destroy(q.id)
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {questions.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No questions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {questions.links && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    Showing {questions.from}–{questions.to} of{' '}
                                    {questions.total}
                                </p>
                                <div className="flex gap-1">
                                    {questions.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url)
                                            }
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border text-muted-foreground hover:bg-muted disabled:opacity-40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
