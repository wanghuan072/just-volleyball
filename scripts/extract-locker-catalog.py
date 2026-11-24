"""Rebuild the Locker UI catalog from recovered resources and audited codec fields.

This only reads the recovered game. It does not execute the game or imply unlocks.
"""
from pathlib import Path
import json, re, hashlib, struct, math

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('D:/wh/202611/just volleyball/解包文件/recovered_project')
assets = json.loads((ROOT/'data/extracted-assets.json').read_text(encoding='utf-8'))
c = json.loads((ROOT/'data/code-format.json').read_text(encoding='utf-8'))['constants']
cfg = (SOURCE/'game/character/character_config.gd').read_text(encoding='utf-8')
team_kits = (SOURCE/'game/core/team_kits.gd').read_text(encoding='utf-8')

def label(s): return s.replace('_', ' ').strip().title()
def choices(names): return [{'value':i,'label':label(n) or 'Default'} for i,n in enumerate(names)]
def strings(name):
    m=re.search(r'const '+name+r'[^=]*=\s*\[(.*?)\]',cfg,re.S)
    return re.findall(r'"([^"]*)"',m[1]) if m else []
def flat(group):
    for f in group:
        if isinstance(f[0],list): yield from flat(f)
        else: yield f

hair=[{'id':'','label':'Bald','image':None}]+[{'id':x['id'],'label':x['name'],'image':None,'sourcePath':x['sourcePath']} for x in assets['hair']['items']]
beard_paths=sorted((SOURCE/'game/character/facial_hair').glob('*.blend.import'))
beards=[{'id':'','label':'None'}]+[{'id':p.name.removesuffix('.blend.import'),'label':label(p.name.removesuffix('.blend.import')),'sourcePath':p.relative_to(SOURCE).as_posix()} for p in beard_paths]
faces={}
for g in assets['groups']:
    if g['id'] not in ['eyes','brows','nose','mouth']: continue
    # Existing catalog is already sorted according to FaceParts._scan.
    faces[g['id']]=[{'id':x['id'],'label':x['name'],'index':i,'image':x['image'],'sourcePath':x['sourcePath']} for i,x in enumerate(g['items'])]
blush_names=strings('BLUSH_BUILT_IN')
blush_names+=sorted(p.stem for p in (SOURCE/'game/character/faces/blush').glob('*.png') if p.stem not in blush_names)
faces['blush']=[{'id':s,'label':label(s),'index':i,'sourcePath':f'game/character/faces/blush/{s}.png','image':f'/images/locker/blush-{s}.png'} for i,s in enumerate(blush_names)]
for f in faces['blush']:
    src=SOURCE/f['sourcePath']; target=ROOT/'public'/f['image'].lstrip('/')
    target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(src.read_bytes())

