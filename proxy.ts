import { NextResponse, type NextRequest } from "next/server";
import pages from "@/seo/page-dates.json";
import { guideRedirects } from "@/data/guides";
import updates from "@/data/updates.json";

const known=new Set([...Object.keys(pages),"/sources/","/about/","/contact/","/privacy-policy/","/disclaimer/","/demo/","/release-date/","/character-codes/","/tools/code-checker/","/tools/player-count/",...Object.keys(guideRedirects).map(slug=>`/guides/${slug}/`),...updates.map(u=>`/updates/${u.slug}/`)]);
export function proxy(request:NextRequest){
  const pathname=request.nextUrl.pathname.replace(/\/$/,"")+"/";
  if(known.has(pathname))return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found",request.url),{status:404});
}
export const config={matcher:["/((?!api(?:/|$)|_next(?:/|$)|.*\\.).*)"]};
