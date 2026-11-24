"""Publish complete original Studio PNG resources without resizing or conversion."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('D:/wh/202611/just volleyball/解包文件/recovered_project')
catalog=json.loads((ROOT/'data/extracted-assets.json').read_text(encoding='utf-8'))
groups={g['id']:g for g in catalog['groups']}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
result={}
for group,items in [('patterns',groups['patterns']['items']),('stickers',catalog['studioStickers']['items'])]:
    rows=[]
    for item in items:
        id=item['id'];assert id.replace('_','').isalnum()
        source=SOURCE/item['sourcePath']
        image=f'/images/locker/{group}/{id}.png'
        target=ROOT/'public'/image.lstrip('/')
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source,target)
        source_hash=sha(source);target_hash=sha(target)
        assert source_hash==target_hash
        with Image.open(source) as im: width,height=im.size
        with Image.open(target) as im: assert im.size==(width,height)
        rows.append({'id':id,'name':item['name'],'image':image,'width':width,'height':height,'sourcePath':item['sourcePath'],'sourceSha256':source_hash,'imageSha256':target_hash})
    result[group]=rows
assert len(result['patterns'])==84 and len(result['stickers'])==4
result['provenance']={'method':'Byte-identical original PNG copies; no resizing or image conversion','sourceRoot':str(SOURCE),'gameVersion':'1.0.3','stickerMenuSource':'game/character/studio/locker_studio.gd:81-90','patternSource':'game/character/studio/patterns/'}
(ROOT/'data/locker-studio-assets.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Published and hash-verified {len(result["patterns"])} original patterns and {len(result["stickers"])} original stickers.')