names={
'skin':'Skin tone','skx':'Custom skin colour','skc':'Skin colour','hs':'Head shape','ear':'Ear shape','lh':'Left handed','h':'Height','w':'Build',
'hair':'Hairstyle','hc':'Hair palette','hcol':'Hair colour','hfl':'Mirror hair','es':'Eyes','eyc':'Iris colour','elc':'Eyelash colour',
'ez':'Eye size','ew':'Eye width','eyz':'Eye height scale','eh':'Eye vertical position','ex':'Eye spacing','er':'Eye rotation','epx':'Eye horizontal position',
'bs':'Eyebrows','bwc':'Eyebrow colour','bh':'Brow vertical position','br':'Brow rotation','bsp':'Brow spacing','bsz':'Brow size','bwid':'Brow width','bht':'Brow height scale','bpx':'Brow horizontal position',
'ms':'Mouth','mz':'Mouth size','mw':'Mouth width','my':'Mouth height scale','mh':'Mouth vertical position','mr':'Mouth rotation','mpx':'Mouth horizontal position',
'ns':'Nose','nfl':'Mirror nose','nz':'Nose size','nw':'Nose width','ny':'Nose height scale','nh':'Nose vertical position','nx':'Nose horizontal position',
'bl':'Show blush','blk':'Blush style','blc':'Blush colour','bz':'Blush size','bw':'Blush width','bhy':'Blush height scale','bx':'Blush spacing','bo':'Blush opacity','blr':'Blush rotation',
'fh':'Facial hair','num':'Jersey number','kst':'Uniform pattern','sl':'Shorts length','skl':'Socks length','gso':'Wear socks','sk':'Socks colour','gkp':'Wear kneepads','kps':'Right kneepad style','kpsl':'Left kneepad style','kpw':'Kneepad side','kpm':'Match kneepads','kp':'Right kneepad colour','kpl':'Left kneepad colour','sh':'Right shoe colour','shm':'Match shoes','shl':'Left shoe colour',
'gt':'Casual shirt colour','gs':'Casual shorts colour','gsh':'Casual shirt','hdc':'Hoodie colour','hdx':'Custom hoodie colour',
'fpx':'Beard horizontal position','fpy':'Beard vertical position','fpz':'Beard depth','frx':'Beard X rotation','fry':'Beard Y rotation','frz':'Beard Z rotation','fsc':'Beard scale','fsx':'Beard width','fsy':'Beard height','fsz':'Beard depth scale',
'vo':'Voice preset','vpk':'Voice pack','vp':'Voice pitch','vs':'Voice speed',
}
option_map={
'hair':[{'value':x['id'],'label':x['label']} for x in hair],
'fh':[{'value':x['id'],'label':x['label']} for x in beards],
'hs':choices(strings('HEAD_SHAPE_NAMES')),
'sl':choices(strings('SHORTS_SHAPE_NAMES')),'skl':choices(strings('SOCKS_SHAPE_NAMES')),
'gsh':choices(strings('SHIRT_SHAPE_NAMES')),'kps':choices(strings('KNEEPAD_STYLE_NAMES')),'kpsl':choices(strings('KNEEPAD_STYLE_NAMES')),'kpw':choices(strings('KNEEPAD_SIDE_NAMES')),
'blk':[{'value':s,'label':label(s)} for s in blush_names],
'kst':[{'value':i,'label':s,'image':None} for i,s in enumerate(re.findall(r'"([^"]+)"',re.search(r'const KIT_STYLE_NAMES[^=]*=\s*\[(.*?)\]',team_kits,re.S)[1]))],
'vo':choices(strings('VOICE_NAMES')),
'vpk':[{'value':1,'label':'Voice pack 1'}],
}
for key,feature in [('es','eyes'),('bs','brows'),('ns','nose'),('ms','mouth')]:
    option_map[key]=([{'value':-1,'label':'None'}] if key in ['bs','ns'] else [])+[{'value':x['index'],'label':x['label'],'image':x['image']} for x in faces[feature]]
# Palette indices are exact source order (CharacterConfig.SKIN_TONES/HAIR_COLORS).
def palette(name):
    body=re.search(r'const '+name+r'.*?=\s*\[(.*?)\]',cfg,re.S)[1]
    return [''.join(f'{math.floor(float(v.strip())*255+0.5):02x}' for v in part.split(',')[:3]) for part in re.findall(r'Color\(([^)]+)\)',body)]
skin_colors=palette('SKIN_TONES'); hair_colors=palette('HAIR_COLORS')
option_map['skin']=[{'value':i,'label':f'Skin tone {i+1}','color':v} for i,v in enumerate(skin_colors)]
option_map['hc']=[{'value':i,'label':f'Hair palette {i+1}','color':v} for i,v in enumerate(hair_colors)]
# EAR_SHAPES is populated dynamically by ModelRig._find_ear_names, not codec EARS.
model_bytes=(SOURCE/'.assets/game/character/models/player_char.glb').read_bytes()
chunk_length=struct.unpack_from('<I',model_bytes,12)[0]
model=json.loads(model_bytes[20:20+chunk_length])
ear_shapes=[]
for node in model['nodes']:
    if node.get('name','').lower().startswith('earsmesh') and 'mesh' in node:
        for name in model['meshes'][node['mesh']].get('extras',{}).get('targetNames',[]):
            if name not in ['heavy','slim','Hat_TopCovered','Hat_FullCovered','pinnyoffset'] and name not in ear_shapes:
                ear_shapes.append(name)
option_map['ear']=[{'value':'','label':'Default'}]+[{'value':s,'label':label(s)} for s in ear_shapes]
defaults={f[0]:f[2] for f in flat(c['GROUPS'])};defaults['gg']={f[0]:f[2] for f in c['GEAR_FIELDS']};defaults['acc']={}
default_source={'method':'LookPack.GROUPS codec defaults','sourcePath':'game/character/look_pack.gd'}
runtime_defaults=ROOT/'artifacts/locker-engine/probe/result.json'
if runtime_defaults.exists():
    runtime=json.loads(runtime_defaults.read_text(encoding='utf-8'))
    assert runtime['rendererInfo']['resourceVersion']=='1.0.3'
    defaults=runtime['config']
    default_source={'method':'Original engine CharacterConfig / LookShare export round-trip defaults','sourcePath':runtime_defaults.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(runtime_defaults.read_bytes()).hexdigest(),'engine':runtime['rendererInfo']['engine']}
