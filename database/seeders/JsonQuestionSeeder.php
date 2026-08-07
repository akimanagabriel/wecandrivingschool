<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Option;
use App\Models\Question;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class JsonQuestionSeeder extends Seeder
{
    public function run(): void
    {
        // Path to the JSON file – adjust if needed.
        // We'll look in database/seeders/data/driving_questions.json
        $jsonPath = database_path('seeders/driving_questions.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");
            return;
        }

        $json = File::get($jsonPath);
        $data = json_decode($json, true);

        if (!isset($data['questions']) || !is_array($data['questions'])) {
            $this->command->error('Invalid JSON structure: missing "questions" array.');
            return;
        }

        // Create or find the category
        $category = Category::firstOrCreate(
            ['slug' => 'driving-questions'],
            [
                'name' => 'Ibibazo byo Gutwara Ibinyabiziga',
                'description' => 'All driving questions from the official Rwandan driving test (Kinyarwanda).',
                'icon' => '🚗',
                'is_active' => true,
            ]
        );

        $this->command->info("Importing questions into category: {$category->name}");

        $count = 0;
        $skipped = 0;

        foreach ($data['questions'] as $qData) {
            // Skip if question already exists
            if (Question::where('question_text', $qData['question'])->exists()) {
                $skipped++;
                continue;
            }

            // Create question
            $question = Question::create([
                'category_id' => $category->id,
                'question_text' => $qData['question'],
                'difficulty' => 'medium', // default
                'explanation' => null, // JSON doesn't have explanation
                'is_active' => true,
            ]);

            // Create options
            foreach ($qData['options'] as $optionData) {
                // The option id is like "A", "B", "C", "D"
                $isCorrect = ($optionData['id'] === $qData['correctAnswer']);
                Option::create([
                    'question_id' => $question->id,
                    'option_text' => $optionData['text'],
                    'is_correct' => $isCorrect,
                    'order' => ord($optionData['id']) - 65, // A=0, B=1, etc.
                ]);
            }

            $count++;
        }

        $this->command->info("Imported {$count} new questions. Skipped {$skipped} duplicates.");
    }
}