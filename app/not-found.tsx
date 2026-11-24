import { PageIntro, Panel } from "@/components/shared";
export default function NotFound() {
  return (
    <Panel>
      <PageIntro
        title="That ball went out."
        description="We could not find this page. Try the skin library or return to the homepage."
      />
      <p>
        <a href="/">Back to home</a> · <a href="/skins/">Browse skins</a> ·{" "}
        <a href="/guides/">Read guides</a>
      </p>
    </Panel>
  );
}
