"""Build an isolated one-shot renderer from the already recovered game.

No Steam installation or recovered source file is modified. Run explicitly
with Python; the website never silently rebuilds or downloads an engine.
"""
from pathlib import Path
import hashlib, json, os, re

ROOT = Path(__file__).resolve().parents[2]
BASE = Path(__file__).resolve().parent
SOURCE = Path(os.environ.get('JV_SOURCE_PROJECT', 'D:/wh/202611/just volleyball/解包文件/recovered_project'))
OVERLAY = BASE / 'overlay'
project = (SOURCE / 'project.godot').read_text(encoding='utf-8')
autoload = project.split('[autoload]', 1)[1].split('\n[', 1)[0]
callbacks = ['_ready', '_enter_tree', '_exit_tree', '_process', '_physics_process', '_input', '_unhandled_input', '_unhandled_key_input', '_shortcut_input', '_notification']
patched = []
for path in re.findall(r'="\*res://([^\"]+)"', autoload):
    if path.endswith('.tscn'):
        text = (SOURCE/path).read_text(encoding='utf-8')
        path = re.search(r'type="Script"[^\n]*path="res://([^\"]+)"', text)[1]
    text = (SOURCE/path).read_text(encoding='utf-8')
    for method in callbacks:
        text = re.sub(r'(?m)^func '+re.escape(method)+r'\(', 'func _locker_disabled'+method+'(', text)
    target = OVERLAY/path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding='utf-8')
    patched.append(path)

portrait = (SOURCE/'game/character/character_portrait.gd').read_text(encoding='utf-8')
portrait = portrait.replace('static var _busy: = false', 'static var _busy: = false\nstatic var locker_yaw: = 0.0\nstatic var locker_pitch: = 0.0')
portrait = portrait.replace('body.visual.rotation.y = PI if from_back else 0.0', 'body.visual.rotation.y = (PI if from_back else 0.0) + deg_to_rad(locker_yaw)')
portrait = portrait.replace(
    'cam.global_position = look + Vector3(0.0, 0.0, float(p["dist"]))',
    'cam.global_position = look + Vector3(0.0, 0.0, float(p["dist"])).rotated(Vector3.LEFT, deg_to_rad(locker_pitch))',
)
# Common framing leaves room for hair and accessories; assembly is untouched.
portrait = portrait.replace('"full_hd": {"look": Vector3(0.0, 1.0, 0.0), "dist": 14.1,', '"full_hd": {"look": Vector3(0.0, 1.18, 0.0), "dist": 16.5,')
target = OVERLAY/'game/character/character_portrait.gd'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(portrait, encoding='utf-8')
project = project.replace('config/name="volleyball"', 'config/name="CodexJVLocker"\nconfig/use_custom_user_dir=true\nconfig/custom_user_dir_name="CodexJVLocker"')
project = re.sub(r'(?m)^run/main_scene=.*\n', 'run/main_scene="res://locker-driver.tscn"\n', project)
def renderer_section(match):
    body = re.sub(r'(?m)^renderer/rendering_method(?:\.mobile)?=.*\n?', '', match[2])
    return match[1]+body+'\nrenderer/rendering_method="gl_compatibility"\nrenderer/rendering_method.mobile="gl_compatibility"\n'
project = re.sub(r'(\[rendering\]\n)(.*?)(?=\n\[|\Z)', renderer_section, project, flags=re.S)
(OVERLAY/'project.godot').write_text(project, encoding='utf-8')
files = {p.relative_to(SOURCE).as_posix(): p for p in SOURCE.rglob('*') if p.is_file()}
for p in OVERLAY.rglob('*'):
    if p.is_file(): files[p.relative_to(OVERLAY).as_posix()] = p
for name in ['locker-driver.gd', 'locker-driver.tscn']:
    files[name] = BASE/name
files['locker-web-export.gd'] = ROOT/'scripts/export-locker-web.gd'
(BASE/'manifest.json').write_text(json.dumps([{'virtual':'res://'+k,'source':str(v)} for k,v in files.items()]), encoding='utf-8')
(BASE/'build-project.gd').write_text('''extends SceneTree
func _initialize():
\tvar base = %s
\tvar entries = JSON.parse_string(FileAccess.get_file_as_string(base + "/manifest.json"))
\tvar packer = PCKPacker.new()
\tvar err = packer.pck_start(base + "/locker-render.pck")
\tif err != OK:
\t\tquit(1)
\t\treturn
\tfor entry in entries:
\t\terr = packer.add_file(entry.virtual, entry.source)
\t\tif err != OK:
\t\t\tprint("PACK_ERROR=", entry.virtual, " ", err)
\t\t\tquit(1)
\t\t\treturn
\tvar result = packer.flush()
\tprint("LOCKER_PACK_RESULT=", result)
\tquit(0 if result == OK else 1)
''' % json.dumps(BASE.as_posix()), encoding='utf-8')
(BASE/'provenance.json').write_text(json.dumps({'source':str(SOURCE),'resourceVersion':'1.0.3','disabledAutoloadCallbacks':callbacks,'autoloadScripts':patched,'originalModelRigSha256':hashlib.sha256((SOURCE/'game/character/model_rig.gd').read_bytes()).hexdigest(),'originalLookShareSha256':hashlib.sha256((SOURCE/'game/character/look_share.gd').read_bytes()).hexdigest(),'assembly':'Original CharacterConfig, ModelRig, HairWarm, CharacterPortrait and LookShare methods. No ownership removal; no user profiles or game networking initialized.','differences':['Isolated lifecycle','Compatibility renderer in auxiliary GDRE engine','Static portrait light and pose','Common full framing, user yaw and camera pitch']},indent=2),encoding='utf-8')
print('Prepared',len(files),'resources. Run the existing GDRE engine headlessly with --script',BASE/'build-project.gd')
engine = SOURCE.parent/'_tools/GDRE-2.7.4/gdre_tools.exe'
if engine.is_file():
    (BASE/'local-config.json').write_text(json.dumps({'engine':str(engine),'pack':str(BASE/'locker-render.pck')},indent=2),encoding='utf-8')
