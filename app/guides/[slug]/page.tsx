import pageDates from "@/seo/page-dates.json";
import Image from "next/image";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { guides, findGuide } from "@/lib/content";
import { controlRows, guideRedirects } from "@/data/guides";
import { metadata as makeMetadata, siteUrl, dateLabel } from "@/lib/site";
import { Breadcrumbs, JsonLd, Faq } from "@/components/shared";
import styles from "@/styles/guides.module.css";

export function generateStaticParams() {
  return [...guides.map(guide=>({slug:guide.slug})),...Object.keys(guideRedirects).map(slug=>({slug}))];
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const guide=findGuide(slug);
  return guide ? makeMetadata(guide.seo.title,guide.seo.description,`/guides/${guide.slug}/`) : {};
}
export default function Page(props:{params:Promise<{slug:string}>}) {
  return <Suspense fallback={<p role="status">Loading guide…</p>}><Article {...props}/></Suspense>;
}
async function Article({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  if(guideRedirects[slug]) redirect(`/guides/${guideRedirects[slug]}/`);
  const guide=findGuide(slug);
  if(!guide) notFound();
  const modified = pageDates[`/guides/${guide.slug}/` as keyof typeof pageDates]?.lastModified;
  return <>
    <Breadcrumbs items={[{name:"Guides",href:"/guides/"},{name:guide.shortTitle,href:`/guides/${guide.slug}/`}]}/>
    <header className={styles.articleHero}>
      <div><p className={styles.category}>{guide.category}</p><h1>{guide.title}</h1><p>{guide.description}</p><span className={styles.date}>Updated {modified ? dateLabel(modified) : "November 24, 2026"}</span></div>
      <Image src={guide.image} alt={`${guide.shortTitle} — Just Volleyball game view`} width={1920} height={1080} sizes="(max-width:900px) 90vw, 560px" loading="eager"/>
    </header>
    <div className={styles.articleLayout}>
      <aside className={styles.contents}><h2>In this guide</h2><nav aria-label="Table of contents">{guide.sections.map((section,index)=><a href={`#section-${index}`} key={section.heading}>{section.heading}</a>)}<a href="#questions">Frequently asked questions</a></nav><a className={styles.back} href="/guides/">← All guides</a></aside>
      <article className={styles.article}>
        <p className={styles.context}>{guide.status}</p>
        {guide.sections.map((section,index)=><section id={`section-${index}`} key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
          {guide.slug==="controls"&&index===0&&<div className={styles.table}><table><thead><tr><th>Input</th><th>Default action</th></tr></thead><tbody>{controlRows.map(([input,action])=><tr key={input}><td>{input}</td><td>{action}</td></tr>)}</tbody></table></div>}
          {section.steps&&<ol>{section.steps.map(step=><li key={step}>{step}</li>)}</ol>}
          {section.table && <div className={styles.table}><table>
            <caption>{section.table.caption}</caption>
            <thead><tr>{section.table.headings.map(heading => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
            <tbody>{section.table.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0
              ? <th key={index} scope="row">{cell}</th>
              : <td key={index}>{cell}</td>)}</tr>)}</tbody>
          </table></div>}
          {section.image && <figure className={styles.figure}>
            <Image src={section.image.src} alt={section.image.alt}
              width={section.image.src.endsWith("character-profile.png") ? 1763 : 1920}
              height={section.image.src.endsWith("character-profile.png") ? 910 : 1080}
              sizes="(max-width:760px) 86vw, (max-width:1200px) 65vw, 950px" />
            <figcaption>{section.image.caption}</figcaption>
          </figure>}
        </section>)}
        <section id="questions"><Faq items={guide.faq}/></section>
        <div className={styles.actions}><a href="/updates/">Read game updates →</a>{guide.slug==="demo"?<a href="/tools/locker/">Explore outfits →</a>:<a href="/characters/">Explore your player →</a>}</div>
      </article>
    </div>
    <section className={styles.topic}><h2>Keep exploring</h2><div className={styles.related}>{guide.related.map(slug=>{const other=findGuide(slug);return other&&<a href={`/guides/${slug}/`} key={slug}><h3>{other.shortTitle}</h3><p>{other.description}</p><span>Read guide →</span></a>;})}</div></section>
    <JsonLd data={{"@context":"https://schema.org","@type":"Article",headline:guide.title,description:guide.description,dateModified:modified,mainEntityOfPage:siteUrl+`/guides/${guide.slug}/`,image:siteUrl+guide.image,author:{"@type":"Organization",name:"Just Volleyball",url:siteUrl+"/about/"}}}/>
  </>;
}