fields=[]
for gi,group in enumerate(c['GROUPS']):
    for f in flat(group):
        key,t,default,width=f[:4]
        if key not in names: continue
        default=defaults.get(key,default)
        section='voice' if gi==8 else 'body' if gi==0 else 'hair' if gi in [1,7] else 'face' if gi in range(2,7) else 'outfit' if gi in [9,11] else 'gear'
        field={'key':key,'label':names[key],'default':default,'section':section,'sourcePath':'game/character/look_pack.gd'}
        if key in option_map: field.update(kind='select',options=option_map[key])
        elif t==0: field['kind']='boolean'
        elif t==3: field.update(kind='unit',min=0,max=1,step=0.02)
        elif t==4: field['kind']='color'
        elif key=='num': field.update(kind='integer',min=0,max=99,step=1)
        else: continue
        fields.append(field)
# KIT is an array field, represented as indexed UI paths, reconstructed on submit.
for i,title in enumerate(['Jersey colour','Shorts colour','Trim colour','Number colour']):
    fields.append({'key':f'kh.{i}','label':title,'kind':'color','default':defaults['kh'][i],'section':'outfit','sourcePath':'game/character/character_config.gd:450'})
accessories=[{'id':x['id'],'label':x['displayName'],'category':x['category'],'price':x['price'],'supporter':x['supporter'],'availableInBuild':not x['supporter'],'availabilitySource':'game/core/supporter.gd:33,101-105; game/character/accessory_catalog.gd:78-80' if x['supporter'] else 'game/character/accessory_catalog.gd:_scan','sourcePath':x['sourcePath'],'modelPath':x['meshSourcePath']} for x in assets['accessories']['items']]
result={'gameVersion':'1.0.3','hair':hair,'facialHair':beards,'faces':faces,'accessories':accessories,'fields':fields,'defaults':defaults,'accessorySlots':c['ACC_SLOTS'],'accessoryMoves':c['ACC_MOVES'],'palettes':{'skin':skin_colors,'hair':hair_colors},'limits':{'maxAccessorySlots':12,'maxAccessoryColors':8,'maxHairColors':8},'provenance':{'sourceRoot':str(SOURCE),'sources':['game/character/character_config.gd','game/character/face_parts.gd','game/character/look_pack.gd','game/core/team_kits.gd'],'characterConfigSha256':hashlib.sha256(cfg.encode()).hexdigest(),'notes':['Resource counts do not establish account ownership.','Short UI field keys preserve CharacterConfig.to_dict names.','Codec array/dictionary fields remain available through advanced JSON.','Uniform pattern labels are neutral index labels, not invented in-game names.']}}
result['skinTones']=skin_colors
result['headShapes']=option_map['hs']
result['ears']=option_map['ear']
result['kitStyles']=option_map['kst']
result['shirtShapes']=option_map['gsh']
result['defaultSource']=default_source
result['availableAccessoryCount']=sum(item['availableInBuild'] for item in accessories)
result['disabledAccessoryCount']=sum(not item['availableInBuild'] for item in accessories)
result['limits']['maxRenderableAccessorySlots']=len(c['ACC_SLOTS'])
result['limits']['maxSerializedAccessorySlots']=12
result['provenance']['notes'].extend(['Supporter.ENABLED=false in this build; no developer supporter flag is enabled. Four supporter resources are retained as disabled catalog records, not wearable choices.','CharacterConfig sanitizes up to 12 serialized accessory entries, but ModelRig.set_accessories only renders the standard nine ACC_SLOTS (model_rig.gd:3922-3930).'])
result['provenance']['notes']=[note for note in result['provenance']['notes'] if not note.startswith('Uniform pattern labels')]
# Preserve only thumbnails tied to an audited publish manifest and matching bytes.
thumbnail_manifest=ROOT/'data/locker-thumbnail-manifest.json'
if thumbnail_manifest.exists():
    for entry in json.loads(thumbnail_manifest.read_text(encoding='utf-8'))['items']:
        path=ROOT/'public'/entry['image'].lstrip('/')
        if path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest()==entry['imageSha256']:
            table=result['hair' if entry['kind']=='hair' else 'facialHair' if entry['kind']=='beard' else 'kitStyles']
            for row in table:
                if str(row['value'] if entry['kind']=='kit' else row['id'])==entry['id']: row['image']=entry['image']
            if entry['kind']=='kit':
                for field in fields:
                    if field['key']=='kst':
                        for row in field['options']:
                            if str(row['value'])==entry['id']: row['image']=entry['image']
assert len(hair)==84 and len(beards)==8 and len(accessories)==76
assert len({f['key'] for f in fields})==len(fields)
for group in faces.values():
    for item in group:
        if item.get('image'): assert (ROOT/'public'/item['image'].lstrip('/')).is_file(),item
(ROOT/'data/locker-catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Locker catalog: {len(hair)-1} hair models, {len(beards)-1} facial hair models, {len(accessories)} accessories, {len(fields)} controls.')
