"""Publish only successfully rendered original-engine Locker thumbnails.

Usage: python scripts/publish-locker-thumbnails.py PATH_TO_CATALOG_RESULT_JSON
Multiple partial batches are supported; existing unrelated image entries remain.
"""
from pathlib import Path
import sys,json,hashlib
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('D:/wh/202611/just volleyball/解包文件/recovered_project')
result_path=Path(sys.argv[1]).resolve()
result=json.loads(result_path.read_text(encoding='utf-8'))
catalog_path=ROOT/'data/locker-catalog.json'
catalog=json.loads(catalog_path.read_text(encoding='utf-8'))
manifest_path=ROOT/'data/locker-thumbnail-manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {'method':result['method'],'preset':'head','items':[]}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for previous in manifest['items']:
    previous.setdefault('driverSha256', manifest.get('driverSha256'))
    previous.setdefault('preset', manifest.get('preset', 'head'))
published=[]
for item in result['items']:
    kind=item['kind']; id=item['id']
    assert kind in ['hair','beard','kit'] and (not id or id.replace('_','').replace('-','').isalnum())
    source=result_path.parent/'thumbs'/item['file']
    with Image.open(source) as image:
        assert image.mode=='RGBA' and image.size==(item['width'],item['height'])
        bounds=image.getchannel('A').getbbox()
        assert bounds and bounds[2]-bounds[0]>=8 and bounds[3]-bounds[1]>=8
        slug=id or ('bald' if kind=='hair' else 'none')
        path=f'/images/locker/{kind}/{slug}.webp'
        target=ROOT/'public'/path.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
        image.save(target,'WEBP',lossless=True)
    table=catalog['hair' if kind=='hair' else 'facialHair' if kind=='beard' else 'kitStyles']
    record=next(x for x in table if str(x['value'] if kind=='kit' else x['id'])==id)
    record['image']=path
    if kind=='kit':
        for field in catalog['fields']:
            if field['key']=='kst':
                next(x for x in field['options'] if str(x['value'])==id)['image']=path
    model=SOURCE/f'.assets/game/character/{"hair" if kind=="hair" else "facial_hair"}/{id}.glb' if id and kind!='kit' else None
    entry={'kind':kind,'id':id,'image':path,'width':item['width'],'height':item['height'],'alphaBounds':bounds,'pngSha256':sha(source),'imageSha256':sha(target),'engine':result['engine'],'config':item['config'],'sourceModel':model.relative_to(SOURCE).as_posix() if model else None,'sourceModelSha256':sha(model) if model else None,'playerModelSha256':sha(SOURCE/'.assets/game/character/models/player_char.glb')}
    manifest['items']=[x for x in manifest['items'] if not (x['kind']==kind and x['id']==id)]+[entry]
    entry['preset']=result['preset']
    entry['driverSha256']=sha(ROOT/'artifacts/locker-engine/locker-driver.gd')
    published.append(path)
manifest['driverSha256']=sha(ROOT/'artifacts/locker-engine/locker-driver.gd')
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Published {len(published)} checked original-engine thumbnails; {len(manifest["items"])} total.')
