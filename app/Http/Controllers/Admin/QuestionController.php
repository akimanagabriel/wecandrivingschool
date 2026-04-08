<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $questions = Question::with(['category', 'options'])
            ->when($request->search, fn ($q) => $q->where('question_text', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($q) => [
                'id'            => $q->id,
                'question_text' => $q->question_text,
                'category'      => $q->category->name,
                'difficulty'    => $q->difficulty,
                'is_active'     => $q->is_active,
                'options_count' => $q->options->count(),
            ]);

        return Inertia::render('admin/questions/index', [
            'questions'  => $questions,
            'categories' => Category::all(['id', 'name']),
            'filters'    => $request->only(['search', 'category_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/questions/form', [
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateQuestion($request);
        $this->ensureOneCorrectAnswer($validated['options']);

        DB::transaction(function () use ($request, $validated) {
            $audioPath = null;
            if ($request->hasFile('explanation_audio')) {
                $audioPath = $request->file('explanation_audio')->store('audio', 'public');
            }

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('questions/images', 'public');
            }

            $question = Question::create([
                'category_id'            => $validated['category_id'],
                'question_text'          => $validated['question_text'],
                'image_path'             => $imagePath,
                'difficulty'             => $validated['difficulty'],
                'explanation'            => $validated['explanation'] ?? null,
                'explanation_audio_path' => $audioPath,
                'is_active'              => $validated['is_active'] ?? true,
            ]);
            foreach ($validated['options'] as $i => $opt) {
                $question->options()->create([
                    'option_text' => $opt['option_text'],
                    'is_correct'  => $opt['is_correct'],
                    'order'       => $i,
                ]);
            }
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question created.');
    }

    public function edit(Question $question): Response
    {
        return Inertia::render('admin/questions/form', [
            'question'   => $question->load('options'),
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    public function update(Request $request, Question $question): RedirectResponse
    {
        $validated = $this->validateQuestion($request, true);
        $this->ensureOneCorrectAnswer($validated['options']);

        DB::transaction(function () use ($request, $validated, $question) {
            $audioPath = $question->explanation_audio_path;

            if ($request->hasFile('explanation_audio')) {
                // Delete old file if it exists
                if ($audioPath) {
                    Storage::disk('public')->delete($audioPath);
                }
                $audioPath = $request->file('explanation_audio')->store('audio', 'public');
            } elseif ($request->boolean('remove_audio')) {
                if ($audioPath) {
                    Storage::disk('public')->delete($audioPath);
                }
                $audioPath = null;
            }

            $imagePath = $question->image_path;

            if ($request->hasFile('image')) {
                if ($imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = $request->file('image')->store('questions/images', 'public');
            } elseif ($request->boolean('remove_image')) {
                if ($imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = null;
            }

            $question->update([
                'category_id'            => $validated['category_id'],
                'question_text'          => $validated['question_text'],
                'image_path'             => $imagePath,
                'difficulty'             => $validated['difficulty'],
                'explanation'            => $validated['explanation'] ?? null,
                'explanation_audio_path' => $audioPath,
                'is_active'              => $validated['is_active'] ?? true,
            ]);
            $question->options()->delete();
            foreach ($validated['options'] as $i => $opt) {
                $question->options()->create([
                    'option_text' => $opt['option_text'],
                    'is_correct'  => $opt['is_correct'],
                    'order'       => $i,
                ]);
            }
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question updated.');
    }

    public function destroy(Question $question): RedirectResponse
    {
        $question->delete();

        return back()->with('success', 'Question deleted.');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function validateQuestion(Request $request, bool $withOptionIds = false): array
    {
        // Allowed server-detected MIME types.
        // NOTE: finfo always reports webm containers as video/webm (even audio-only),
        // so we must include video/webm to accept browser MediaRecorder recordings.
        $allowedMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
            'audio/ogg',  'audio/mp4', 'audio/x-m4a',
            'audio/webm', 'video/webm', // webm recorded in-browser
        ];

        return $request->validate([
            'category_id'           => 'required|exists:categories,id',
            'question_text'         => 'required|string',
            'difficulty'            => 'required|in:easy,medium,hard',
            'explanation'           => 'nullable|string',
            'image'                 => 'nullable|file|image|max:5120',
            'remove_image'          => 'nullable|boolean',
            'explanation_audio'     => [
                'nullable',
                'file',
                'max:20480',
                function ($attribute, $value, $fail) use ($allowedMimes) {
                    if ($value === null) return;
                    $mime = strtolower(trim(explode(';', $value->getMimeType() ?? '')[0]));
                    if (! in_array($mime, $allowedMimes, true)) {
                        $fail('The audio explanation must be an audio file (mp3, wav, ogg, m4a, or webm).');
                    }
                },
            ],
            'remove_audio'          => 'nullable|boolean',
            'is_active'             => 'boolean',
            'options'               => 'required|array|min:2|max:6',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct'  => 'required|boolean',
        ]);
    }

    private function ensureOneCorrectAnswer(array $options): void
    {
        $count = collect($options)->where('is_correct', true)->count();
        abort_if($count !== 1, 422, 'Exactly one correct answer required.');
    }
}
