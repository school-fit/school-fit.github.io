"""
Copies AI-generated PNG silhouettes to pictures/exercises/{slug}/phase-{n}.png
and also stores them in each tier subdirectory so the existing SVG path fallback still works.
"""
import os, shutil

BASE = os.path.join(os.path.dirname(__file__), '..')
ASSETS = r'C:\Users\pavel.vrtal\.cursor\projects\c-Users-pavel-vrtal-OneDrive-Vy-odborn-kola-a-St-edn-kola-veterin-rn-zem-d-lsk-a-zdravotnick-T-eb-AI-01-Projekty-school-fit\assets'
EX_ROOT = os.path.join(BASE, 'pictures', 'exercises')

# (slug, phase) -> source PNG filename in ASSETS directory
MAPPING = {
    ('e-ct-kliky', 1): 'pose_knee_plank.png',
    ('e-ct-kliky', 2): 'pose_pushup_low.png',
    ('e-ct-kliky', 3): 'pose_knee_plank.png',

    ('e-ct-drep', 1): 'pose_standing.png',
    ('e-ct-drep', 2): 'sample_squat.png',
    ('e-ct-drep', 3): 'pose_standing.png',

    ('e-ct-bridge', 1): 'pose_lying_flat.png',
    ('e-ct-bridge', 2): 'pose_bridge_up.png',
    ('e-ct-bridge', 3): 'pose_lying_flat.png',

    ('e-ct-lunge', 1): 'pose_standing.png',
    ('e-ct-lunge', 2): 'pose_lunge_fwd.png',
    ('e-ct-lunge', 3): 'pose_lunge_fwd.png',

    ('e-ct-plank', 1): 'sample_plank.png',
    ('e-ct-plank', 2): 'sample_plank.png',
    ('e-ct-plank', 3): 'sample_plank.png',

    ('e-ka-march', 1): 'pose_standing.png',
    ('e-ka-march', 2): 'pose_knee_up.png',
    ('e-ka-march', 3): 'pose_knee_up.png',

    ('e-ka-jack', 1): 'pose_standing.png',
    ('e-ka-jack', 2): 'pose_jack_open.png',
    ('e-ka-jack', 3): 'pose_standing.png',

    ('e-ka-knee', 1): 'pose_standing.png',
    ('e-ka-knee', 2): 'pose_knee_up.png',
    ('e-ka-knee', 3): 'pose_knee_up.png',

    ('e-ka-side', 1): 'pose_standing.png',
    ('e-ka-side', 2): 'pose_side_step.png',
    ('e-ka-side', 3): 'pose_standing.png',

    ('e-ka-squat', 1): 'pose_standing.png',
    ('e-ka-squat', 2): 'sample_squat.png',
    ('e-ka-squat', 3): 'pose_standing.png',

    ('e-mo-fold', 1): 'pose_standing.png',
    ('e-mo-fold', 2): 'pose_fold.png',
    ('e-mo-fold', 3): 'pose_fold.png',

    ('e-mo-bfly', 1): 'pose_seated_twist.png',
    ('e-mo-bfly', 2): 'pose_butterfly.png',
    ('e-mo-bfly', 3): 'pose_butterfly.png',

    ('e-mo-cat', 1): 'pose_cow.png',
    ('e-mo-cat', 2): 'pose_cat.png',
    ('e-mo-cat', 3): 'pose_cow.png',

    ('e-mo-twist', 1): 'pose_seated_twist.png',
    ('e-mo-twist', 2): 'pose_seated_twist.png',
    ('e-mo-twist', 3): 'pose_seated_twist.png',

    ('e-mo-pigeon', 1): 'pose_cow.png',
    ('e-mo-pigeon', 2): 'pose_pigeon.png',
    ('e-mo-pigeon', 3): 'pose_pigeon.png',

    ('e-co-elplank', 1): 'pose_elbow_plank.png',
    ('e-co-elplank', 2): 'pose_elbow_plank.png',
    ('e-co-elplank', 3): 'pose_elbow_plank.png',

    ('e-co-super', 1): 'pose_prone_flat.png',
    ('e-co-super', 2): 'pose_superman_up.png',
    ('e-co-super', 3): 'pose_prone_flat.png',

    ('e-co-bird', 1): 'pose_cow.png',
    ('e-co-bird', 2): 'pose_bird_dog.png',
    ('e-co-bird', 3): 'pose_cow.png',

    ('e-co-side', 1): 'pose_side_plank.png',
    ('e-co-side', 2): 'pose_side_plank.png',
    ('e-co-side', 3): 'pose_side_plank.png',

    ('e-co-bridge2', 1): 'pose_lying_flat.png',
    ('e-co-bridge2', 2): 'pose_bridge_up.png',
    ('e-co-bridge2', 3): 'pose_lying_flat.png',

    ('e-le-squat', 1): 'pose_standing.png',
    ('e-le-squat', 2): 'sample_squat.png',
    ('e-le-squat', 3): 'pose_standing.png',

    ('e-le-revlung', 1): 'pose_standing.png',
    ('e-le-revlung', 2): 'pose_lunge_rev.png',
    ('e-le-revlung', 3): 'pose_lunge_fwd.png',

    ('e-le-onebridge', 1): 'pose_lying_flat.png',
    ('e-le-onebridge', 2): 'pose_bridge_one_leg.png',
    ('e-le-onebridge', 3): 'pose_lying_flat.png',

    ('e-le-wall', 1): 'pose_wall_sit.png',
    ('e-le-wall', 2): 'pose_wall_sit.png',
    ('e-le-wall', 3): 'pose_wall_sit.png',

    ('e-le-calf', 1): 'pose_standing.png',
    ('e-le-calf', 2): 'pose_tiptoe.png',
    ('e-le-calf', 3): 'pose_standing.png',
}

ok = 0
missing = []
for (slug, ph), src_name in MAPPING.items():
    src = os.path.join(ASSETS, src_name)
    if not os.path.exists(src):
        missing.append(src_name)
        continue
    dst = os.path.join(EX_ROOT, slug, f'phase-{ph}.png')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    ok += 1

print(f'Copied {ok} / {len(MAPPING)} files.')
if missing:
    print('MISSING source files:', sorted(set(missing)))
