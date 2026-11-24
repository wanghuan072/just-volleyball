import Image from "next/image";
import type { Skin } from "@/lib/content";
import styles from "@/styles/site.module.css";
export function PortraitImage({skin, fitStage = false}:{skin:Skin; fitStage?: boolean}){
  const [left,top,right,bottom]=skin.render.alphaBounds;
  const width=right-left,height=bottom-top;
  return <div className={styles.portraitFrame}><div className={styles.portraitCrop} style={{
    aspectRatio: `${width} / ${height}`,
    ...(fitStage ? { height: "90%", width: "auto", maxWidth: "90%" } : {}),
  }}>
    <Image src={skin.image} alt={`${skin.name} community outfit preview for Just Volleyball`} width={skin.render.width} height={skin.render.height} unoptimized style={{position:"absolute",width:`${skin.render.width/width*100}%`,height:`${skin.render.height/height*100}%`,left:`${-left/width*100}%`,top:`${-top/height*100}%`,maxWidth:"none",objectFit:"fill"}} />
  </div></div>;
}
