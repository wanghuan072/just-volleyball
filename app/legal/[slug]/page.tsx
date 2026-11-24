import { notFound } from "next/navigation";
import { Suspense } from "react";
import pages from "@/data/legal.json";
import { metadata as makeMetadata } from "@/lib/site";
import { Breadcrumbs, Panel, PageIntro } from "@/components/shared";
import styles from "@/styles/site.module.css";

export function generateStaticParams() {
  return Object.keys(pages).map(slug => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  return page ? makeMetadata(page.title, page.intro, `/legal/${slug}/`) : {};
}
export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<p role="status">Loading page…</p>}><LegalPage {...props}/></Suspense>;
}
async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();
  return <>
    <Breadcrumbs items={[{ name: page.title, href: `/legal/${slug}/` }]} />
    <PageIntro title={page.title} description={page.intro}/>
    <Panel className={styles.article}>
      <p>Last updated November 24, 2026</p>
      {page.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(text => <p key={text}>{text}</p>)}</section>)}
      <p>Contact <a href="mailto:support@justvolleyball.app">support@justvolleyball.app</a>.</p>
    </Panel>
  </>;
}
