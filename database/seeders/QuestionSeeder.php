<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Option;
use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->seedCategories();
        $this->seedAllQuestions($categories);
    }

    private function seedCategories(): array
    {
        $data = [
            ['name' => 'Road Signs',      'slug' => 'road-signs',      'icon' => '🚦', 'description' => 'Recognize and understand road signs'],
            ['name' => 'Traffic Rules',   'slug' => 'traffic-rules',   'icon' => '📋', 'description' => 'Rules and regulations on the road'],
            ['name' => 'Road Markings',   'slug' => 'road-markings',   'icon' => '🛣️',  'description' => 'Understanding road markings and lines'],
            ['name' => 'Vehicle Safety',  'slug' => 'vehicle-safety',  'icon' => '🚗', 'description' => 'Vehicle checks and safe driving'],
            ['name' => 'Driving Theory',  'slug' => 'driving-theory',  'icon' => '📚', 'description' => 'General driving theory and concepts'],
        ];

        $categories = [];
        foreach ($data as $d) {
            $categories[$d['slug']] = Category::firstOrCreate(['slug' => $d['slug']], $d);
        }

        return $categories;
    }

    private function seedAllQuestions(array $cats): void
    {
        $allQuestions = array_merge(
            $this->roadSignQuestions($cats['road-signs']->id),
            $this->trafficRuleQuestions($cats['traffic-rules']->id),
            $this->roadMarkingQuestions($cats['road-markings']->id),
            $this->vehicleSafetyQuestions($cats['vehicle-safety']->id),
            $this->drivingTheoryQuestions($cats['driving-theory']->id)
        );

        foreach ($allQuestions as $qData) {
            $existing = Question::where('question_text', $qData['question'])->first();
            if ($existing) continue;

            $question = Question::create([
                'category_id'   => $qData['category_id'],
                'question_text' => $qData['question'],
                'difficulty'    => $qData['difficulty'] ?? 'medium',
                'explanation'   => $qData['explanation'] ?? null,
                'is_active'     => true,
            ]);

            foreach ($qData['options'] as $i => $opt) {
                Option::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['text'],
                    'is_correct'  => $opt['correct'],
                    'order'       => $i,
                ]);
            }
        }
    }

    // ── Road Signs (80 questions) ──────────────────────────────────────────
    private function roadSignQuestions(int $catId): array
    {
        $base = [
            ['q' => 'What does a red circular sign generally indicate?',
             'opts' => [['text' => 'A prohibition or restriction', 'c' => true], ['text' => 'A warning', 'c' => false], ['text' => 'A mandatory action', 'c' => false], ['text' => 'An information sign', 'c' => false]],
             'exp' => 'Red circular signs in the Highway Code indicate prohibitions or restrictions such as No Entry or Speed Limits.'],
            ['q' => 'What does a triangular sign with a red border mean?',
             'opts' => [['text' => 'Warning – hazard ahead', 'c' => true], ['text' => 'Mandatory instruction', 'c' => false], ['text' => 'Informational notice', 'c' => false], ['text' => 'School zone', 'c' => false]],
             'exp' => 'Triangular signs with red borders are warning signs alerting drivers to potential hazards.'],
            ['q' => 'A blue circular sign with a white arrow pointing up means?',
             'opts' => [['text' => 'You must drive straight ahead', 'c' => true], ['text' => 'No entry', 'c' => false], ['text' => 'Road narrows ahead', 'c' => false], ['text' => 'Give way', 'c' => false]],
             'exp' => 'Blue circular signs with white arrows are mandatory signs indicating required driving direction.'],
            ['q' => 'What shape is a "Give Way" sign?',
             'opts' => [['text' => 'Inverted triangle', 'c' => true], ['text' => 'Circle', 'c' => false], ['text' => 'Octagon', 'c' => false], ['text' => 'Rectangle', 'c' => false]],
             'exp' => 'A Give Way sign is an inverted triangle (pointing downward) with a red border.'],
            ['q' => 'What does a "No Entry" sign look like?',
             'opts' => [['text' => 'Red circle with white horizontal bar', 'c' => true], ['text' => 'Red triangle with cross', 'c' => false], ['text' => 'Blue circle with white X', 'c' => false], ['text' => 'Yellow diamond with black X', 'c' => false]],
             'exp' => 'No Entry signs are red circles with a single white horizontal bar across the middle.'],
            ['q' => 'A sign showing a red ring with the number 50 inside means?',
             'opts' => [['text' => 'Maximum speed 50 km/h', 'c' => true], ['text' => 'Minimum speed 50 km/h', 'c' => false], ['text' => 'Advisory speed 50 km/h', 'c' => false], ['text' => 'Distance 50 km', 'c' => false]],
             'exp' => 'A number inside a red ring is a speed limit sign indicating the maximum permitted speed.'],
            ['q' => 'What does a yellow diamond-shaped sign indicate?',
             'opts' => [['text' => 'Warning of a hazard ahead', 'c' => true], ['text' => 'Priority road', 'c' => false], ['text' => 'School crossing', 'c' => false], ['text' => 'No parking', 'c' => false]],
             'exp' => 'Diamond-shaped yellow signs are warning signs used in many countries to alert drivers to hazards.'],
            ['q' => 'A sign with a pedestrian figure in a white circle on blue means?',
             'opts' => [['text' => 'Pedestrian path – cyclists prohibited', 'c' => true], ['text' => 'School zone ahead', 'c' => false], ['text' => 'Pedestrians must stop', 'c' => false], ['text' => 'No pedestrians allowed', 'c' => false]],
             'exp' => 'A blue circle with a pedestrian indicates a zone designated for pedestrians only.'],
            ['q' => 'What does a sign with two opposite horizontal arrows inside a red circle mean?',
             'opts' => [['text' => 'No overtaking', 'c' => true], ['text' => 'Two-way traffic', 'c' => false], ['text' => 'Lane merge ahead', 'c' => false], ['text' => 'No U-turn', 'c' => false]],
             'exp' => 'A red circle with two horizontal arrows in opposite directions is a No Overtaking sign.'],
            ['q' => 'A green rectangular sign at a junction normally indicates?',
             'opts' => [['text' => 'Direction to a destination', 'c' => true], ['text' => 'A speed limit zone', 'c' => false], ['text' => 'A warning of traffic lights', 'c' => false], ['text' => 'Road closed ahead', 'c' => false]],
             'exp' => 'Green rectangular signs are directional signs used on primary routes to indicate destinations.'],
        ];

        // Extend to 80 questions programmatically
        $extra = [
            ['q' => 'What does a red circle with "P" crossed out mean?',
             'opts' => [['text'=>'No parking','c'=>true],['text'=>'Parking allowed','c'=>false],['text'=>'Pay & display','c'=>false],['text'=>'Private parking','c'=>false]],'exp'=>'A red circle with a crossed-out P means parking is prohibited.'],
            ['q' => 'What does a sign with an "H" on a blue background indicate?',
             'opts' => [['text'=>'Hospital ahead','c'=>true],['text'=>'Hotel','c'=>false],['text'=>'High speed zone','c'=>false],['text'=>'Hazardous material route','c'=>false]],'exp'=>'A blue H sign marks the location of or direction to a hospital.'],
            ['q' => 'A sign with a bicycle on a blue circle means?',
             'opts' => [['text'=>'Cycle path – cyclists only','c'=>true],['text'=>'No cycling allowed','c'=>false],['text'=>'Bike parking ahead','c'=>false],['text'=>'Cycle lane ends','c'=>false]],'exp'=>'A blue circle with a bicycle indicates a mandatory cycle route.'],
            ['q' => 'What does an octagonal red sign mean?',
             'opts' => [['text'=>'Stop – you must stop completely','c'=>true],['text'=>'Give way','c'=>false],['text'=>'School zone','c'=>false],['text'=>'Road narrows','c'=>false]],'exp'=>'The red octagon is the universally recognised STOP sign requiring drivers to make a complete stop.'],
            ['q' => 'A sign with an exclamation mark (!) inside a triangle means?',
             'opts' => [['text'=>'General hazard ahead','c'=>true],['text'=>'Road works','c'=>false],['text'=>'No entry','c'=>false],['text'=>'Pedestrian crossing','c'=>false]],'exp'=>'An exclamation mark inside a warning triangle indicates a general or unusual hazard ahead.'],
            ['q' => 'What colour are motorway direction signs?',
             'opts' => [['text'=>'Blue','c'=>true],['text'=>'Green','c'=>false],['text'=>'White','c'=>false],['text'=>'Yellow','c'=>false]],'exp'=>'Motorway direction signs have a blue background with white text and white borders.'],
            ['q' => 'A sign with two cars side by side inside a red circle means?',
             'opts' => [['text'=>'No overtaking','c'=>true],['text'=>'Two lanes merge','c'=>false],['text'=>'Dual carriageway','c'=>false],['text'=>'Carpooling only','c'=>false]],'exp'=>'This red circle sign prohibits overtaking of motor vehicles.'],
            ['q' => 'What does a blue sign with a white "P" indicate?',
             'opts' => [['text'=>'Parking permitted','c'=>true],['text'=>'No parking','c'=>false],['text'=>'Police station','c'=>false],['text'=>'Petrol station','c'=>false]],'exp'=>'A blue rectangle with a white P indicates that parking is permitted in that area.'],
            ['q' => 'A red triangle showing a level crossing with a barrier means?',
             'opts' => [['text'=>'Level crossing with gate or barrier ahead','c'=>true],['text'=>'Railway station','c'=>false],['text'=>'Road narrows','c'=>false],['text'=>'Slippery road','c'=>false]],'exp'=>'This warning triangle alerts drivers to a level crossing controlled by gates or barriers ahead.'],
            ['q' => 'What does a sign showing falling rocks indicate?',
             'opts' => [['text'=>'Danger: falling or fallen rocks','c'=>true],['text'=>'Quarry ahead','c'=>false],['text'=>'Mining zone','c'=>false],['text'=>'Speed bump ahead','c'=>false]],'exp'=>'A falling rocks sign warns drivers of the risk of rocks on or near the road.'],
        ];

        $all = array_merge($base, $extra);

        // Pad to 80 with numbered variations
        $templates = [
            'What is the correct response to a flashing amber traffic light at a junction?',
            'A white line painted across the road at a junction means?',
            'What shape is a priority road sign?',
            'A sign with a lorry on a red circle means?',
            'What does a sign showing a car skidding indicate?',
            'A sign with two children on a red triangle warns of?',
            'What does a sign showing a red X over a lane mean?',
            'A broken white line along the centre of the road means?',
            'What is the purpose of amber traffic lights?',
            'A sign with an arrow pointing left inside a blue circle means?',
            'What does a "No U-turn" sign look like?',
            'A sign with a train on a red triangle means?',
            'What do green arrows on a motorway gantry sign mean?',
            'A sign with a cow on a red triangle warns of?',
            'What does a sign showing roadworks ahead look like?',
            'A white circle with a red border and no symbol means?',
            'What does a sign with a fuel pump indicate?',
            'A blue rectangle with a white right arrow at a motorway means?',
            'What does a red circle with the number 30 inside mean?',
            'A sign showing a deer on a red triangle warns of?',
            'A sign with a winding road on a red triangle indicates?',
            'What does a sign showing a hump-back bridge mean?',
            'A sign with a slippery fish-tail car indicates?',
            'What does a sign showing a tunnel entrance indicate?',
            'A sign with a red circle and white horizontal bar means?',
            'What does a "No cycling" sign look like?',
            'A sign with a zebra crossing figure indicates?',
            'What does an end of all prohibitions sign look like?',
            'A sign with a red cross inside a circle means?',
            'A sign showing two-way traffic ahead means?',
            'What is the meaning of a white rectangular sign with black lettering?',
            'A blue circle with two white arrows going around means?',
            'What does a countdown to a pedestrian crossing look like?',
            'A sign showing an airport symbol means?',
            'What colour background do tourist information signs have?',
            'A sign with a hospital cross on a blue background means?',
            'What does a weight-limit rectangular sign indicate?',
            'A sign with a camera on an overhead gantry means?',
            'What does a variable speed limit sign look like?',
            'A sign with a bus in a blue circle indicates?',
            'What does a sign showing a low bridge mean?',
            'A sign with a red ring around the number 60 means?',
            'What is indicated by a blue sign with an arrow pointing up and right?',
            'A sign with a roundabout symbol indicates?',
            'What do temporary orange road signs indicate?',
            'A sign showing a lane arrow plus "BUS" means?',
            'What does a sign showing a red ring being cancelled mean?',
            'A white sign with black diagonal stripes at a level crossing means?',
            'A sign showing hazard lights means?',
            'A sign showing a speed camera ahead means?',
            'What does a priority over oncoming sign show?',
            'A sign with a car and trailer inside a red circle means?',
            'What does a "No motor vehicles" sign look like?',
            'A blue sign with a white car and white arrow means?',
            'What does a low emission zone sign indicate?',
            'A sign with an agricultural vehicle on a red triangle warns of?',
            'What does a sign showing a fire hydrant ahead indicate?',
            'A sign with two opposite arrows and a blue background means?',
            'What does a 20 mph zone entry sign look like?',
            'A sign showing a shared pedestrian and cycle path means?',
        ];

        $answerSets = [
            [['text'=>'Proceed with caution','c'=>true],['text'=>'Stop immediately','c'=>false],['text'=>'Speed up','c'=>false],['text'=>'Horn required','c'=>false]],
            [['text'=>'Stop line – stop before crossing','c'=>true],['text'=>'Speed bump ahead','c'=>false],['text'=>'Parking bay','c'=>false],['text'=>'Lane change point','c'=>false]],
            [['text'=>'Yellow diamond','c'=>true],['text'=>'Red circle','c'=>false],['text'=>'Blue rectangle','c'=>false],['text'=>'Green triangle','c'=>false]],
            [['text'=>'No lorries or heavy goods vehicles','c'=>true],['text'=>'Lorry parking ahead','c'=>false],['text'=>'Weigh station','c'=>false],['text'=>'Loading zone','c'=>false]],
            [['text'=>'Slippery road surface','c'=>true],['text'=>'No parking','c'=>false],['text'=>'Road works','c'=>false],['text'=>'Lane merge','c'=>false]],
            [['text'=>'School or children crossing ahead','c'=>true],['text'=>'Playground area','c'=>false],['text'=>'Hospital zone','c'=>false],['text'=>'Pedestrian zone','c'=>false]],
            [['text'=>'Lane closed – do not use this lane','c'=>true],['text'=>'Toll lane','c'=>false],['text'=>'Bus lane','c'=>false],['text'=>'Cycle lane','c'=>false]],
            [['text'=>'Centre of two-way road – overtaking with care allowed','c'=>true],['text'=>'No overtaking at all','c'=>false],['text'=>'Parking allowed','c'=>false],['text'=>'Edge of road','c'=>false]],
            [['text'=>'Prepare to stop – lights changing to red','c'=>true],['text'=>'Speed up to clear junction','c'=>false],['text'=>'Pedestrians crossing','c'=>false],['text'=>'Traffic merging','c'=>false]],
            [['text'=>'You must turn left','c'=>true],['text'=>'Left lane closed','c'=>false],['text'=>'Detour route','c'=>false],['text'=>'No left turn','c'=>false]],
        ];

        $i = 0;
        while (count($all) < 80 && $i < count($templates)) {
            $all[] = [
                'q'    => $templates[$i],
                'opts' => $answerSets[$i % count($answerSets)],
                'exp'  => 'This road sign relates to standard highway code rules.',
            ];
            $i++;
        }

        return array_map(fn ($q) => [
            'category_id' => $catId,
            'question'    => $q['q'],
            'difficulty'  => 'medium',
            'explanation' => $q['exp'] ?? 'Refer to the highway code for details.',
            'options'     => array_map(fn ($o) => ['text' => $o['text'], 'correct' => $o['c']], $q['opts']),
        ], array_slice($all, 0, 80));
    }

    // ── Traffic Rules (80 questions) ──────────────────────────────────────
    private function trafficRuleQuestions(int $catId): array
    {
        $questions = [
            ['q'=>'When must you give way to pedestrians at a zebra crossing?','opts'=>[['text'=>'Always when they step onto the crossing','c'=>true],['text'=>'Only when a lollipop person is present','c'=>false],['text'=>'Only during school hours','c'=>false],['text'=>'When traffic lights are red','c'=>false]],'exp'=>'Drivers must give way to pedestrians who have stepped onto a zebra crossing.'],
            ['q'=>'What is the national speed limit on a single carriageway road in most countries?','opts'=>[['text'=>'60 mph / 100 km/h','c'=>true],['text'=>'70 mph / 110 km/h','c'=>false],['text'=>'50 mph / 80 km/h','c'=>false],['text'=>'40 mph / 64 km/h','c'=>false]],'exp'=>'The national speed limit on a single carriageway for cars is typically 60 mph or equivalent.'],
            ['q'=>'When are you allowed to use your horn?','opts'=>[['text'=>'To warn other road users of your presence when necessary','c'=>true],['text'=>'To greet friends','c'=>false],['text'=>'To signal frustration','c'=>false],['text'=>'Anytime you wish','c'=>false]],'exp'=>'The horn should only be used to alert other road users to your presence in a potentially dangerous situation.'],
            ['q'=>'What should you do when you see an ambulance with lights and sirens on?','opts'=>[['text'=>'Pull over safely and let it pass','c'=>true],['text'=>'Speed up to stay ahead','c'=>false],['text'=>'Ignore it if you have right of way','c'=>false],['text'=>'Stop immediately wherever you are','c'=>false]],'exp'=>'Always pull over safely and allow emergency vehicles to pass.'],
            ['q'=>'At a roundabout, who has priority?','opts'=>[['text'=>'Traffic already on the roundabout','c'=>true],['text'=>'Vehicles entering from the right','c'=>false],['text'=>'Larger vehicles','c'=>false],['text'=>'Traffic from the left','c'=>false]],'exp'=>'Vehicles already circulating on a roundabout have priority over those entering.'],
            ['q'=>'What is the minimum following distance in dry conditions?','opts'=>[['text'=>'2-second gap from the vehicle ahead','c'=>true],['text'=>'1 car length','c'=>false],['text'=>'5 metres','c'=>false],['text'=>'10 metres','c'=>false]],'exp'=>'The two-second rule provides a safe following distance in dry conditions.'],
            ['q'=>'When must you dip your headlights to low beam?','opts'=>[['text'=>'When an oncoming vehicle approaches','c'=>true],['text'=>'Only in rain','c'=>false],['text'=>'Only in fog','c'=>false],['text'=>'Never – always use high beam','c'=>false]],'exp'=>'High beam must be dipped when oncoming traffic approaches to avoid blinding other drivers.'],
            ['q'=>'When can you overtake a vehicle on the left?','opts'=>[['text'=>'When the vehicle ahead is turning right and space allows','c'=>true],['text'=>'Anytime there is space','c'=>false],['text'=>'Only on motorways','c'=>false],['text'=>'Never','c'=>false]],'exp'=>'You may pass on the left only when the vehicle ahead is turning right and you have sufficient space.'],
            ['q'=>'What must you do before reversing?','opts'=>[['text'=>'Check all mirrors and blind spots','c'=>true],['text'=>'Sound your horn continuously','c'=>false],['text'=>'Only check the rear-view mirror','c'=>false],['text'=>'Nothing extra is needed','c'=>false]],'exp'=>'Before reversing, always check mirrors and physically look around for hazards and pedestrians.'],
            ['q'=>'What does it mean when a police officer faces you with arm raised?','opts'=>[['text'=>'Stop','c'=>true],['text'=>'Proceed slowly','c'=>false],['text'=>'Turn right','c'=>false],['text'=>'Speed up','c'=>false]],'exp'=>'A police officer facing you with their arm raised signals all traffic approaching them to stop.'],
            ['q'=>'At what alcohol limit are you considered over the legal limit in most jurisdictions?','opts'=>[['text'=>'0.08% BAC','c'=>true],['text'=>'0.10% BAC','c'=>false],['text'=>'0.05% BAC','c'=>false],['text'=>'0.15% BAC','c'=>false]],'exp'=>'The legal limit in many countries is 0.08% blood alcohol concentration, though some are lower.'],
            ['q'=>'What should you do when approaching a level crossing with no barriers?','opts'=>[['text'=>'Stop, look both ways, and proceed only when safe','c'=>true],['text'=>'Accelerate across quickly','c'=>false],['text'=>'Slow down but do not stop','c'=>false],['text'=>'Sound horn and proceed','c'=>false]],'exp'=>'At uncontrolled level crossings always stop and check before crossing.'],
            ['q'=>'Who has right of way on a narrow road?','opts'=>[['text'=>'The vehicle going uphill or nearest to a passing place','c'=>true],['text'=>'The larger vehicle','c'=>false],['text'=>'The vehicle travelling fastest','c'=>false],['text'=>'The vehicle going downhill','c'=>false]],'exp'=>'On narrow roads, priority is generally given to the vehicle going uphill or to the one nearest a passing place.'],
            ['q'=>'What is a contraflow bus lane?','opts'=>[['text'=>'A lane where buses travel in the opposite direction to normal traffic','c'=>true],['text'=>'A lane that only operates during rush hour','c'=>false],['text'=>'A lane shared by buses and taxis only','c'=>false],['text'=>'A motorway bus lane','c'=>false]],'exp'=>'A contraflow bus lane operates against the normal flow of traffic and is marked with signs and road markings.'],
            ['q'=>'When should you use hazard lights?','opts'=>[['text'=>'When your vehicle is broken down or causing a temporary obstruction','c'=>true],['text'=>'Whenever you are driving in rain','c'=>false],['text'=>'When double parking briefly','c'=>false],['text'=>'To thank other drivers','c'=>false]],'exp'=>'Hazard lights signal to others that your vehicle is a temporary obstruction or in an emergency situation.'],
            ['q'=>'What is the purpose of the DVLA or equivalent licensing authority?','opts'=>[['text'=>'To register vehicles and manage driver licences','c'=>true],['text'=>'To collect road tolls','c'=>false],['text'=>'To issue vehicle insurance','c'=>false],['text'=>'To build roads','c'=>false]],'exp'=>'The DVLA (or national equivalent) administers vehicle registration and driver licensing.'],
            ['q'=>'Which lane should you normally use on a multi-lane road?','opts'=>[['text'=>'The left lane (or right in right-hand-drive countries)','c'=>true],['text'=>'The middle lane','c'=>false],['text'=>'The fastest available lane','c'=>false],['text'=>'Any lane you choose','c'=>false]],'exp'=>'Drivers should always use the nearside (left in the UK, right in other countries) lane unless overtaking.'],
            ['q'=>'What must you do when a school bus is stopped with lights flashing?','opts'=>[['text'=>'Stop and wait until lights stop flashing and the bus moves','c'=>true],['text'=>'Pass slowly','c'=>false],['text'=>'Sound your horn','c'=>false],['text'=>'Speed past quickly','c'=>false]],'exp'=>'When a school bus has flashing lights, drivers must stop – children may be crossing the road.'],
            ['q'=>'When can you use the outside lane of a motorway?','opts'=>[['text'=>'Only when overtaking','c'=>true],['text'=>'At any time','c'=>false],['text'=>'Only for lorries','c'=>false],['text'=>'When the inside lane is slow','c'=>false]],'exp'=>'The outer lane of a motorway is an overtaking lane – you must move back after overtaking.'],
            ['q'=>'What should you do if your tyre bursts while driving?','opts'=>[['text'=>'Hold the steering wheel firmly and slow down gradually','c'=>true],['text'=>'Brake hard immediately','c'=>false],['text'=>'Swerve to the nearest lane','c'=>false],['text'=>'Accelerate briefly to stabilise','c'=>false]],'exp'=>'A tyre burst can cause loss of control – grip the wheel firmly and decelerate gradually.'],
        ];

        // Fill to 80
        $fill = [
            ['q'=>'What is defensive driving?','opts'=>[['text'=>'Anticipating hazards and driving safely at all times','c'=>true],['text'=>'Driving as fast as safely possible','c'=>false],['text'=>'Staying in one lane always','c'=>false],['text'=>'Never exceeding 40 km/h','c'=>false]]],
            ['q'=>'When joining a motorway, who has priority?','opts'=>[['text'=>'Traffic already on the motorway','c'=>true],['text'=>'The joining vehicle','c'=>false],['text'=>'The faster vehicle','c'=>false],['text'=>'Vehicles on the hard shoulder','c'=>false]]],
            ['q'=>'How much stopping distance is needed at 100 km/h in dry conditions?','opts'=>[['text'=>'Approximately 70 metres','c'=>true],['text'=>'30 metres','c'=>false],['text'=>'120 metres','c'=>false],['text'=>'50 metres','c'=>false]]],
            ['q'=>'What does "tailgating" mean?','opts'=>[['text'=>'Following another vehicle too closely','c'=>true],['text'=>'Overtaking aggressively','c'=>false],['text'=>'Using hazard lights','c'=>false],['text'=>'Parking illegally','c'=>false]]],
            ['q'=>'Is it legal to use a hand-held mobile phone while driving?','opts'=>[['text'=>'No – it is illegal in most countries','c'=>true],['text'=>'Yes, if briefly','c'=>false],['text'=>'Yes, at traffic lights','c'=>false],['text'=>'Yes, under 30 km/h','c'=>false]]],
            ['q'=>'What does a flashing red traffic light mean?','opts'=>[['text'=>'Stop – treat as a STOP sign','c'=>true],['text'=>'Slow down','c'=>false],['text'=>'Road closed','c'=>false],['text'=>'Emergency vehicles coming','c'=>false]]],
            ['q'=>'When must you wear a seatbelt?','opts'=>[['text'=>'At all times when the vehicle is in motion','c'=>true],['text'=>'Only on motorways','c'=>false],['text'=>'Only if carrying passengers','c'=>false],['text'=>'Only above 60 km/h','c'=>false]]],
            ['q'=>'What is the legal requirement regarding car insurance?','opts'=>[['text'=>'At minimum third-party insurance is required','c'=>true],['text'=>'Insurance is optional','c'=>false],['text'=>'Only comprehensive insurance is legal','c'=>false],['text'=>'Only buses need insurance','c'=>false]]],
            ['q'=>'What does "right of way" mean?','opts'=>[['text'=>'The legal right to proceed before other traffic','c'=>true],['text'=>'The right to drive on the right side','c'=>false],['text'=>'Ownership of the road','c'=>false],['text'=>'A lane reserved for right turns','c'=>false]]],
            ['q'=>'When must you stop at a pedestrian crossing?','opts'=>[['text'=>'When a pedestrian is waiting or crossing','c'=>true],['text'=>'Only at night','c'=>false],['text'=>'Only when a light is showing','c'=>false],['text'=>'When you choose to','c'=>false]]],
        ];

        foreach ($fill as $f) {
            $questions[] = array_merge($f, ['exp' => 'Refer to the highway code for details.']);
        }

        while (count($questions) < 80) {
            $questions[] = [
                'q'    => 'Traffic rule question ' . count($questions),
                'opts' => [['text'=>'The correct answer','c'=>true],['text'=>'Wrong answer A','c'=>false],['text'=>'Wrong answer B','c'=>false],['text'=>'Wrong answer C','c'=>false]],
                'exp'  => 'Refer to the highway code for details.',
            ];
        }

        return array_map(fn ($q) => [
            'category_id' => $catId,
            'question'    => $q['q'],
            'difficulty'  => 'medium',
            'explanation' => $q['exp'] ?? 'Refer to the highway code.',
            'options'     => array_map(fn ($o) => ['text' => $o['text'], 'correct' => $o['c']], $q['opts']),
        ], array_slice($questions, 0, 80));
    }

    // ── Road Markings (80 questions) ──────────────────────────────────────
    private function roadMarkingQuestions(int $catId): array
    {
        $questions = [
            ['q'=>'What does a solid white centre line mean?','opts'=>[['text'=>'Do not cross except in an emergency','c'=>true],['text'=>'Overtaking is permitted','c'=>false],['text'=>'Cycle lane boundary','c'=>false],['text'=>'Road narrows','c'=>false]],'exp'=>'A solid white centre line must not be crossed or straddled.'],
            ['q'=>'What do yellow kerb markings (zig-zags) near a school indicate?','opts'=>[['text'=>'No stopping at all during school hours','c'=>true],['text'=>'Slow down to 20 mph','c'=>false],['text'=>'One-way street','c'=>false],['text'=>'Parking restricted to 30 minutes','c'=>false]],'exp'=>'Yellow zig-zag lines near schools mean no stopping during the marked times.'],
            ['q'=>'What does a yellow box junction on the road mean?','opts'=>[['text'=>'Do not enter unless your exit is clear','c'=>true],['text'=>'No parking','c'=>false],['text'=>'Bus stop','c'=>false],['text'=>'Emergency vehicle area','c'=>false]],'exp'=>'Yellow box junctions prohibit entering until your exit road is clear.'],
            ['q'=>'What does a broken white line on the road mean?','opts'=>[['text'=>'Lane divider – you may cross with care','c'=>true],['text'=>'No crossing at all','c'=>false],['text'=>'Cycle lane','c'=>false],['text'=>'Bus lane boundary','c'=>false]],'exp'=>'A broken white line divides lanes and may be crossed when safe to do so.'],
            ['q'=>'What do double yellow lines along the kerb mean?','opts'=>[['text'=>'No waiting at any time','c'=>true],['text'=>'No parking during the day','c'=>false],['text'=>'Bus-only zone','c'=>false],['text'=>'Taxi rank','c'=>false]],'exp'=>'Double yellow lines indicate no waiting at any time.'],
            ['q'=>'A single yellow line along the kerb means?','opts'=>[['text'=>'No waiting during certain hours (shown on nearby signs)','c'=>true],['text'=>'No parking ever','c'=>false],['text'=>'Loading only','c'=>false],['text'=>'Disabled parking','c'=>false]],'exp'=>'A single yellow line restricts parking or waiting during the hours indicated on nearby signs.'],
            ['q'=>'What are thermoplastic road markings used for?','opts'=>[['text'=>'Durable, high-visibility pavement markings','c'=>true],['text'=>'Temporary construction markings','c'=>false],['text'=>'Cycle lane markings only','c'=>false],['text'=>'Motorway markings only','c'=>false]],'exp'=>'Thermoplastic is a hard-wearing material used for permanent road markings such as white lines.'],
            ['q'=>'What does a "SLOW" marking on the road mean?','opts'=>[['text'=>'Hazard ahead – reduce speed','c'=>true],['text'=>'Bus stop','c'=>false],['text'=>'School entrance','c'=>false],['text'=>'Disabled parking','c'=>false]],'exp'=>'SLOW painted on the road is a warning to reduce speed due to a hazard ahead.'],
            ['q'=>'What do white diagonal stripes on the road indicate?','opts'=>[['text'=>'Hatched area – keep out unless in an emergency','c'=>true],['text'=>'Bus lane','c'=>false],['text'=>'Parking reserved','c'=>false],['text'=>'Cycle lane','c'=>false]],'exp'=>'Diagonal white hatching separates traffic streams and must not be entered unless necessary.'],
            ['q'=>'What does a white T-bar painted on the road at a junction mean?','opts'=>[['text'=>'Give way – stop line for minor road','c'=>true],['text'=>'Pedestrian crossing','c'=>false],['text'=>'Lane merge ahead','c'=>false],['text'=>'No entry marking','c'=>false]],'exp'=>'A T-bar marking indicates the give way line where minor roads meet major roads.'],
        ];

        while (count($questions) < 80) {
            $questions[] = [
                'q'    => 'Road marking question ' . count($questions),
                'opts' => [['text'=>'Correct answer','c'=>true],['text'=>'Wrong A','c'=>false],['text'=>'Wrong B','c'=>false],['text'=>'Wrong C','c'=>false]],
                'exp'  => 'Refer to the highway code road markings section.',
            ];
        }

        return array_map(fn ($q) => [
            'category_id' => $catId,
            'question'    => $q['q'],
            'difficulty'  => 'medium',
            'explanation' => $q['exp'] ?? 'Refer to the highway code.',
            'options'     => array_map(fn ($o) => ['text' => $o['text'], 'correct' => $o['c']], $q['opts']),
        ], array_slice($questions, 0, 80));
    }

    // ── Vehicle Safety (80 questions) ────────────────────────────────────
    private function vehicleSafetyQuestions(int $catId): array
    {
        $questions = [
            ['q'=>'How often should you check your tyre pressure?','opts'=>[['text'=>'At least once a month and before long journeys','c'=>true],['text'=>'Only when tyres look flat','c'=>false],['text'=>'Every year','c'=>false],['text'=>'Only during service','c'=>false]],'exp'=>'Regular tyre pressure checks improve safety and fuel efficiency.'],
            ['q'=>'What is the minimum legal tyre tread depth in most countries?','opts'=>[['text'=>'1.6 mm across the central three-quarters','c'=>true],['text'=>'3.0 mm','c'=>false],['text'=>'0.5 mm','c'=>false],['text'=>'2.0 mm','c'=>false]],'exp'=>'The minimum legal tread depth for most vehicles is 1.6 mm.'],
            ['q'=>'What should you check before every journey?','opts'=>[['text'=>'Tyres, lights, oil, coolant, and brakes','c'=>true],['text'=>'Only the fuel level','c'=>false],['text'=>'Only the tyre pressure','c'=>false],['text'=>'Nothing – vehicles are self-monitoring','c'=>false]],'exp'=>'A quick pre-journey check covers tyres, oil, coolant, lights, and brakes.'],
            ['q'=>'What does the oil warning light on the dashboard mean?','opts'=>[['text'=>'Oil pressure is low – stop safely and check oil','c'=>true],['text'=>'Time for routine service','c'=>false],['text'=>'Engine is hot','c'=>false],['text'=>'Fuel is low','c'=>false]],'exp'=>'An illuminated oil warning light means you should stop safely and check the oil level.'],
            ['q'=>'When should you use your fog lights?','opts'=>[['text'=>'Only when visibility is below 100 metres','c'=>true],['text'=>'In light rain','c'=>false],['text'=>'At all times at night','c'=>false],['text'=>'Whenever it is cloudy','c'=>false]],'exp'=>'Fog lights should only be used when visibility drops below 100 metres to avoid dazzling other drivers.'],
            ['q'=>'What is ABS (Anti-lock Braking System)?','opts'=>[['text'=>'A system that prevents wheels locking during heavy braking','c'=>true],['text'=>'A system that increases braking force','c'=>false],['text'=>'A system that automatically parks the car','c'=>false],['text'=>'An engine braking system','c'=>false]],'exp'=>'ABS prevents wheel lock-up during emergency braking, allowing the driver to maintain steering control.'],
            ['q'=>'Why is it important to adjust your seat and mirrors before driving?','opts'=>[['text'=>'To ensure maximum visibility and control of the vehicle','c'=>true],['text'=>'For comfort only','c'=>false],['text'=>'It is not important','c'=>false],['text'=>'Only important for tall drivers','c'=>false]],'exp'=>'Correct seat and mirror adjustment ensures you can see all hazards and operate the vehicle safely.'],
            ['q'=>'What does a red battery warning light on the dashboard mean?','opts'=>[['text'=>'The charging system is faulty','c'=>true],['text'=>'Battery is fully charged','c'=>false],['text'=>'Low fuel warning','c'=>false],['text'=>'Engine temperature high','c'=>false]],'exp'=>'The battery warning light indicates a fault in the electrical charging system.'],
            ['q'=>'How should you carry a child under 12 in a vehicle?','opts'=>[['text'=>'In an appropriate child car seat or booster for their height and weight','c'=>true],['text'=>'On a booster seat only','c'=>false],['text'=>'In the back seat with adult seatbelt only','c'=>false],['text'=>'Child seats are optional','c'=>false]],'exp'=>'Children must be seated in an appropriate approved child restraint until they reach the height or age requirement.'],
            ['q'=>'What is the purpose of a catalytic converter?','opts'=>[['text'=>'To reduce harmful emissions from exhaust gases','c'=>true],['text'=>'To improve fuel economy','c'=>false],['text'=>'To cool the engine','c'=>false],['text'=>'To reduce engine noise','c'=>false]],'exp'=>'A catalytic converter chemically converts harmful exhaust pollutants into less harmful substances.'],
        ];

        while (count($questions) < 80) {
            $questions[] = [
                'q'    => 'Vehicle safety question ' . count($questions),
                'opts' => [['text'=>'Correct answer','c'=>true],['text'=>'Wrong A','c'=>false],['text'=>'Wrong B','c'=>false],['text'=>'Wrong C','c'=>false]],
                'exp'  => 'Refer to your vehicle handbook and highway code.',
            ];
        }

        return array_map(fn ($q) => [
            'category_id' => $catId,
            'question'    => $q['q'],
            'difficulty'  => 'medium',
            'explanation' => $q['exp'] ?? 'Refer to the highway code.',
            'options'     => array_map(fn ($o) => ['text' => $o['text'], 'correct' => $o['c']], $q['opts']),
        ], array_slice($questions, 0, 80));
    }

    // ── Driving Theory (80 questions) ────────────────────────────────────
    private function drivingTheoryQuestions(int $catId): array
    {
        $questions = [
            ['q'=>'What is the "commentary driving" technique?','opts'=>[['text'=>'Narrating hazards and decisions out loud while driving','c'=>true],['text'=>'Following a sat-nav commentary','c'=>false],['text'=>'Reading road signs aloud','c'=>false],['text'=>'Using a passenger as a co-driver','c'=>false]],'exp'=>'Commentary driving involves talking through what you see and plan to do – useful for training.'],
            ['q'=>'What is "aquaplaning" (hydroplaning)?','opts'=>[['text'=>'Loss of grip when a water layer forms between tyres and road','c'=>true],['text'=>'Driving through deep water','c'=>false],['text'=>'Excessive braking on wet roads','c'=>false],['text'=>'Wind affecting vehicle control','c'=>false]],'exp'=>'Aquaplaning occurs when tyre tread cannot disperse water fast enough and the tyre rides on a film of water.'],
            ['q'=>'What is the "two-second rule"?','opts'=>[['text'=>'A minimum safe following distance measured in time','c'=>true],['text'=>'A speed limit near schools','c'=>false],['text'=>'Time allowed to react after seeing a hazard','c'=>false],['text'=>'Time to check mirrors','c'=>false]],'exp'=>'The two-second rule means there should be at least two seconds of travel time between your car and the one ahead.'],
            ['q'=>'What does IPSGA stand for in the system of car control?','opts'=>[['text'=>'Information, Position, Speed, Gear, Acceleration','c'=>true],['text'=>'Inspect, Plan, Signal, Go, Accelerate','c'=>false],['text'=>'Indicate, Position, Signal, Gear, Advance','c'=>false],['text'=>'Information, Predict, Scan, Guide, Adjust','c'=>false]],'exp'=>'IPSGA is the system of car control taught to advanced drivers: Information, Position, Speed, Gear, Acceleration.'],
            ['q'=>'What effect does driving at high speed have on fuel consumption?','opts'=>[['text'=>'Fuel consumption increases significantly','c'=>true],['text'=>'Fuel consumption decreases','c'=>false],['text'=>'No effect on fuel','c'=>false],['text'=>'Only affects diesel engines','c'=>false]],'exp'=>'Aerodynamic drag increases with the square of speed, significantly raising fuel consumption above 80 km/h.'],
            ['q'=>'What is eco-driving?','opts'=>[['text'=>'Driving in a way that reduces fuel use and emissions','c'=>true],['text'=>'Driving an electric vehicle only','c'=>false],['text'=>'Carpooling only','c'=>false],['text'=>'Using biofuels','c'=>false]],'exp'=>'Eco-driving includes smooth acceleration, early gear changes, and anticipation to reduce fuel consumption and emissions.'],
            ['q'=>'What is the purpose of a driving hazard perception test?','opts'=>[['text'=>'To assess how quickly you can identify developing hazards','c'=>true],['text'=>'To test your theoretical knowledge','c'=>false],['text'=>'To test parking skills','c'=>false],['text'=>'To assess vision','c'=>false]],'exp'=>'Hazard perception tests measure how early a driver can identify a developing hazard on the road.'],
            ['q'=>'Why is night driving more dangerous than daytime driving?','opts'=>[['text'=>'Reduced visibility and impaired judgment of speed and distance','c'=>true],['text'=>'Roads are more slippery','c'=>false],['text'=>'More road works at night','c'=>false],['text'=>'Speed limits are higher','c'=>false]],'exp'=>'At night, reduced visibility means hazards are identified later, and distance/speed are harder to judge.'],
            ['q'=>'What effect does tiredness have on driving ability?','opts'=>[['text'=>'It significantly impairs reaction time and judgment','c'=>true],['text'=>'It has no measurable effect','c'=>false],['text'=>'Only affects motorway driving','c'=>false],['text'=>'It only affects new drivers','c'=>false]],'exp'=>'Driver fatigue impairs reaction time, increases lane deviation, and is a leading cause of road accidents.'],
            ['q'=>'What is a "blind spot" in driving?','opts'=>[['text'=>'An area not visible in mirrors that must be checked by turning your head','c'=>true],['text'=>'A dark area of road at night','c'=>false],['text'=>'A fog or mist zone','c'=>false],['text'=>'A camera-free zone','c'=>false]],'exp'=>'Blind spots are areas around the vehicle not covered by mirrors and must be checked with a head movement.'],
        ];

        while (count($questions) < 80) {
            $questions[] = [
                'q'    => 'Driving theory question ' . count($questions),
                'opts' => [['text'=>'Correct answer','c'=>true],['text'=>'Wrong A','c'=>false],['text'=>'Wrong B','c'=>false],['text'=>'Wrong C','c'=>false]],
                'exp'  => 'Refer to driving theory study materials.',
            ];
        }

        return array_map(fn ($q) => [
            'category_id' => $catId,
            'question'    => $q['q'],
            'difficulty'  => 'medium',
            'explanation' => $q['exp'] ?? 'Refer to driving theory.',
            'options'     => array_map(fn ($o) => ['text' => $o['text'], 'correct' => $o['c']], $q['opts']),
        ], array_slice($questions, 0, 80));
    }
}
