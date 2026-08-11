<?php
/**
 * Question Controller
 * 
 * Handles all CRUD operations for questions and options
 * Features:
 * - Full URL generation for all assets
 * - Optimized file upload handling
 * - Individual option image updates without affecting others
 * - Atomic transactions for data integrity
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    /**
     * Display a listing of questions.
     */
    public function index(Request $request): Response
    {
        $questions = Question::with(['category', 'options'])
            ->when($request->search, fn($q) => $q->where('question_text', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn($q) => [
                'id' => $q->id,
                'question_text' => Str::limit($q->question_text, 100),
                'category' => $q->category->name,
                'difficulty' => $q->difficulty,
                'is_active' => $q->is_active,
                'options_count' => $q->options->count(),
                'image_url' => $this->getImageUrl($q->image_path),
                // ─── New: Count of options that have images ───
                'options_with_images_count' => $q->options->filter(fn($o) => !empty($o->image_path))->count(),
                'options' => $q->options->map(fn($o) => [
                    'id' => $o->id,
                    'option_text' => Str::limit($o->option_text, 50),
                    'image_url' => $this->getImageUrl($o->image_path),
                    'is_correct' => $o->is_correct,
                ]),
            ]);

        return Inertia::render('admin/questions/index', [
            'questions' => $questions,
            'categories' => Category::all(['id', 'name']),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Show the form for creating a new question.
     */
    public function create(): Response
    {
        return Inertia::render('admin/questions/form', [
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created question.
     */
    public function store(Request $request): RedirectResponse
    {
        // Increase limits for this request
        $this->increaseUploadLimits();

        $validated = $this->validateQuestion($request);
        $this->ensureOneCorrectAnswer($validated['options']);

        DB::transaction(function () use ($request, $validated) {
            // Handle question audio
            $audioPath = null;
            if ($request->hasFile('explanation_audio')) {
                $audioPath = $this->storeFile($request->file('explanation_audio'), 'audio');
            }

            // Handle question image
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->storeFile($request->file('image'), 'questions/images');
            }

            $question = Question::create([
                'category_id' => $validated['category_id'],
                'question_text' => $validated['question_text'],
                'image_path' => $imagePath,
                'difficulty' => $validated['difficulty'],
                'explanation' => $validated['explanation'] ?? null,
                'explanation_audio_path' => $audioPath,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Create options with images
            foreach ($validated['options'] as $i => $opt) {
                $optionImagePath = null;
                if ($request->hasFile("options.{$i}.image")) {
                    $optionImagePath = $this->storeFile($request->file("options.{$i}.image"), 'option_images');
                }

                $question->options()->create([
                    'option_text' => $opt['option_text'],
                    'image_path' => $optionImagePath,
                    'is_correct' => $opt['is_correct'],
                    'order' => $i,
                ]);
            }
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question created successfully.');
    }

    /**
     * Show the form for editing a question.
     */
    public function edit(Question $question): Response
    {
        $question->load('options');

        return Inertia::render('admin/questions/form', [
            'question' => [
                'id' => $question->id,
                'category_id' => $question->category_id,
                'question_text' => $question->question_text,
                'difficulty' => $question->difficulty,
                'explanation' => $question->explanation,
                'image_path' => $question->image_path,
                'image_url' => $this->getImageUrl($question->image_path),
                'explanation_audio_url' => $this->getImageUrl($question->explanation_audio_path),
                'is_active' => $question->is_active,
                'options' => $question->options->map(fn($o) => [
                    'id' => $o->id,
                    'option_text' => $o->option_text,
                    'image_path' => $o->image_path,
                    'image_url' => $this->getImageUrl($o->image_path),
                    'is_correct' => $o->is_correct,
                    'order' => $o->order,
                ]),
            ],
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    /**
     * Update the specified question.
     * Handles individual option image updates without affecting other options.
     */
    public function update(Request $request, Question $question): RedirectResponse
    {
        // Increase limits for this request
        $this->increaseUploadLimits();

        $validated = $this->validateQuestion($request, true);
        $this->ensureOneCorrectAnswer($validated['options']);

        DB::transaction(function () use ($request, $validated, $question) {
            // ─── Handle Question Audio ──────────────────────────────────────
            $audioPath = $question->explanation_audio_path;
            if ($request->hasFile('explanation_audio')) {
                $this->deleteFile($audioPath);
                $audioPath = $this->storeFile($request->file('explanation_audio'), 'audio');
            } elseif ($request->boolean('remove_audio')) {
                $this->deleteFile($audioPath);
                $audioPath = null;
            }

            // ─── Handle Question Image ──────────────────────────────────────
            $imagePath = $question->image_path;
            if ($request->hasFile('image')) {
                $this->deleteFile($imagePath);
                $imagePath = $this->storeFile($request->file('image'), 'questions/images');
            } elseif ($request->boolean('remove_image')) {
                $this->deleteFile($imagePath);
                $imagePath = null;
            }

            // ─── Update Question ─────────────────────────────────────────────
            $question->update([
                'category_id' => $validated['category_id'],
                'question_text' => $validated['question_text'],
                'image_path' => $imagePath,
                'difficulty' => $validated['difficulty'],
                'explanation' => $validated['explanation'] ?? null,
                'explanation_audio_path' => $audioPath,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // ─── Handle Options with Individual Image Updates ──────────────
            $this->syncOptions($request, $question, $validated['options']);
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question updated successfully.');
    }

    /**
     * Sync options with individual image handling.
     * Each option's image is updated independently without affecting others.
     */
    private function syncOptions(Request $request, Question $question, array $optionsData): void
    {
        // Track existing option IDs
        $existingOptionIds = $question->options->pluck('id')->toArray();
        $processedOptionIds = [];

        foreach ($optionsData as $index => $optionData) {
            $optionId = $optionData['id'] ?? null;
            $optionImagePath = null;

            // ─── Handle Option Image ──────────────────────────────────────
            // Check if a new image is being uploaded for this specific option
            if ($request->hasFile("options.{$index}.image")) {
                // Delete existing image if present
                if ($optionId) {
                    $existingOption = Option::find($optionId);
                    if ($existingOption && $existingOption->image_path) {
                        $this->deleteFile($existingOption->image_path);
                    }
                }
                // Store new image
                $optionImagePath = $this->storeFile($request->file("options.{$index}.image"), 'option_images');
            }
            // Check if image removal is requested for this specific option
            elseif ($request->boolean("options.{$index}.remove_image")) {
                if ($optionId) {
                    $existingOption = Option::find($optionId);
                    if ($existingOption && $existingOption->image_path) {
                        $this->deleteFile($existingOption->image_path);
                    }
                }
                $optionImagePath = null;
            }
            // Keep existing image if no changes
            elseif ($optionId) {
                $existingOption = Option::find($optionId);
                if ($existingOption) {
                    $optionImagePath = $existingOption->image_path;
                }
            }

            // ─── Create or Update Option ──────────────────────────────────
            $option = Option::updateOrCreate(
                ['id' => $optionId],
                [
                    'question_id' => $question->id,
                    'option_text' => $optionData['option_text'],
                    'image_path' => $optionImagePath,
                    'is_correct' => $optionData['is_correct'],
                    'order' => $index,
                ]
            );

            $processedOptionIds[] = $option->id;
        }

        // ─── Delete Removed Options ──────────────────────────────────────
        $toDelete = array_diff($existingOptionIds, $processedOptionIds);
        foreach ($toDelete as $id) {
            $option = Option::find($id);
            if ($option) {
                // Delete associated image
                if ($option->image_path) {
                    $this->deleteFile($option->image_path);
                }
                $option->delete();
            }
        }
    }

    /**
     * Remove the specified question.
     */
    public function destroy(Question $question): RedirectResponse
    {
        // Delete associated images
        $this->deleteFile($question->image_path);
        $this->deleteFile($question->explanation_audio_path);

        foreach ($question->options as $option) {
            $this->deleteFile($option->image_path);
        }

        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }

    /**
     * Validate the question request.
     */
    private function validateQuestion(Request $request, bool $withOptionIds = false): array
    {
        $allowedMimes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/ogg',
            'audio/mp4',
            'audio/x-m4a',
            'audio/webm',
            'video/webm',
        ];

        $rules = [
            'category_id' => 'required|exists:categories,id',
            'question_text' => 'required|string|max:5000',
            'difficulty' => 'required|in:easy,medium,hard',
            'explanation' => 'nullable|string|max:5000',
            'image' => 'nullable|file|image|max:10240', // 10MB
            'remove_image' => 'nullable|boolean',
            'explanation_audio' => [
                'nullable',
                'file',
                'max:20480', // 20MB
                function ($attribute, $value, $fail) use ($allowedMimes) {
                    if ($value === null)
                        return;
                    $mime = strtolower(trim(explode(';', $value->getMimeType() ?? '')[0]));
                    if (!in_array($mime, $allowedMimes, true)) {
                        $fail('The audio explanation must be an audio file (mp3, wav, ogg, m4a, or webm).');
                    }
                },
            ],
            'remove_audio' => 'nullable|boolean',
            'is_active' => 'boolean',
            'options' => 'required|array|min:2|max:6',
            'options.*.option_text' => 'required|string|max:1000',
            'options.*.is_correct' => 'required|boolean',
            'options.*.image' => 'nullable|file|image|max:5120', // 5MB per option
            'options.*.remove_image' => 'nullable|boolean',
        ];

        // Add option ID validation when updating
        if ($withOptionIds) {
            $rules['options.*.id'] = 'nullable|exists:options,id';
        }

        return $request->validate($rules);
    }

    /**
     * Ensure exactly one correct answer exists.
     */
    private function ensureOneCorrectAnswer(array $options): void
    {
        $count = collect($options)->where('is_correct', true)->count();
        abort_if($count !== 1, 422, 'Exactly one correct answer is required.');
    }

    /**
     * Store a file in the public disk.
     */
    private function storeFile($file, string $directory): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');

        if (!$path) {
            throw new \Exception('Failed to upload file. Please try again.');
        }

        return $path;
    }

    /**
     * Delete a file from the public disk.
     */
    private function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Get the full URL for an image path.
     */
    private function getImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // If it's already a full URL
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // Remove 'storage/' prefix if present to avoid duplication
        $cleanPath = str_replace('storage/', '', $path);

        return asset('storage/' . $cleanPath);
    }

    /**
     * Increase PHP upload limits for this request.
     */
    private function increaseUploadLimits(): void
    {
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', '300');
        ini_set('max_input_time', '300');
        ini_set('post_max_size', '100M');
        ini_set('upload_max_filesize', '100M');
    }

    /**
     * Toggle the active status of a question.
     */
    public function toggleActive(Request $request, Question $question): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $question->update(['is_active' => $validated['is_active']]);

        // Optionally, you can return a JSON response if using Inertia with a toast
        return back();
    }
}